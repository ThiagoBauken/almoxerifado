const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../database/config');
const { authMiddleware, requireAdmin } = require('./auth');

const router = express.Router();
router.use(authMiddleware);

// ==================== LISTAR USUÁRIOS ====================

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, email, perfil, obra_id, foto, ativo, organization_id, created_at FROM users WHERE organization_id = $1 ORDER BY nome',
      [req.user.organization_id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar usuários' });
  }
});

// ==================== BUSCAR USUÁRIO POR ID ====================

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, email, perfil, obra_id, foto, ativo, organization_id FROM users WHERE id = $1 AND organization_id = $2',
      [req.params.id, req.user.organization_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar usuário' });
  }
});

// ==================== CRIAR USUÁRIO ====================

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { nome, email, senha, perfil, obra_id, foto } = req.body;

    // Verificar se usuário é admin ou gestor
    if (!['admin', 'gestor'].includes(req.user.perfil)) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para criar usuários',
      });
    }

    if (!nome || !email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios',
      });
    }

    // Verificar limites do plano
    const orgCheck = await pool.query(
      `SELECT o.max_usuarios, COUNT(u.id) as current_usuarios
       FROM organizations o
       LEFT JOIN users u ON u.organization_id = o.id
       WHERE o.id = $1
       GROUP BY o.id, o.max_usuarios`,
      [req.user.organization_id]
    );

    if (orgCheck.rows.length > 0) {
      const { max_usuarios, current_usuarios } = orgCheck.rows[0];
      if (parseInt(current_usuarios) >= max_usuarios) {
        return res.status(403).json({
          success: false,
          message: `Limite de usuários atingido (${max_usuarios}). Faça upgrade do seu plano.`,
          limit_reached: true,
          current: parseInt(current_usuarios),
          max: max_usuarios,
        });
      }
    }

    // Verificar se email já existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado',
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    const result = await pool.query(
      `INSERT INTO users (nome, email, senha, perfil, obra_id, foto, organization_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, nome, email, perfil, obra_id, foto, ativo, organization_id`,
      [nome, email, hashedPassword, perfil || 'funcionario', obra_id, foto, req.user.organization_id]
    );

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar usuário' });
  }
});

// ==================== ATUALIZAR USUÁRIO ====================

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, perfil, obra_id, foto, senha } = req.body;

    // Verificar se usuário é admin ou gestor
    if (!['admin', 'gestor'].includes(req.user.perfil)) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para atualizar usuários',
      });
    }

    // Verificar se usuário existe e pertence à mesma organização
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND organization_id = $2',
      [id, req.user.organization_id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    // Construir query de atualização
    let query = 'UPDATE users SET updated_at = NOW()';
    const params = [];
    let paramIndex = 1;

    if (nome) {
      query += `, nome = $${paramIndex}`;
      params.push(nome);
      paramIndex++;
    }

    if (email) {
      query += `, email = $${paramIndex}`;
      params.push(email);
      paramIndex++;
    }

    if (perfil) {
      query += `, perfil = $${paramIndex}`;
      params.push(perfil);
      paramIndex++;
    }

    if (obra_id !== undefined) {
      query += `, obra_id = $${paramIndex}`;
      params.push(obra_id);
      paramIndex++;
    }

    if (foto !== undefined) {
      query += `, foto = $${paramIndex}`;
      params.push(foto);
      paramIndex++;
    }

    if (senha) {
      const hashedPassword = await bcrypt.hash(senha, 10);
      query += `, senha = $${paramIndex}`;
      params.push(hashedPassword);
      paramIndex++;
    }

    query += ` WHERE id = $${paramIndex} AND organization_id = $${paramIndex + 1} RETURNING id, nome, email, perfil, obra_id, foto, ativo, organization_id`;
    params.push(id, req.user.organization_id);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar usuário' });
  }
});

// ==================== ATIVAR/DESATIVAR USUÁRIO ====================

router.put('/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se usuário é admin ou gestor
    if (!['admin', 'gestor'].includes(req.user.perfil)) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para alterar status de usuários',
      });
    }

    // Não permitir desativar o próprio usuário
    if (id == req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível desativar seu próprio usuário',
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET ativo = NOT ativo, updated_at = NOW()
       WHERE id = $1 AND organization_id = $2
       RETURNING id, nome, email, perfil, ativo`,
      [id, req.user.organization_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    res.json({
      success: true,
      message: `Usuário ${result.rows[0].ativo ? 'ativado' : 'desativado'} com sucesso`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    res.status(500).json({ success: false, message: 'Erro ao alterar status do usuário' });
  }
});

// ==================== DELETAR USUÁRIO ====================

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se usuário é admin
    if (req.user.perfil !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores podem deletar usuários',
      });
    }

    // Não permitir deletar o próprio usuário
    if (id == req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar seu próprio usuário',
      });
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 AND organization_id = $2 RETURNING id, nome, email',
      [id, req.user.organization_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ success: false, message: 'Erro ao deletar usuário' });
  }
});

module.exports = router;
