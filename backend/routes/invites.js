const express = require('express');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const pool = require('../database/config');
const { authMiddleware } = require('./auth');

const router = express.Router();

// ==================== CRIAR CONVITE ====================

router.post(
  '/',
  authMiddleware,
  [
    body('perfil').isIn(['funcionario', 'almoxarife', 'gestor', 'admin']).withMessage('Perfil inválido'),
    body('max_uses').optional().isInt({ min: 1, max: 1000 }).withMessage('Número de usos deve ser entre 1 e 1000'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { perfil, max_uses = 1 } = req.body;

      // Buscar organização do usuário
      const userResult = await pool.query(
        'SELECT organization_id, perfil FROM users WHERE id = $1',
        [req.user.id]
      );

      if (!userResult.rows[0].organization_id) {
        return res.status(400).json({
          success: false,
          message: 'Usuário não pertence a nenhuma organização',
        });
      }

      const organization_id = userResult.rows[0].organization_id;

      // Verificar se usuário tem permissão (admin ou gestor)
      if (!['admin', 'gestor'].includes(userResult.rows[0].perfil)) {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para convidar usuários',
        });
      }

      // Gerar token único (16 bytes = 32 caracteres hex)
      const token = crypto.randomBytes(16).toString('hex');

      // Criar convite (expira em 30 dias para convites multi-uso)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const result = await pool.query(
        `INSERT INTO invites (organization_id, perfil, token, invited_by, expires_at, max_uses, current_uses)
         VALUES ($1, $2, $3, $4, $5, $6, 0)
         RETURNING *`,
        [organization_id, perfil, token, req.user.id, expiresAt, max_uses]
      );

      const invite = result.rows[0];

      res.status(201).json({
        success: true,
        data: invite,
        inviteLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${token}`,
      });
    } catch (error) {
      console.error('Erro ao criar convite:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar convite',
      });
    }
  }
);

// ==================== LISTAR CONVITES ====================

router.get('/', authMiddleware, async (req, res) => {
  try {
    // Buscar organização do usuário
    const userResult = await pool.query(
      'SELECT organization_id, perfil FROM users WHERE id = $1',
      [req.user.id]
    );

    if (!userResult.rows[0].organization_id) {
      return res.status(400).json({
        success: false,
        message: 'Usuário não pertence a nenhuma organização',
      });
    }

    const organization_id = userResult.rows[0].organization_id;

    const result = await pool.query(
      `SELECT i.*, u.nome as invited_by_name
       FROM invites i
       LEFT JOIN users u ON i.invited_by = u.id
       WHERE i.organization_id = $1
       ORDER BY i.created_at DESC`,
      [organization_id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Erro ao listar convites:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar convites',
    });
  }
});

// ==================== VERIFICAR CONVITE ====================

router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const result = await pool.query(
      `SELECT i.*, o.nome as organization_name
       FROM invites i
       JOIN organizations o ON i.organization_id = o.id
       WHERE i.token = $1 AND i.expires_at > NOW() AND i.current_uses < i.max_uses`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Convite inválido, expirado ou já atingiu o limite de usos',
      });
    }

    const invite = result.rows[0];

    res.json({
      success: true,
      data: {
        perfil: invite.perfil,
        organization_name: invite.organization_name,
        uses_left: invite.max_uses - invite.current_uses,
        expires_at: invite.expires_at,
      },
    });
  } catch (error) {
    console.error('Erro ao verificar convite:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar convite',
    });
  }
});

// ==================== ACEITAR CONVITE ====================

router.post('/accept/:token', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { token } = req.params;
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios',
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido',
      });
    }

    // Buscar convite
    const inviteResult = await client.query(
      `SELECT * FROM invites
       WHERE token = $1 AND expires_at > NOW() AND current_uses < max_uses`,
      [token]
    );

    if (inviteResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Convite inválido, expirado ou já atingiu o limite de usos',
      });
    }

    const invite = inviteResult.rows[0];

    // Verificar se email já está cadastrado
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado no sistema',
      });
    }

    // Criar usuário
    const bcrypt = require('bcrypt');
    const senhaHash = await bcrypt.hash(senha, 10);

    const userResult = await client.query(
      `INSERT INTO users (nome, email, senha, perfil, organization_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome, email, perfil, organization_id`,
      [nome, email, senhaHash, invite.perfil, invite.organization_id]
    );

    // Incrementar contador de usos do convite
    await client.query(
      'UPDATE invites SET current_uses = current_uses + 1 WHERE id = $1',
      [invite.id]
    );

    await client.query('COMMIT');

    // Gerar token JWT
    const jwt = require('jsonwebtoken');
    const token_jwt = jwt.sign(
      {
        id: userResult.rows[0].id,
        email: userResult.rows[0].email,
        perfil: userResult.rows[0].perfil,
        organization_id: userResult.rows[0].organization_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Convite aceito e usuário criado com sucesso',
      data: {
        user: userResult.rows[0],
        token: token_jwt,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao aceitar convite:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao aceitar convite',
    });
  } finally {
    client.release();
  }
});

// ==================== CANCELAR CONVITE ====================

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se usuário tem permissão
    const userResult = await pool.query(
      'SELECT organization_id, perfil FROM users WHERE id = $1',
      [req.user.id]
    );

    if (!['admin', 'gestor'].includes(userResult.rows[0].perfil)) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para cancelar convites',
      });
    }

    await pool.query(
      'DELETE FROM invites WHERE id = $1 AND organization_id = $2',
      [id, userResult.rows[0].organization_id]
    );

    res.json({
      success: true,
      message: 'Convite cancelado',
    });
  } catch (error) {
    console.error('Erro ao cancelar convite:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao cancelar convite',
    });
  }
});

module.exports = router;
