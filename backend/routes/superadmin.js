const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const pool = require('../database/config');
const { authMiddleware, requireSuperAdmin } = require('./auth');

const router = express.Router();

// Todas as rotas requerem autenticação + super admin
router.use(authMiddleware);
router.use(requireSuperAdmin);

// ==================== ESTATÍSTICAS GERAIS ====================

router.get('/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM organizations WHERE ativo = true) as total_organizations,
        (SELECT COUNT(*) FROM users WHERE ativo = true) as total_users,
        (SELECT COUNT(*) FROM users WHERE ativo = true AND is_superadmin = true) as total_superadmins,
        (SELECT COUNT(*) FROM items) as total_items,
        (SELECT COUNT(*) FROM transfers) as total_transfers
    `);

    // Usuários por perfil
    const usersByPerfil = await pool.query(`
      SELECT perfil, COUNT(*) as count
      FROM users
      WHERE ativo = true
      GROUP BY perfil
      ORDER BY count DESC
    `);

    // Organizações por plano
    const orgsByPlano = await pool.query(`
      SELECT plano, COUNT(*) as count
      FROM organizations
      WHERE ativo = true
      GROUP BY plano
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: {
        ...stats.rows[0],
        users_by_perfil: usersByPerfil.rows,
        organizations_by_plano: orgsByPlano.rows,
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

// ==================== GERENCIAR ORGANIZAÇÕES ====================

// Listar todas as organizações
router.get('/organizations', async (req, res) => {
  try {
    const { search, plano, ativo, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT
        o.*,
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT i.id) as total_items
      FROM organizations o
      LEFT JOIN users u ON u.organization_id = o.id AND u.ativo = true
      LEFT JOIN items i ON i.organization_id = o.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (o.nome ILIKE $${paramCount} OR o.slug ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (plano) {
      query += ` AND o.plano = $${paramCount}`;
      params.push(plano);
      paramCount++;
    }

    if (ativo !== undefined) {
      query += ` AND o.ativo = $${paramCount}`;
      params.push(ativo === 'true');
      paramCount++;
    }

    query += `
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Contar total
    let countQuery = 'SELECT COUNT(*) FROM organizations WHERE 1=1';
    const countParams = [];
    let countParamNum = 1;

    if (search) {
      countQuery += ` AND (nome ILIKE $${countParamNum} OR slug ILIKE $${countParamNum})`;
      countParams.push(`%${search}%`);
      countParamNum++;
    }

    if (plano) {
      countQuery += ` AND plano = $${countParamNum}`;
      countParams.push(plano);
      countParamNum++;
    }

    if (ativo !== undefined) {
      countQuery += ` AND ativo = $${countParamNum}`;
      countParams.push(ativo === 'true');
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao listar organizações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar organizações',
    });
  }
});

// Criar organização
router.post(
  '/organizations',
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('plano').isIn(['free', 'basic', 'premium', 'enterprise']).withMessage('Plano inválido'),
    body('max_usuarios').optional().isInt({ min: 1 }).withMessage('Max usuários deve ser positivo'),
    body('max_itens').optional().isInt({ min: 1 }).withMessage('Max itens deve ser positivo'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { nome, plano, max_usuarios, max_itens, logo, configuracoes } = req.body;
      const slug = nome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      const result = await pool.query(
        `INSERT INTO organizations (nome, slug, plano, max_usuarios, max_itens, logo, configuracoes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          nome,
          slug,
          plano,
          max_usuarios || 5,
          max_itens || 100,
          logo || null,
          configuracoes || {},
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Organização criada com sucesso',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Erro ao criar organização:', error);
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'Já existe uma organização com esse nome',
        });
      }
      res.status(500).json({
        success: false,
        message: 'Erro ao criar organização',
      });
    }
  }
);

// Atualizar organização
router.put(
  '/organizations/:id',
  [
    body('plano').optional().isIn(['free', 'basic', 'premium', 'enterprise']),
    body('max_usuarios').optional().isInt({ min: 1 }),
    body('max_itens').optional().isInt({ min: 1 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { nome, plano, max_usuarios, max_itens, logo, configuracoes, ativo } = req.body;

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (nome !== undefined) {
        updates.push(`nome = $${paramCount}`);
        values.push(nome);
        paramCount++;

        const slug = nome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        updates.push(`slug = $${paramCount}`);
        values.push(slug);
        paramCount++;
      }

      if (plano !== undefined) {
        updates.push(`plano = $${paramCount}`);
        values.push(plano);
        paramCount++;
      }

      if (max_usuarios !== undefined) {
        updates.push(`max_usuarios = $${paramCount}`);
        values.push(max_usuarios);
        paramCount++;
      }

      if (max_itens !== undefined) {
        updates.push(`max_itens = $${paramCount}`);
        values.push(max_itens);
        paramCount++;
      }

      if (logo !== undefined) {
        updates.push(`logo = $${paramCount}`);
        values.push(logo);
        paramCount++;
      }

      if (configuracoes !== undefined) {
        updates.push(`configuracoes = $${paramCount}`);
        values.push(configuracoes);
        paramCount++;
      }

      if (ativo !== undefined) {
        updates.push(`ativo = $${paramCount}`);
        values.push(ativo);
        paramCount++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum campo para atualizar',
        });
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const result = await pool.query(
        `UPDATE organizations SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Organização não encontrada',
        });
      }

      res.json({
        success: true,
        message: 'Organização atualizada com sucesso',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Erro ao atualizar organização:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar organização',
      });
    }
  }
);

// Deletar organização (soft delete)
router.delete('/organizations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE organizations SET ativo = false, updated_at = NOW() WHERE id = $1 RETURNING *',
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
      message: 'Organização desativada com sucesso',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao deletar organização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar organização',
    });
  }
});

// ==================== GERENCIAR USUÁRIOS ====================

// Listar todos os usuários (de todas as organizações)
router.get('/users', async (req, res) => {
  try {
    const { search, perfil, organization_id, is_superadmin, ativo, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT
        u.*,
        o.nome as organization_name,
        o.slug as organization_slug,
        ob.nome as obra_nome
      FROM users u
      LEFT JOIN organizations o ON o.id = u.organization_id
      LEFT JOIN obras ob ON ob.id = u.obra_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (u.nome ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (perfil) {
      query += ` AND u.perfil = $${paramCount}`;
      params.push(perfil);
      paramCount++;
    }

    if (organization_id) {
      query += ` AND u.organization_id = $${paramCount}`;
      params.push(organization_id);
      paramCount++;
    }

    if (is_superadmin !== undefined) {
      query += ` AND u.is_superadmin = $${paramCount}`;
      params.push(is_superadmin === 'true');
      paramCount++;
    }

    if (ativo !== undefined) {
      query += ` AND u.ativo = $${paramCount}`;
      params.push(ativo === 'true');
      paramCount++;
    }

    query += `
      ORDER BY u.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Remover senhas
    result.rows.forEach(user => delete user.senha);

    // Contar total
    let countQuery = 'SELECT COUNT(*) FROM users u WHERE 1=1';
    const countParams = [];
    let countParamNum = 1;

    if (search) {
      countQuery += ` AND (u.nome ILIKE $${countParamNum} OR u.email ILIKE $${countParamNum})`;
      countParams.push(`%${search}%`);
      countParamNum++;
    }

    if (perfil) {
      countQuery += ` AND u.perfil = $${countParamNum}`;
      countParams.push(perfil);
      countParamNum++;
    }

    if (organization_id) {
      countQuery += ` AND u.organization_id = $${countParamNum}`;
      countParams.push(organization_id);
      countParamNum++;
    }

    if (is_superadmin !== undefined) {
      countQuery += ` AND u.is_superadmin = $${countParamNum}`;
      countParams.push(is_superadmin === 'true');
      countParamNum++;
    }

    if (ativo !== undefined) {
      countQuery += ` AND u.ativo = $${countParamNum}`;
      countParams.push(ativo === 'true');
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar usuários',
    });
  }
});

// Criar usuário (superadmin pode criar em qualquer organização)
router.post(
  '/users',
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
    body('perfil').isIn(['funcionario', 'almoxarife', 'gestor', 'admin']).withMessage('Perfil inválido'),
    body('organization_id').optional().isInt().withMessage('Organization ID inválido'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { nome, email, senha, perfil, organization_id, obra_id, is_superadmin } = req.body;

      // Verificar se email já existe
      const emailExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

      if (emailExists.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado',
        });
      }

      // Hash da senha
      const senhaHash = await bcrypt.hash(senha, 10);

      const result = await pool.query(
        `INSERT INTO users (nome, email, senha, perfil, organization_id, obra_id, is_superadmin)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, nome, email, perfil, organization_id, obra_id, is_superadmin, ativo, created_at`,
        [nome, email, senhaHash, perfil, organization_id || null, obra_id || null, is_superadmin || false]
      );

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar usuário',
      });
    }
  }
);

// Atualizar usuário
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, senha, perfil, organization_id, obra_id, is_superadmin, ativo } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (nome !== undefined) {
      updates.push(`nome = $${paramCount}`);
      values.push(nome);
      paramCount++;
    }

    if (email !== undefined) {
      updates.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }

    if (senha !== undefined) {
      const senhaHash = await bcrypt.hash(senha, 10);
      updates.push(`senha = $${paramCount}`);
      values.push(senhaHash);
      paramCount++;
    }

    if (perfil !== undefined) {
      updates.push(`perfil = $${paramCount}`);
      values.push(perfil);
      paramCount++;
    }

    if (organization_id !== undefined) {
      updates.push(`organization_id = $${paramCount}`);
      values.push(organization_id);
      paramCount++;
    }

    if (obra_id !== undefined) {
      updates.push(`obra_id = $${paramCount}`);
      values.push(obra_id);
      paramCount++;
    }

    if (is_superadmin !== undefined) {
      updates.push(`is_superadmin = $${paramCount}`);
      values.push(is_superadmin);
      paramCount++;
    }

    if (ativo !== undefined) {
      updates.push(`ativo = $${paramCount}`);
      values.push(ativo);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar',
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}
       RETURNING id, nome, email, perfil, organization_id, obra_id, is_superadmin, ativo, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário',
    });
  }
});

// Deletar usuário (soft delete)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Não permitir deletar a si mesmo
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode desativar sua própria conta',
      });
    }

    const result = await pool.query(
      `UPDATE users SET ativo = false, updated_at = NOW()
       WHERE id = $1
       RETURNING id, nome, email, perfil, is_superadmin, ativo`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Usuário desativado com sucesso',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar usuário',
    });
  }
});

// Promover/Despromover Super Admin
router.put('/users/:id/toggle-superadmin', async (req, res) => {
  try {
    const { id } = req.params;

    // Não permitir alterar a si mesmo
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode alterar seu próprio status de super admin',
      });
    }

    const result = await pool.query(
      `UPDATE users SET is_superadmin = NOT is_superadmin, updated_at = NOW()
       WHERE id = $1
       RETURNING id, nome, email, perfil, is_superadmin`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    const user = result.rows[0];
    const message = user.is_superadmin
      ? `${user.nome} foi promovido a Super Admin`
      : `${user.nome} foi removido de Super Admin`;

    res.json({
      success: true,
      message,
      data: user,
    });
  } catch (error) {
    console.error('Erro ao alterar super admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao alterar super admin',
    });
  }
});

module.exports = router;
