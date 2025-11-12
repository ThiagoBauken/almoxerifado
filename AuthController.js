const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthController {
  // Gerar JWT Token
  generateToken(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  // Registro de novo usuário
  async register(req, res) {
    try {
      const { name, email, password, role, phone } = req.body;

      // Verificar se usuário já existe
      const existingUser = await User.findOne({ where: { email } });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado'
        });
      }

      // Criar usuário
      const user = await User.create({
        name,
        email,
        password,
        role: role || 'user',
        phone
      });

      // Gerar token
      const token = this.generateToken(user.id);

      return res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao registrar usuário',
        error: error.message
      });
    }
  }

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Buscar usuário
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      // Verificar se está ativo
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Usuário inativo. Contate o administrador.'
        });
      }

      // Verificar senha
      const isValidPassword = await user.validatePassword(password);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      // Atualizar último login
      await user.update({ lastLogin: new Date() });

      // Gerar token
      const token = this.generateToken(user.id);

      return res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao fazer login',
        error: error.message
      });
    }
  }

  // Obter dados do usuário autenticado
  async me(req, res) {
    try {
      const user = await User.findByPk(req.userId, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      return res.json({
        success: true,
        data: user
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados do usuário',
        error: error.message
      });
    }
  }

  // Atualizar perfil
  async updateProfile(req, res) {
    try {
      const { name, phone, avatar } = req.body;
      
      const user = await User.findByPk(req.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      await user.update({
        name: name || user.name,
        phone: phone || user.phone,
        avatar: avatar || user.avatar
      });

      return res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: user
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar perfil',
        error: error.message
      });
    }
  }

  // Alterar senha
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      const user = await User.findByPk(req.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Verificar senha atual
      const isValidPassword = await user.validatePassword(currentPassword);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Senha atual incorreta'
        });
      }

      // Atualizar senha
      await user.update({ password: newPassword });

      return res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao alterar senha',
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();
