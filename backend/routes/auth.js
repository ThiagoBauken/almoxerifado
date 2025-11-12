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
    body('perfil').isIn(['funcionario', 'almoxarife', 'gestor', 'admin']).withMessage('Perfil inválido'),
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

      const { nome, email, senha, perfil, obra_id, foto } = req.body;

      // Verificar se email já existe
      const emailExists = await pool.query(
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

      // Inserir usuário
      const result = await pool.query(
        `INSERT INTO users (nome, email, senha, perfil, obra_id, foto)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, nome, email, perfil, obra_id, foto, created_at`,
        [nome, email, senhaHash, perfil, obra_id, foto]
      );

      const user = result.rows[0];

      // Gerar token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          perfil: user.perfil,
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
      console.error('Erro no registro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar usuário',
      });
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
