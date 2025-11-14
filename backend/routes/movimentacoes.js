const express = require('express');
const pool = require('../database/config');
const { authMiddleware } = require('./auth');

const router = express.Router();
router.use(authMiddleware);

// ==================== HELPER: REGISTRAR MOVIMENTAÇÃO ====================

/**
 * Registra uma movimentação automaticamente
 * @param {Object} client - Cliente PostgreSQL (dentro de transação)
 * @param {Object} data - Dados da movimentação
 * @param {string} data.item_id - ID do item
 * @param {string} data.usuario_id - ID do usuário que fez a ação
 * @param {string} data.tipo - Tipo: 'entrada', 'saida', 'transferencia', 'ajuste', 'devolucao'
 * @param {number} data.quantidade - Quantidade movimentada
 * @param {string} data.local_from_id - Local de origem (opcional)
 * @param {string} data.local_to_id - Local de destino (opcional)
 * @param {string} data.observacao - Observação (opcional)
 */
async function registrarMovimentacao(client, data) {
  try {
    const {
      item_id,
      usuario_id,
      tipo,
      quantidade = 1,
      local_from_id = null,
      local_to_id = null,
      observacao = null,
    } = data;

    await client.query(
      `INSERT INTO movimentacoes (item_id, usuario_id, tipo, quantidade, local_from_id, local_to_id, observacao)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [item_id, usuario_id, tipo, quantidade, local_from_id, local_to_id, observacao]
    );
  } catch (error) {
    console.error('Erro ao registrar movimentação:', error);
    // Não lançar erro para não quebrar a operação principal
  }
}

// ==================== LISTAR MOVIMENTAÇÕES ====================

router.get('/', async (req, res) => {
  try {
    const { item_id, usuario_id, tipo, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT m.*, i.nome as item_nome, u.nome as usuario_nome,
             lf.codigo as local_from_codigo, lt.codigo as local_to_codigo
      FROM movimentacoes m
      LEFT JOIN items i ON m.item_id = i.id
      LEFT JOIN users u ON m.usuario_id = u.id
      LEFT JOIN locais_armazenamento lf ON m.local_from_id = lf.id
      LEFT JOIN locais_armazenamento lt ON m.local_to_id = lt.id
      WHERE i.organization_id = $1
    `;
    const params = [req.user.organization_id];
    let paramIndex = 2;

    if (item_id) {
      query += ` AND m.item_id = $${paramIndex}`;
      params.push(item_id);
      paramIndex++;
    }

    if (usuario_id) {
      query += ` AND m.usuario_id = $${paramIndex}`;
      params.push(usuario_id);
      paramIndex++;
    }

    if (tipo) {
      query += ` AND m.tipo = $${paramIndex}`;
      params.push(tipo);
      paramIndex++;
    }

    query += ` ORDER BY m.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Erro ao listar movimentações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar movimentações',
    });
  }
});

// ==================== CRIAR MOVIMENTAÇÃO ====================

router.post('/', async (req, res) => {
  try {
    const {
      item_id,
      tipo,
      quantidade,
      local_from_id,
      local_to_id,
      observacao,
    } = req.body;

    // Verificar se item pertence à organização
    const itemCheck = await pool.query(
      'SELECT organization_id FROM items WHERE id = $1',
      [item_id]
    );

    if (itemCheck.rows.length === 0 || itemCheck.rows[0].organization_id !== req.user.organization_id) {
      return res.status(403).json({
        success: false,
        message: 'Item não encontrado ou sem permissão',
      });
    }

    const result = await pool.query(
      `INSERT INTO movimentacoes (item_id, usuario_id, tipo, quantidade, local_from_id, local_to_id, observacao)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [item_id, req.user.id, tipo, quantidade, local_from_id, local_to_id, observacao]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao criar movimentação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar movimentação',
    });
  }
});

module.exports = router;
module.exports.registrarMovimentacao = registrarMovimentacao;
