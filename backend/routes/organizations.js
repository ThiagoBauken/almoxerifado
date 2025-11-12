const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../database/config');
const { authMiddleware } = require('./auth');

const router = express.Router();

// ==================== CRIAR ORGANIZAÇÃO ====================

router.post(
  '/',
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('slug').notEmpty().withMessage('Slug é obrigatório'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { nome, slug, plano = 'free' } = req.body;

      // Verificar se slug já existe
      const existing = await pool.query(
        'SELECT id FROM organizations WHERE slug = $1',
        [slug]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Slug já está em uso',
        });
      }

      const result = await pool.query(
        `INSERT INTO organizations (nome, slug, plano)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [nome, slug, plano]
      );

      res.status(201).json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Erro ao criar organização:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar organização',
      });
    }
  }
);

// ==================== OBTER ORGANIZAÇÃO ====================

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM organizations WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Organização não encontrada',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao buscar organização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar organização',
    });
  }
});

// ==================== ATUALIZAR ORGANIZAÇÃO ====================

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, logo, configuracoes } = req.body;

    // Verificar se usuário pertence à organização e é admin
    const userOrg = await pool.query(
      'SELECT organization_id, perfil FROM users WHERE id = $1',
      [req.user.id]
    );

    if (
      userOrg.rows[0].organization_id != id ||
      !['admin', 'gestor'].includes(userOrg.rows[0].perfil)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para atualizar organização',
      });
    }

    const result = await pool.query(
      `UPDATE organizations
       SET nome = COALESCE($1, nome),
           logo = COALESCE($2, logo),
           configuracoes = COALESCE($3, configuracoes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [nome, logo, configuracoes ? JSON.stringify(configuracoes) : null, id]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar organização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar organização',
    });
  }
});

// ==================== LISTAR USUÁRIOS DA ORGANIZAÇÃO ====================

router.get('/:id/users', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se usuário pertence à organização
    const userOrg = await pool.query(
      'SELECT organization_id FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userOrg.rows[0].organization_id != id) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para listar usuários desta organização',
      });
    }

    const result = await pool.query(
      `SELECT id, nome, email, perfil, ativo, created_at
       FROM users
       WHERE organization_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar usuários',
    });
  }
});

module.exports = router;
