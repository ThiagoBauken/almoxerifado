const express = require('express');
const pool = require('../database/config');
const { authMiddleware } = require('./auth');

const router = express.Router();
router.use(authMiddleware);

// ==================== LISTAR OBRAS ====================

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.nome as responsavel_nome
       FROM obras o
       LEFT JOIN users u ON o.responsavel_id = u.id
       WHERE o.organization_id = $1
       ORDER BY o.nome`,
      [req.user.organization_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erro ao listar obras:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar obras' });
  }
});

// ==================== BUSCAR OBRA POR ID ====================

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT o.*, u.nome as responsavel_nome
       FROM obras o
       LEFT JOIN users u ON o.responsavel_id = u.id
       WHERE o.id = $1 AND o.organization_id = $2`,
      [id, req.user.organization_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Obra não encontrada',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao buscar obra:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar obra',
    });
  }
});

// ==================== CRIAR OBRA ====================

router.post('/', async (req, res) => {
  try {
    const { nome, endereco, status, responsavel_id, data_inicio, data_conclusao, observacoes } = req.body;

    if (!nome) {
      return res.status(400).json({
        success: false,
        message: 'Nome é obrigatório',
      });
    }

    const result = await pool.query(
      `INSERT INTO obras (nome, endereco, status, responsavel_id, data_inicio, data_conclusao, observacoes, organization_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [nome, endereco, status || 'ativa', responsavel_id, data_inicio, data_conclusao, observacoes, req.user.organization_id]
    );

    res.status(201).json({
      success: true,
      message: 'Obra criada com sucesso',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao criar obra:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar obra',
    });
  }
});

// ==================== ATUALIZAR OBRA ====================

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, endereco, status, responsavel_id, data_inicio, data_conclusao, observacoes } = req.body;

    const result = await pool.query(
      `UPDATE obras
       SET nome = COALESCE($1, nome),
           endereco = COALESCE($2, endereco),
           status = COALESCE($3, status),
           responsavel_id = COALESCE($4, responsavel_id),
           data_inicio = COALESCE($5, data_inicio),
           data_conclusao = COALESCE($6, data_conclusao),
           observacoes = COALESCE($7, observacoes),
           updated_at = NOW()
       WHERE id = $8 AND organization_id = $9
       RETURNING *`,
      [nome, endereco, status, responsavel_id, data_inicio, data_conclusao, observacoes, id, req.user.organization_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Obra não encontrada',
      });
    }

    res.json({
      success: true,
      message: 'Obra atualizada com sucesso',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar obra:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar obra',
    });
  }
});

// ==================== DELETAR OBRA ====================

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM obras WHERE id = $1 AND organization_id = $2 RETURNING *',
      [id, req.user.organization_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Obra não encontrada',
      });
    }

    res.json({
      success: true,
      message: 'Obra deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar obra:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar obra',
    });
  }
});

module.exports = router;
