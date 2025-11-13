const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../database/config');
const { authMiddleware } = require('./auth');
const { createNotification } = require('./notifications');

const router = express.Router();
router.use(authMiddleware);

// ==================== LISTAR TRANSFERÊNCIAS ====================

router.get('/', async (req, res) => {
  try {
    const { status, usuario_id, limit = 50, offset = 0, since } = req.query;

    let query = `
      SELECT t.*,
             i.nome as item_nome, i.lacre as item_lacre,
             u1.nome as de_usuario_nome, u2.nome as para_usuario_nome
      FROM transfers t
      LEFT JOIN items i ON t.item_id = i.id
      LEFT JOIN users u1 ON t.de_usuario_id = u1.id
      LEFT JOIN users u2 ON t.para_usuario_id = u2.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Filtros
    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (usuario_id) {
      query += ` AND (t.de_usuario_id = $${paramIndex} OR t.para_usuario_id = $${paramIndex})`;
      params.push(usuario_id);
      paramIndex++;
    }

    // Sincronização incremental
    if (since) {
      query += ` AND t.updated_at > $${paramIndex}`;
      params.push(since);
      paramIndex++;
    }

    query += ` ORDER BY t.data_envio DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Erro ao listar transferências:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar transferências',
    });
  }
});

// ==================== CRIAR TRANSFERÊNCIA ====================

router.post(
  '/',
  [
    body('item_id').notEmpty().withMessage('Item ID é obrigatório'),
    body('tipo')
      .isIn(['transferencia', 'manutencao', 'devolucao'])
      .withMessage('Tipo inválido'),
    body('de_usuario_id').notEmpty().withMessage('Usuário remetente é obrigatório'),
    body('para_usuario_id').notEmpty().withMessage('Usuário destinatário é obrigatório'),
  ],
  async (req, res) => {
    const client = await pool.connect();

    try {
      // Validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      await client.query('BEGIN');

      const {
        item_id,
        tipo,
        de_usuario_id,
        para_usuario_id,
        de_localizacao,
        para_localizacao,
        assinatura_remetente,
        foto_comprovante,
        motivo,
        observacoes,
      } = req.body;

      // Verificar se item existe e está disponível
      const itemCheck = await client.query(
        'SELECT * FROM items WHERE id = $1',
        [item_id]
      );

      if (itemCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Item não encontrado',
        });
      }

      const item = itemCheck.rows[0];

      // Verificar se item pode ser transferido
      if (
        item.estado !== 'disponivel_estoque' &&
        item.estado !== 'com_funcionario'
      ) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Item não pode ser transferido (estado: ${item.estado})`,
        });
      }

      // Criar transferência
      const transferResult = await client.query(
        `INSERT INTO transfers (
          item_id, tipo, de_usuario_id, para_usuario_id,
          de_localizacao, para_localizacao, status,
          assinatura_remetente, foto_comprovante, motivo, observacoes
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'pendente', $7, $8, $9, $10)
        RETURNING *`,
        [
          item_id,
          tipo,
          de_usuario_id,
          para_usuario_id,
          de_localizacao,
          para_localizacao,
          assinatura_remetente,
          foto_comprovante,
          motivo,
          observacoes,
        ]
      );

      const transfer = transferResult.rows[0];

      // Atualizar estado do item para "pendente_aceitacao"
      await client.query(
        `UPDATE items
         SET estado = 'pendente_aceitacao',
             localizacao_tipo = 'em_transito',
             updated_at = NOW()
         WHERE id = $1`,
        [item_id]
      );

      // Criar notificação para o destinatário
      await createNotification(client, {
        user_id: para_usuario_id,
        tipo: 'transfer_received',
        titulo: 'Nova Transferência Recebida',
        mensagem: `Você recebeu uma transferência do item ${item.nome}. Acesse para aceitar ou rejeitar.`,
        reference_type: 'transfer',
        reference_id: transfer.id,
        link: `/notifications`,
      });

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Transferência criada com sucesso',
        data: transfer,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao criar transferência:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar transferência',
      });
    } finally {
      client.release();
    }
  }
);

// ==================== ACEITAR/REJEITAR TRANSFERÊNCIA ====================

router.put('/:id/respond', async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { accepted, assinatura_destinatario, foto_comprovante, observacoes } =
      req.body;

    if (typeof accepted !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Campo "accepted" (true/false) é obrigatório',
      });
    }

    await client.query('BEGIN');

    // Buscar transferência
    const transferResult = await client.query(
      'SELECT * FROM transfers WHERE id = $1',
      [id]
    );

    if (transferResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Transferência não encontrada',
      });
    }

    const transfer = transferResult.rows[0];

    if (transfer.status !== 'pendente') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Transferência já foi ${transfer.status}`,
      });
    }

    const newStatus = accepted ? 'concluida' : 'cancelada';

    // Atualizar transferência
    await client.query(
      `UPDATE transfers
       SET status = $1,
           data_aceitacao = NOW(),
           assinatura_destinatario = $2,
           foto_comprovante = COALESCE($3, foto_comprovante),
           observacoes = COALESCE($4, observacoes),
           updated_at = NOW()
       WHERE id = $5`,
      [newStatus, assinatura_destinatario, foto_comprovante, observacoes, id]
    );

    // Atualizar item
    if (accepted) {
      // Aceito - mover item para destinatário
      await client.query(
        `UPDATE items
         SET estado = 'com_funcionario',
             localizacao_tipo = 'funcionario',
             funcionario_id = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [transfer.para_usuario_id, transfer.item_id]
      );
    } else {
      // Rejeitado - voltar item para remetente
      await client.query(
        `UPDATE items
         SET estado = 'com_funcionario',
             localizacao_tipo = 'funcionario',
             funcionario_id = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [transfer.de_usuario_id, transfer.item_id]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `Transferência ${accepted ? 'aceita' : 'rejeitada'} com sucesso`,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao responder transferência:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao responder transferência',
    });
  } finally {
    client.release();
  }
});

// ==================== TRANSFERÊNCIA EM LOTE (MÚLTIPLOS ITENS) ====================

router.post('/batch', async (req, res) => {
  const client = await pool.connect();

  try {
    const { item_ids, de_usuario_id, para_usuario_id, observacoes } = req.body;

    if (!Array.isArray(item_ids) || item_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'item_ids deve ser um array não vazio',
      });
    }

    await client.query('BEGIN');

    const transfers = [];

    for (const item_id of item_ids) {
      // Verificar item
      const itemCheck = await client.query(
        'SELECT * FROM items WHERE id = $1',
        [item_id]
      );

      if (itemCheck.rows.length === 0) {
        continue; // Pular item não encontrado
      }

      // Criar transferência
      const transferResult = await client.query(
        `INSERT INTO transfers (
          item_id, tipo, de_usuario_id, para_usuario_id,
          status, observacoes
        )
        VALUES ($1, 'transferencia', $2, $3, 'pendente', $4)
        RETURNING *`,
        [item_id, de_usuario_id, para_usuario_id, observacoes]
      );

      const transfer = transferResult.rows[0];
      transfers.push(transfer);

      // Atualizar item
      await client.query(
        `UPDATE items
         SET estado = 'pendente_aceitacao',
             localizacao_tipo = 'em_transito',
             updated_at = NOW()
         WHERE id = $1`,
        [item_id]
      );
    }

    // Criar notificação única para todas as transferências em lote
    if (transfers.length > 0) {
      await createNotification(client, {
        user_id: para_usuario_id,
        tipo: 'transfer_received',
        titulo: 'Novas Transferências Recebidas',
        mensagem: `Você recebeu ${transfers.length} transferências. Acesse para aceitar ou rejeitar.`,
        reference_type: 'transfer_batch',
        reference_id: null,
        link: `/notifications`,
      });
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: `${transfers.length} transferências criadas com sucesso`,
      data: transfers,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar transferências em lote:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar transferências em lote',
    });
  } finally {
    client.release();
  }
});

// ==================== HISTÓRICO DO ITEM ====================

router.get('/item/:item_id/history', async (req, res) => {
  try {
    const { item_id } = req.params;

    const result = await pool.query(
      `SELECT t.*,
              u1.nome as de_usuario_nome, u2.nome as para_usuario_nome
       FROM transfers t
       LEFT JOIN users u1 ON t.de_usuario_id = u1.id
       LEFT JOIN users u2 ON t.para_usuario_id = u2.id
       WHERE t.item_id = $1
       ORDER BY t.data_envio DESC`,
      [item_id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar histórico',
    });
  }
});

module.exports = router;
