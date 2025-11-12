const express = require('express');
const pool = require('../database/config');
const { authMiddleware } = require('./auth');

const router = express.Router();
router.use(authMiddleware);

// ==================== LISTAR LOCAIS DE ARMAZENAMENTO ====================

router.get('/', async (req, res) => {
  try {
    const { tipo, setor } = req.query;

    let query = 'SELECT * FROM locais_armazenamento WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (tipo) {
      query += ` AND tipo = $${paramIndex}`;
      params.push(tipo);
      paramIndex++;
    }

    if (setor) {
      query += ` AND setor ILIKE $${paramIndex}`;
      params.push(`%${setor}%`);
      paramIndex++;
    }

    query += ' ORDER BY codigo';

    const result = await pool.query(query, params);

    // Contar itens em cada local
    for (const local of result.rows) {
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM items WHERE local_armazenamento_id = $1',
        [local.id]
      );
      local.itens_count = parseInt(countResult.rows[0].count);
      local.disponibilidade = local.capacidade - local.itens_count;
    }

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Erro ao listar locais:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar locais de armazenamento',
    });
  }
});

// ==================== BUSCAR LOCAL POR ID ====================

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM locais_armazenamento WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Local não encontrado',
      });
    }

    const local = result.rows[0];

    // Buscar itens neste local
    const itemsResult = await pool.query(
      `SELECT i.*, c.nome as categoria_nome
       FROM items i
       LEFT JOIN categories c ON i.categoria_id = c.id
       WHERE i.local_armazenamento_id = $1
       ORDER BY i.nome`,
      [id]
    );

    local.itens = itemsResult.rows;
    local.itens_count = itemsResult.rows.length;
    local.disponibilidade = local.capacidade - local.itens_count;

    res.json({
      success: true,
      data: local,
    });
  } catch (error) {
    console.error('Erro ao buscar local:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar local',
    });
  }
});

// ==================== CRIAR LOCAL ====================

router.post('/', async (req, res) => {
  try {
    const { codigo, descricao, tipo, capacidade, setor, observacoes } = req.body;

    if (!codigo) {
      return res.status(400).json({
        success: false,
        message: 'Código é obrigatório',
      });
    }

    // Verificar se código já existe
    const exists = await pool.query(
      'SELECT id FROM locais_armazenamento WHERE codigo = $1',
      [codigo]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Código já cadastrado',
      });
    }

    const result = await pool.query(
      `INSERT INTO locais_armazenamento (codigo, descricao, tipo, capacidade, setor, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [codigo, descricao, tipo, capacidade, setor, observacoes]
    );

    res.status(201).json({
      success: true,
      message: 'Local criado com sucesso',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao criar local:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar local',
    });
  }
});

// ==================== ATUALIZAR LOCAL ====================

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, tipo, capacidade, setor, observacoes } = req.body;

    const result = await pool.query(
      `UPDATE locais_armazenamento
       SET descricao = COALESCE($1, descricao),
           tipo = COALESCE($2, tipo),
           capacidade = COALESCE($3, capacidade),
           setor = COALESCE($4, setor),
           observacoes = COALESCE($5, observacoes),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [descricao, tipo, capacidade, setor, observacoes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Local não encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Local atualizado com sucesso',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar local:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar local',
    });
  }
});

// ==================== DELETAR LOCAL ====================

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se há itens neste local
    const itemsCheck = await pool.query(
      'SELECT COUNT(*) FROM items WHERE local_armazenamento_id = $1',
      [id]
    );

    if (parseInt(itemsCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar local com itens',
      });
    }

    const result = await pool.query(
      'DELETE FROM locais_armazenamento WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Local não encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Local deletado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar local:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar local',
    });
  }
});

// ==================== ESTATÍSTICAS ====================

router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total_locais,
        SUM(capacidade) as capacidade_total,
        COUNT(DISTINCT tipo) as tipos_diferentes,
        COUNT(DISTINCT setor) as setores_diferentes
      FROM locais_armazenamento
    `);

    const ocupacao = await pool.query(`
      SELECT
        COUNT(DISTINCT i.local_armazenamento_id) as locais_ocupados
      FROM items i
      WHERE i.local_armazenamento_id IS NOT NULL
    `);

    const porTipo = await pool.query(`
      SELECT
        tipo,
        COUNT(*) as quantidade
      FROM locais_armazenamento
      GROUP BY tipo
      ORDER BY quantidade DESC
    `);

    res.json({
      success: true,
      data: {
        ...stats.rows[0],
        ...ocupacao.rows[0],
        por_tipo: porTipo.rows,
      },
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
