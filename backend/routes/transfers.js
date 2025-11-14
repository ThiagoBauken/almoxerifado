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

    // Filtro por organização (sempre)
    query += ` AND i.organization_id = $${paramIndex}`;
    params.push(req.user.organization_id);
    paramIndex++;

    // Se NÃO for admin/gestor/almoxarife, filtrar apenas suas transferências
    if (!['admin', 'gestor', 'almoxarife'].includes(req.user.perfil)) {
      query += ` AND (t.de_usuario_id = $${paramIndex} OR t.para_usuario_id = $${paramIndex})`;
      params.push(req.user.id);
      paramIndex++;
    }

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
    // para_usuario_id é opcional agora - pode ser devolução ao estoque
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
        devolver_estoque, // Novo campo para indicar devolução ao estoque
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
      // Permitir: disponivel, disponivel_estoque, com_funcionario
      // Bloquear: em_manutencao, perdido, pendente_aceitacao, em_transito, etc.
      const estadosPermitidos = ['disponivel', 'disponivel_estoque', 'com_funcionario'];

      if (!estadosPermitidos.includes(item.estado)) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Item não pode ser transferido (estado: ${item.estado})`,
        });
      }

      // DEVOLUÇÃO AO ESTOQUE - Notifica todos almoxarife/gestor/admin
      if (devolver_estoque === true) {
        // Buscar TODOS os usuários que podem aprovar (almoxarife, gestor, admin)
        const aprovadoresResult = await client.query(
          `SELECT id, nome, perfil FROM users
           WHERE perfil IN ('almoxarife', 'gestor', 'admin')
           AND organization_id = $1`,
          [req.user.organization_id]
        );

        if (aprovadoresResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: 'Não há almoxarifes, gestores ou admins disponíveis para aprovar',
          });
        }

        // Criar transferência pendente de devolução (sem destinatário específico)
        const transferResult = await client.query(
          `INSERT INTO transfers (
            item_id, tipo, de_usuario_id, para_usuario_id,
            de_localizacao, para_localizacao, status,
            assinatura_remetente, foto_comprovante, motivo, observacoes
          )
          VALUES ($1, 'devolucao', $2, NULL, $3, 'estoque', 'pendente', $4, $5, $6, $7)
          RETURNING *`,
          [
            item_id,
            de_usuario_id,
            de_localizacao,
            assinatura_remetente,
            foto_comprovante,
            motivo || 'Devolução ao estoque',
            observacoes,
          ]
        );

        const transfer = transferResult.rows[0];

        // Atualizar item para pendente_aceitacao
        await client.query(
          `UPDATE items
           SET estado = 'pendente_aceitacao',
               localizacao_tipo = 'em_transito',
               updated_at = NOW()
           WHERE id = $1`,
          [item_id]
        );

        // Criar notificação para TODOS os aprovadores (incluindo quem está enviando)
        for (const aprovador of aprovadoresResult.rows) {
          await createNotification(client, {
            user_id: aprovador.id,
            tipo: 'transfer_received',
            titulo: 'Devolução ao Estoque Pendente',
            mensagem: `${item.nome} aguarda aprovação para retornar ao estoque. Acesse para aceitar ou rejeitar.`,
            reference_type: 'transfer',
            reference_id: transfer.id,
            link: `/notifications`,
          });
        }

        await client.query('COMMIT');

        return res.status(201).json({
          success: true,
          message: `Devolução enviada para aprovação de ${aprovadoresResult.rows.length} ${aprovadoresResult.rows.length === 1 ? 'responsável' : 'responsáveis'}`,
          data: transfer,
        });
      }

      // TRANSFERÊNCIA NORMAL PARA OUTRO USUÁRIO
      if (!para_usuario_id) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Destinatário é obrigatório para transferências',
        });
      }

      // Verificar se é ADMIN transferindo item de OUTRO funcionário
      const isAdminTransfer =
        ['admin', 'gestor', 'almoxarife'].includes(req.user.perfil) &&
        item.funcionario_id &&
        item.funcionario_id !== req.user.id;

      // Status inicial: automático para admins, pendente para funcionários
      const initialStatus = isAdminTransfer ? 'concluida' : 'pendente';

      // Criar transferência
      const transferResult = await client.query(
        `INSERT INTO transfers (
          item_id, tipo, de_usuario_id, para_usuario_id,
          de_localizacao, para_localizacao, status,
          assinatura_remetente, assinatura_destinatario,
          foto_comprovante, motivo, observacoes,
          data_aceitacao
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          item_id,
          tipo,
          de_usuario_id,
          para_usuario_id,
          de_localizacao,
          para_localizacao,
          initialStatus,
          assinatura_remetente,
          isAdminTransfer ? `Transferência automática por ${req.user.nome} (Admin)` : null,
          foto_comprovante,
          motivo,
          isAdminTransfer
            ? `Transferência administrativa - Item retirado de ${item.funcionario_nome || 'funcionário'}. ${observacoes || ''}`
            : observacoes,
          isAdminTransfer ? new Date() : null,
        ]
      );

      const transfer = transferResult.rows[0];

      if (isAdminTransfer) {
        // ADMIN TRANSFERINDO - Automático, item vai direto para o destinatário
        await client.query(
          `UPDATE items
           SET estado = 'com_funcionario',
               funcionario_id = $1,
               localizacao_tipo = 'funcionario',
               updated_at = NOW()
           WHERE id = $2`,
          [para_usuario_id, item_id]
        );

        // Notificar o funcionário que teve o item retirado
        if (item.funcionario_id) {
          await createNotification(client, {
            user_id: item.funcionario_id,
            tipo: 'admin_transfer',
            titulo: 'Item Transferido por Administrador',
            mensagem: `O item ${item.nome} foi transferido administrativamente por ${req.user.nome}.`,
            reference_type: 'transfer',
            reference_id: transfer.id,
            link: `/notifications`,
          });
        }

        // Notificar o destinatário
        await createNotification(client, {
          user_id: para_usuario_id,
          tipo: 'transfer_received',
          titulo: 'Item Transferido para Você',
          mensagem: `${req.user.nome} transferiu o item ${item.nome} para você.`,
          reference_type: 'transfer',
          reference_id: transfer.id,
          link: `/notifications`,
        });

        await client.query('COMMIT');

        return res.status(201).json({
          success: true,
          message: 'Transferência administrativa realizada com sucesso',
          data: transfer,
        });
      } else {
        // TRANSFERÊNCIA NORMAL - Pendente de aprovação
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

        return res.status(201).json({
          success: true,
          message: 'Transferência criada com sucesso',
          data: transfer,
        });
      }
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

    // Atualizar transferência (registrar quem respondeu como para_usuario_id)
    await client.query(
      `UPDATE transfers
       SET status = $1,
           data_aceitacao = NOW(),
           para_usuario_id = $2,
           assinatura_destinatario = $3,
           foto_comprovante = COALESCE($4, foto_comprovante),
           observacoes = COALESCE($5, observacoes),
           updated_at = NOW()
       WHERE id = $6`,
      [newStatus, req.user.id, assinatura_destinatario, foto_comprovante, observacoes, id]
    );

    // IMPORTANTE: Deletar todas as notificações relacionadas a esta transferência
    // para que os outros aprovadores não vejam mais a notificação
    await client.query(
      `DELETE FROM notifications
       WHERE reference_type = 'transfer'
       AND reference_id = $1`,
      [id]
    );

    // Atualizar item
    if (accepted) {
      // Verificar se é uma DEVOLUÇÃO AO ESTOQUE
      if (transfer.tipo === 'devolucao' && transfer.para_localizacao === 'estoque') {
        // Aceito - item vai para o estoque (não para o destinatário)
        await client.query(
          `UPDATE items
           SET estado = 'disponivel_estoque',
               localizacao_tipo = 'almoxarifado',
               funcionario_id = NULL,
               updated_at = NOW()
           WHERE id = $1`,
          [transfer.item_id]
        );
      } else {
        // Aceito - transferência normal, mover item para destinatário
        await client.query(
          `UPDATE items
           SET estado = 'com_funcionario',
               localizacao_tipo = 'funcionario',
               funcionario_id = $1,
               updated_at = NOW()
           WHERE id = $2`,
          [transfer.para_usuario_id, transfer.item_id]
        );
      }
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

// ==================== CANCELAR TRANSFERÊNCIA (ADMIN) ====================

router.delete('/:id', async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { motivo } = req.body;

    // Verificar se é admin/gestor/almoxarife
    if (!['admin', 'gestor', 'almoxarife'].includes(req.user.perfil)) {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores, gestores e almoxarifes podem cancelar transferências',
      });
    }

    await client.query('BEGIN');

    // Buscar transferência
    const transferResult = await client.query(
      `SELECT t.*, i.nome as item_nome, i.estado, i.funcionario_id
       FROM transfers t
       LEFT JOIN items i ON t.item_id = i.id
       WHERE t.id = $1 AND i.organization_id = $2`,
      [id, req.user.organization_id]
    );

    if (transferResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Transferência não encontrada',
      });
    }

    const transfer = transferResult.rows[0];

    // Não permitir cancelar transferências já concluídas ou canceladas
    if (transfer.status === 'concluida') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Não é possível cancelar uma transferência já concluída',
      });
    }

    if (transfer.status === 'cancelada') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Esta transferência já está cancelada',
      });
    }

    // Atualizar status da transferência
    await client.query(
      `UPDATE transfers
       SET status = 'cancelada',
           observacoes = COALESCE(observacoes || ' | ', '') || $1,
           updated_at = NOW()
       WHERE id = $2`,
      [motivo || `Cancelada por ${req.user.nome}`, id]
    );

    // Se o item está pendente ou em trânsito, devolver ao remetente
    if (transfer.status === 'pendente' || transfer.status === 'em_andamento') {
      // Verificar se é devolução ao estoque
      if (transfer.tipo === 'devolucao' && transfer.para_localizacao === 'estoque') {
        // Item continua com quem estava tentando devolver
        await client.query(
          `UPDATE items
           SET estado = 'com_funcionario',
               updated_at = NOW()
           WHERE id = $1`,
          [transfer.item_id]
        );
      } else {
        // Transferência normal - item volta pro remetente
        await client.query(
          `UPDATE items
           SET estado = 'com_funcionario',
               funcionario_id = $1,
               updated_at = NOW()
           WHERE id = $2`,
          [transfer.de_usuario_id, transfer.item_id]
        );
      }
    }

    // Deletar notificações relacionadas
    await client.query(
      `DELETE FROM notifications
       WHERE reference_type = 'transfer'
       AND reference_id = $1`,
      [id]
    );

    // Notificar remetente sobre cancelamento
    if (transfer.de_usuario_id) {
      await createNotification(client, {
        user_id: transfer.de_usuario_id,
        tipo: 'transfer_cancelled',
        titulo: 'Transferência Cancelada',
        mensagem: `A transferência de ${transfer.item_nome} foi cancelada por ${req.user.nome}. ${motivo ? `Motivo: ${motivo}` : ''}`,
        reference_type: 'transfer',
        reference_id: id,
        link: `/notifications`,
      });
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Transferência cancelada com sucesso',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao cancelar transferência:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao cancelar transferência',
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
