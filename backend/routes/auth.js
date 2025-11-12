const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../database/config');

const router = express.Router();

// ==================== LOGIN ====================

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').notEmpty().withMessage('Senha é obrigatória'),
  ],
  async (req, res) => {
    try {
      // Validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { email, senha } = req.body;

      // Buscar usuário
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND ativo = true',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas',
        });
      }

      const user = result.rows[0];

      // Verificar senha
      const senhaValida = await bcrypt.compare(senha, user.senha);
      if (!senhaValida) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas',
        });
      }

      // Gerar token JWT
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          perfil: user.perfil,
          organization_id: user.organization_id,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Remover senha do response
      delete user.senha;

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao realizar login',
      });
    }
  }
);

// ==================== REGISTER ====================

router.post(
  '/register',
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
    body('organizacao_nome').optional(),
  ],
  async (req, res) => {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { nome, email, senha, organizacao_nome } = req.body;

      // Verificar se email já existe
      const emailExists = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (emailExists.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado',
        });
      }

      // Hash da senha
      const senhaHash = await bcrypt.hash(senha, 10);

      let organization_id = null;

      // Criar organização se não existir
      if (organizacao_nome) {
        const slug = organizacao_nome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        const orgResult = await client.query(
          `INSERT INTO organizations (nome, slug, plano)
           VALUES ($1, $2, 'free')
           RETURNING id`,
          [organizacao_nome, slug]
        );

        organization_id = orgResult.rows[0].id;
      }

      // Inserir usuário (sempre como admin se criar organização)
      const perfil = organization_id ? 'admin' : 'funcionario';

      const result = await client.query(
        `INSERT INTO users (nome, email, senha, perfil, organization_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, nome, email, perfil, organization_id, created_at`,
        [nome, email, senhaHash, perfil, organization_id]
      );

      const user = result.rows[0];

      await client.query('COMMIT');

      // Gerar token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          perfil: user.perfil,
          organization_id: user.organization_id,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro no registro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar usuário',
      });
    } finally {
      client.release();
    }
  }
);

// ==================== MIDDLEWARE DE AUTENTICAÇÃO ====================

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado',
    });
  }
};

// ==================== VERIFICAR TOKEN ====================

router.get('/verify', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, email, perfil, obra_id, foto FROM users WHERE id = $1 AND ativo = true',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar token',
    });
  }
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;
