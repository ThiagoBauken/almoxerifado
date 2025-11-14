const express = require('express');
const pool = require('../database/config');
const { authMiddleware } = require('./auth');
const { Parser } = require('json2csv');

const router = express.Router();
router.use(authMiddleware);

// Middleware: apenas almoxarife+ pode gerar relatórios
const requireAlmoxarife = (req, res, next) => {
  const allowedRoles = ['almoxarife', 'gestor', 'admin'];
  if (!req.user || !allowedRoles.includes(req.user.perfil)) {
    return res.status(403).json({
      success: false,
      message: 'Apenas almoxarifes, gestores e admins podem gerar relatórios',
    });
  }
  next();
};

router.use(requireAlmoxarife);

// ==================== RELATÓRIO DE ITENS (CSV) ====================

router.get('/items/csv', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, c.nome as categoria, u.nome as funcionario, o.nome as obra,
              l.codigo as local_codigo
       FROM items i
       LEFT JOIN categories c ON i.categoria_id = c.id
       LEFT JOIN users u ON i.funcionario_id = u.id
       LEFT JOIN obras o ON i.obra_id = o.id
       LEFT JOIN locais_armazenamento l ON i.local_armazenamento_id = l.id
       WHERE i.organization_id = $1
       ORDER BY i.created_at DESC`,
      [req.user.organization_id]
    );

    const fields = [
      'lacre',
      'codigo',
      'nome',
      'quantidade',
      'categoria',
      'estado',
      'funcionario',
      'obra',
      'local_codigo',
      'valor_unitario',
      'data_aquisicao',
      'marca_modelo',
      'metragem',
      'unidade',
      'observacao',
      'created_at',
    ];

    const parser = new Parser({ fields, delimiter: ';' });
    const csv = parser.parse(result.rows);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=itens-${Date.now()}.csv`);
    res.send('\uFEFF' + csv); // BOM para Excel reconhecer UTF-8
  } catch (error) {
    console.error('Erro ao gerar relatório de itens:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório',
    });
  }
});

// ==================== RELATÓRIO DE TRANSFERÊNCIAS (CSV) ====================

router.get('/transfers/csv', async (req, res) => {
  try {
    const { status, data_inicio, data_fim } = req.query;

    let query = `
      SELECT t.*,
             i.nome as item_nome, i.lacre as item_lacre,
             u1.nome as de_usuario, u2.nome as para_usuario
      FROM transfers t
      LEFT JOIN items i ON t.item_id = i.id
      LEFT JOIN users u1 ON t.de_usuario_id = u1.id
      LEFT JOIN users u2 ON t.para_usuario_id = u2.id
      WHERE i.organization_id = $1
    `;

    const params = [req.user.organization_id];
    let paramIndex = 2;

    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (data_inicio) {
      query += ` AND t.created_at >= $${paramIndex}`;
      params.push(data_inicio);
      paramIndex++;
    }

    if (data_fim) {
      query += ` AND t.created_at <= $${paramIndex}`;
      params.push(data_fim);
      paramIndex++;
    }

    query += ' ORDER BY t.created_at DESC';

    const result = await pool.query(query, params);

    const fields = [
      'item_nome',
      'item_lacre',
      'tipo',
      'de_usuario',
      'para_usuario',
      'status',
      'motivo',
      'observacoes',
      'created_at',
      'data_aceitacao',
    ];

    const parser = new Parser({ fields, delimiter: ';' });
    const csv = parser.parse(result.rows);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=transferencias-${Date.now()}.csv`);
    res.send('\uFEFF' + csv);
  } catch (error) {
    console.error('Erro ao gerar relatório de transferências:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório',
    });
  }
});

// ==================== RELATÓRIO DE MOVIMENTAÇÕES (CSV) ====================

router.get('/movimentacoes/csv', async (req, res) => {
  try {
    const { tipo, data_inicio, data_fim } = req.query;

    let query = `
      SELECT m.*, i.nome as item_nome, u.nome as usuario,
             lf.codigo as local_origem, lt.codigo as local_destino
      FROM movimentacoes m
      LEFT JOIN items i ON m.item_id = i.id
      LEFT JOIN users u ON m.usuario_id = u.id
      LEFT JOIN locais_armazenamento lf ON m.local_from_id = lf.id
      LEFT JOIN locais_armazenamento lt ON m.local_to_id = lt.id
      WHERE i.organization_id = $1
    `;

    const params = [req.user.organization_id];
    let paramIndex = 2;

    if (tipo) {
      query += ` AND m.tipo = $${paramIndex}`;
      params.push(tipo);
      paramIndex++;
    }

    if (data_inicio) {
      query += ` AND m.created_at >= $${paramIndex}`;
      params.push(data_inicio);
      paramIndex++;
    }

    if (data_fim) {
      query += ` AND m.created_at <= $${paramIndex}`;
      params.push(data_fim);
      paramIndex++;
    }

    query += ' ORDER BY m.created_at DESC';

    const result = await pool.query(query, params);

    const fields = [
      'item_nome',
      'tipo',
      'quantidade',
      'usuario',
      'local_origem',
      'local_destino',
      'observacao',
      'created_at',
    ];

    const parser = new Parser({ fields, delimiter: ';' });
    const csv = parser.parse(result.rows);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=movimentacoes-${Date.now()}.csv`);
    res.send('\uFEFF' + csv);
  } catch (error) {
    console.error('Erro ao gerar relatório de movimentações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório',
    });
  }
});

// ==================== RELATÓRIO DE USUÁRIOS (CSV) - Admin ====================

router.get('/users/csv', async (req, res) => {
  try {
    // Apenas admins podem exportar usuários
    if (req.user.perfil !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores podem exportar usuários',
      });
    }

    const result = await pool.query(
      `SELECT id, nome, email, perfil, telefone, created_at
       FROM users
       WHERE organization_id = $1
       ORDER BY created_at DESC`,
      [req.user.organization_id]
    );

    const fields = ['nome', 'email', 'perfil', 'telefone', 'created_at'];

    const parser = new Parser({ fields, delimiter: ';' });
    const csv = parser.parse(result.rows);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=usuarios-${Date.now()}.csv`);
    res.send('\uFEFF' + csv);
  } catch (error) {
    console.error('Erro ao gerar relatório de usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório',
    });
  }
});

// ==================== RELATÓRIO CONSOLIDADO (JSON) ====================

router.get('/dashboard', async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;

    // Estatísticas gerais
    const statsResult = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE estado = 'disponivel_estoque') as itens_estoque,
         COUNT(*) FILTER (WHERE estado = 'com_funcionario') as itens_funcionarios,
         COUNT(*) FILTER (WHERE estado = 'pendente_aceitacao') as itens_pendentes,
         COUNT(*) as total_itens
       FROM items
       WHERE organization_id = $1`,
      [req.user.organization_id]
    );

    // Transferências por status
    const transfersResult = await pool.query(
      `SELECT status, COUNT(*) as count
       FROM transfers t
       LEFT JOIN items i ON t.item_id = i.id
       WHERE i.organization_id = $1
       GROUP BY status`,
      [req.user.organization_id]
    );

    // Movimentações por tipo
    const movimentacoesResult = await pool.query(
      `SELECT m.tipo, COUNT(*) as count
       FROM movimentacoes m
       LEFT JOIN items i ON m.item_id = i.id
       WHERE i.organization_id = $1
       GROUP BY m.tipo`,
      [req.user.organization_id]
    );

    // Itens por categoria
    const categoriesResult = await pool.query(
      `SELECT c.nome, COUNT(i.id) as count
       FROM categories c
       LEFT JOIN items i ON c.id = i.categoria_id AND i.organization_id = $1
       WHERE c.organization_id = $1
       GROUP BY c.id, c.nome
       ORDER BY count DESC`,
      [req.user.organization_id]
    );

    res.json({
      success: true,
      data: {
        stats: statsResult.rows[0],
        transfers_by_status: transfersResult.rows,
        movimentacoes_by_tipo: movimentacoesResult.rows,
        items_by_category: categoriesResult.rows,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar relatório consolidado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório',
    });
  }
});

module.exports = router;
