const express = require('express');
const pool = require('../database/config');
const { authMiddleware } = require('./auth');

const router = express.Router();
router.use(authMiddleware);

// ==================== LISTAR CATEGORIAS ====================

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories WHERE organization_id = $1 ORDER BY nome',
      [req.user.organization_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar categorias' });
  }
});

// ==================== BUSCAR CATEGORIA POR ID ====================

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM categories WHERE id = $1 AND organization_id = $2',
      [id, req.user.organization_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar categoria',
    });
  }
});

// ==================== CRIAR CATEGORIA ====================

router.post('/', async (req, res) => {
  try {
    const { nome, icone } = req.body;

    if (!nome) {
      return res.status(400).json({
        success: false,
        message: 'Nome é obrigatório',
      });
    }

    const result = await pool.query(
      `INSERT INTO categories (nome, icone, organization_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nome, icone || '📦', req.user.organization_id]
    );

    res.status(201).json({
      success: true,
      message: 'Categoria criada com sucesso',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar categoria',
    });
  }
});

// ==================== ATUALIZAR CATEGORIA ====================

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, icone } = req.body;

    const result = await pool.query(
      `UPDATE categories
       SET nome = COALESCE($1, nome),
           icone = COALESCE($2, icone),
           updated_at = NOW()
       WHERE id = $3 AND organization_id = $4
       RETURNING *`,
      [nome, icone, id, req.user.organization_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada',
      });
    }

    res.json({
      success: true,
      message: 'Categoria atualizada com sucesso',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar categoria',
    });
  }
});

// ==================== DELETAR CATEGORIA ====================

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se há itens com esta categoria
    const itemsCheck = await pool.query(
      'SELECT COUNT(*) FROM items WHERE categoria_id = $1',
      [id]
    );

    if (parseInt(itemsCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar categoria com itens associados',
      });
    }

    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 AND organization_id = $2 RETURNING *',
      [id, req.user.organization_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada',
      });
    }

    res.json({
      success: true,
      message: 'Categoria deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar categoria',
    });
  }
});

module.exports = router;
