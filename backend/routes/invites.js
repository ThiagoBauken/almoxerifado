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
    body('email').isEmail().withMessage('Email inválido'),
    body('perfil').isIn(['funcionario', 'almoxarife', 'gestor', 'admin']).withMessage('Perfil inválido'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, perfil } = req.body;

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

      // Verificar se email já está cadastrado
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado no sistema',
        });
      }

      // Verificar se já existe convite pendente
      const existingInvite = await pool.query(
        'SELECT id FROM invites WHERE organization_id = $1 AND email = $2 AND accepted_at IS NULL',
        [organization_id, email]
      );

      if (existingInvite.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Já existe um convite pendente para este email',
        });
      }

      // Gerar token único
      const token = crypto.randomBytes(32).toString('hex');

      // Criar convite (expira em 7 dias)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const result = await pool.query(
        `INSERT INTO invites (organization_id, email, perfil, token, invited_by, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [organization_id, email, perfil, token, req.user.id, expiresAt]
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
       WHERE i.token = $1 AND i.accepted_at IS NULL AND i.expires_at > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Convite inválido ou expirado',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
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
    const { nome, senha } = req.body;

    if (!nome || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Nome e senha são obrigatórios',
      });
    }

    // Buscar convite
    const inviteResult = await client.query(
      `SELECT * FROM invites
       WHERE token = $1 AND accepted_at IS NULL AND expires_at > NOW()`,
      [token]
    );

    if (inviteResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Convite inválido ou expirado',
      });
    }

    const invite = inviteResult.rows[0];

    // Criar usuário
    const bcrypt = require('bcrypt');
    const senhaHash = await bcrypt.hash(senha, 10);

    const userResult = await client.query(
      `INSERT INTO users (nome, email, senha, perfil, organization_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome, email, perfil, organization_id`,
      [nome, invite.email, senhaHash, invite.perfil, invite.organization_id]
    );

    // Marcar convite como aceito
    await client.query(
      'UPDATE invites SET accepted_at = NOW() WHERE id = $1',
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
