const express = require('express');
const { body, validationResult, query } = require('express-validator');
const pool = require('../database/config');
const { authMiddleware, requireAlmoxarife } = require('./auth');
const { registrarMovimentacao } = require('./movimentacoes');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// ==================== LISTAR ITENS ====================

router.get('/', async (req, res) => {
  try {
    const {
      estado,
      categoria_id,
      funcionario_id,
      obra_id,
      search,
      limit = 100,
      offset = 0,
      since, // Para sincronização incremental
    } = req.query;

    let query = `
      SELECT i.*, c.nome as categoria_nome, c.icone as categoria_icone,
             l.codigo as local_codigo, l.descricao as local_descricao, l.tipo as local_tipo,
             u.nome as funcionario_nome, o.nome as obra_nome
      FROM items i
      LEFT JOIN categories c ON i.categoria_id = c.id
      LEFT JOIN locais_armazenamento l ON i.local_armazenamento_id = l.id
      LEFT JOIN users u ON i.funcionario_id = u.id
      LEFT JOIN obras o ON i.obra_id = o.id
      WHERE i.organization_id = $1
    `;
    const params = [req.user.organization_id];
    let paramIndex = 2;

    // Filtros
    if (estado) {
      query += ` AND i.estado = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }

    if (categoria_id) {
      query += ` AND i.categoria_id = $${paramIndex}`;
      params.push(categoria_id);
      paramIndex++;
    }

    if (funcionario_id) {
      query += ` AND i.funcionario_id = $${paramIndex}`;
      params.push(funcionario_id);
      paramIndex++;
    }

    if (obra_id) {
      query += ` AND i.obra_id = $${paramIndex}`;
      params.push(obra_id);
      paramIndex++;
    }

    if (search) {
      query += ` AND (i.nome ILIKE $${paramIndex} OR i.lacre ILIKE $${paramIndex} OR i.codigo ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Sincronização incremental
    if (since) {
      query += ` AND i.updated_at > $${paramIndex}`;
      params.push(since);
      paramIndex++;
    }

    query += ` ORDER BY i.updated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Contar total
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM items WHERE organization_id = $1',
      [req.user.organization_id]
    );
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      meta: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + result.rows.length < total,
      },
    });
  } catch (error) {
    console.error('Erro ao listar itens:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar itens',
    });
  }
});

// ==================== BUSCAR ITEM POR ID ====================

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT i.*, c.nome as categoria_nome, c.icone as categoria_icone,
              u.nome as funcionario_nome, o.nome as obra_nome,
              l.codigo as local_codigo, l.descricao as local_descricao,
              l.tipo as local_tipo, l.setor as local_setor
       FROM items i
       LEFT JOIN categories c ON i.categoria_id = c.id
       LEFT JOIN users u ON i.funcionario_id = u.id
       LEFT JOIN obras o ON i.obra_id = o.id
       LEFT JOIN locais_armazenamento l ON i.local_armazenamento_id = l.id
       WHERE i.id = $1 AND i.organization_id = $2`,
      [id, req.user.organization_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar item',
    });
  }
});

// ==================== CRIAR ITEM ====================

router.post(
  '/',
  requireAlmoxarife, // Apenas almoxarife ou superior pode criar itens
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
  ],
  async (req, res) => {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const {
        lacre,
        codigo,
        nome,
        quantidade,
        categoria_id,
        estado,
        localizacao_tipo,
        localizacao_id,
        funcionario_id,
        obra_id,
        foto,
        qr_code,
        descricao,
        valor_unitario,
        data_aquisicao,
        local_armazenamento_id,
        // Novos campos da migration 017
        marca_modelo,
        metragem,
        unidade,
        estoque_minimo,
        quantidade_disponivel,
        data_saida,
        data_retorno,
        observacao,
      } = req.body;

      // Verificar limites do plano
      const orgCheck = await client.query(
        `SELECT o.max_itens, COUNT(i.id) as current_itens
         FROM organizations o
         LEFT JOIN items i ON i.organization_id = o.id
         WHERE o.id = $1
         GROUP BY o.id, o.max_itens`,
        [req.user.organization_id]
      );

      if (orgCheck.rows.length > 0) {
        const { max_itens, current_itens } = orgCheck.rows[0];
        if (parseInt(current_itens) >= max_itens) {
          await client.query('ROLLBACK');
          return res.status(403).json({
            success: false,
            message: `Limite de itens atingido (${max_itens}). Faça upgrade do seu plano.`,
            limit_reached: true,
            current: parseInt(current_itens),
            max: max_itens,
          });
        }
      }

      // Verificar se codigo já existe (se fornecido)
      if (codigo) {
        const codigoExists = await client.query(
          'SELECT id FROM items WHERE codigo = $1 AND organization_id = $2',
          [codigo, req.user.organization_id]
        );

        if (codigoExists.rows.length > 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: 'Código já cadastrado',
          });
        }
      }

      // Verificar se lacre já existe para a mesma categoria (se fornecido)
      if (lacre && categoria_id) {
        const lacreExists = await client.query(
          'SELECT id FROM items WHERE lacre = $1 AND categoria_id = $2 AND organization_id = $3',
          [lacre, categoria_id, req.user.organization_id]
        );

        if (lacreExists.rows.length > 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: 'Lacre já cadastrado para esta categoria',
          });
        }
      }

      // Se item tem lacre, quantidade deve ser 1 (item individual/único)
      let quantidadeFinal = quantidade || 0;
      if (lacre) {
        quantidadeFinal = 1;
      }

      // Helper: convert empty strings to null for UUID and numeric fields
      const toNullIfEmpty = (value) => (value === '' || value === undefined) ? null : value;

      const result = await client.query(
        `INSERT INTO items (
          lacre, codigo, nome, quantidade, categoria_id, estado, localizacao_tipo,
          localizacao_id, funcionario_id, obra_id, foto, qr_code,
          descricao, valor_unitario, data_aquisicao, local_armazenamento_id,
          marca_modelo, metragem, unidade, estoque_minimo, quantidade_disponivel,
          data_saida, data_retorno, observacao, organization_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
        RETURNING *`,
        [
          lacre || null,
          codigo || null,
          nome,
          quantidadeFinal,
          toNullIfEmpty(categoria_id),
          estado || 'disponivel_estoque',
          localizacao_tipo,
          toNullIfEmpty(localizacao_id),
          toNullIfEmpty(funcionario_id),
          toNullIfEmpty(obra_id), // Fix: convert empty string to null
          foto,
          qr_code,
          descricao,
          toNullIfEmpty(valor_unitario),
          toNullIfEmpty(data_aquisicao),
          toNullIfEmpty(local_armazenamento_id),
          marca_modelo,
          toNullIfEmpty(metragem),
          unidade || 'UN',
          estoque_minimo || 0,
          quantidade_disponivel || quantidadeFinal,
          toNullIfEmpty(data_saida),
          toNullIfEmpty(data_retorno),
          observacao,
          req.user.organization_id,
        ]
      );

      const item = result.rows[0];

      // Registrar movimentação de entrada
      await registrarMovimentacao(client, {
        item_id: item.id,
        usuario_id: req.user.id,
        tipo: 'entrada',
        quantidade: item.quantidade || 1,
        local_from_id: null,
        local_to_id: toNullIfEmpty(local_armazenamento_id),
        observacao: `Item criado - ${item.nome}`,
      });

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Item criado com sucesso',
        data: item,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao criar item:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar item',
      });
    } finally {
      client.release();
    }
  }
);

// ==================== ATUALIZAR ITEM ====================

router.put('/:id', requireAlmoxarife, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const updates = req.body;

    // Buscar item atual para comparar quantidade
    const itemAtual = await client.query(
      'SELECT * FROM items WHERE id = $1 AND organization_id = $2',
      [id, req.user.organization_id]
    );

    if (itemAtual.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado',
      });
    }

    const itemAntes = itemAtual.rows[0];

    // Helper: convert empty strings to null for UUID and numeric fields
    const toNullIfEmpty = (value) => (value === '' || value === undefined) ? null : value;

    // Fields that need empty string to null conversion
    const uuidFields = ['categoria_id', 'localizacao_id', 'funcionario_id', 'obra_id', 'local_armazenamento_id'];
    const numericFields = ['valor_unitario', 'metragem', 'quantidade', 'estoque_minimo', 'quantidade_disponivel'];
    const dateFields = ['data_aquisicao', 'data_saida', 'data_retorno'];

    // Construir query dinâmica
    const fields = Object.keys(updates);
    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(', ');
    const values = fields.map((field) => {
      // Apply toNullIfEmpty for UUID, numeric and date fields
      if (uuidFields.includes(field) || numericFields.includes(field) || dateFields.includes(field)) {
        return toNullIfEmpty(updates[field]);
      }
      return updates[field];
    });

    const result = await client.query(
      `UPDATE items
       SET ${setClause}, updated_at = NOW()
       WHERE id = $1 AND organization_id = $${values.length + 2}
       RETURNING *`,
      [id, ...values, req.user.organization_id]
    );

    const itemDepois = result.rows[0];

    // Se a quantidade foi alterada, registrar movimentação de ajuste
    if (updates.quantidade !== undefined && itemAntes.quantidade !== itemDepois.quantidade) {
      const diferencaQuantidade = itemDepois.quantidade - itemAntes.quantidade;
      await registrarMovimentacao(client, {
        item_id: id,
        usuario_id: req.user.id,
        tipo: 'ajuste',
        quantidade: Math.abs(diferencaQuantidade),
        local_from_id: toNullIfEmpty(itemAntes.local_armazenamento_id),
        local_to_id: toNullIfEmpty(itemDepois.local_armazenamento_id),
        observacao: `Ajuste de quantidade: ${itemAntes.quantidade} → ${itemDepois.quantidade} (${diferencaQuantidade > 0 ? '+' : ''}${diferencaQuantidade})`,
      });
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Item atualizado com sucesso',
      data: itemDepois,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar item:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar item',
    });
  } finally {
    client.release();
  }
});

// ==================== DELETAR ITEM ====================

router.delete('/:id', requireAlmoxarife, async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Verificar se item existe e pertence à organização
    const itemCheck = await client.query(
      'SELECT * FROM items WHERE id = $1 AND organization_id = $2',
      [id, req.user.organization_id]
    );

    if (itemCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado',
      });
    }

    const item = itemCheck.rows[0];

    // Registrar movimentação de exclusão ANTES de deletar o item
    await registrarMovimentacao(client, {
      item_id: id,
      usuario_id: req.user.id,
      tipo: 'exclusao',
      quantidade: 1,
      local_from_id: null,
      local_to_id: null,
      observacao: `Item "${item.nome}" (${item.lacre || 'sem lacre'}) excluído por ${req.user.nome}`,
    });

    // Deletar item - transferências relacionadas terão item_id = NULL automaticamente
    // graças ao ON DELETE SET NULL na foreign key (migration 022)
    const result = await client.query(
      'DELETE FROM items WHERE id = $1 RETURNING *',
      [id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Item deletado com sucesso',
      data: result.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao deletar item:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar item: ' + error.message,
    });
  } finally {
    client.release();
  }
});

// ==================== ESTATÍSTICAS ====================

router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total_itens,
        COUNT(*) FILTER (WHERE estado = 'disponivel_estoque') as itens_disponiveis,
        COUNT(*) FILTER (WHERE estado = 'com_funcionario') as itens_em_uso,
        COUNT(*) FILTER (WHERE estado = 'em_manutencao') as itens_em_manutencao,
        COUNT(*) FILTER (WHERE estado = 'pendente_aceitacao') as itens_pendentes
      FROM items
      WHERE organization_id = $1
    `, [req.user.organization_id]);

    res.json({
      success: true,
      data: stats.rows[0],
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
    });
  }
});

module.exports = router;
