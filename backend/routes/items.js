const express = require('express');
const { body, validationResult, query } = require('express-validator');
const pool = require('../database/config');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// ==================== LISTAR ITENS ====================

router.get('/', async (req, res) => {
  try {
    const {
      estado,
      categoria_id,
      funcionario_id,
      obra_id,
      search,
      limit = 100,
      offset = 0,
      since, // Para sincronização incremental
    } = req.query;

    let query = `
      SELECT i.*, c.nome as categoria_nome, c.icone as categoria_icone,
             l.codigo as local_codigo, l.descricao as local_descricao, l.tipo as local_tipo
      FROM items i
      LEFT JOIN categories c ON i.categoria_id = c.id
      LEFT JOIN locais_armazenamento l ON i.local_armazenamento_id = l.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Filtros
    if (estado) {
      query += ` AND i.estado = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }

    if (categoria_id) {
      query += ` AND i.categoria_id = $${paramIndex}`;
      params.push(categoria_id);
      paramIndex++;
    }

    if (funcionario_id) {
      query += ` AND i.funcionario_id = $${paramIndex}`;
      params.push(funcionario_id);
      paramIndex++;
    }

    if (obra_id) {
      query += ` AND i.obra_id = $${paramIndex}`;
      params.push(obra_id);
      paramIndex++;
    }

    if (search) {
      query += ` AND (i.nome ILIKE $${paramIndex} OR i.lacre ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Sincronização incremental
    if (since) {
      query += ` AND i.updated_at > $${paramIndex}`;
      params.push(since);
      paramIndex++;
    }

    query += ` ORDER BY i.updated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Contar total
    const countResult = await pool.query('SELECT COUNT(*) FROM items');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      meta: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + result.rows.length < total,
      },
    });
  } catch (error) {
    console.error('Erro ao listar itens:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar itens',
    });
  }
});

// ==================== BUSCAR ITEM POR ID ====================

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT i.*, c.nome as categoria_nome, c.icone as categoria_icone,
              u.nome as funcionario_nome, o.nome as obra_nome,
              l.codigo as local_codigo, l.descricao as local_descricao,
              l.tipo as local_tipo, l.setor as local_setor
       FROM items i
       LEFT JOIN categories c ON i.categoria_id = c.id
       LEFT JOIN users u ON i.funcionario_id = u.id
       LEFT JOIN obras o ON i.obra_id = o.id
       LEFT JOIN locais_armazenamento l ON i.local_armazenamento_id = l.id
       WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar item',
    });
  }
});

// ==================== CRIAR ITEM ====================

router.post(
  '/',
  [
    body('lacre').notEmpty().withMessage('Lacre é obrigatório'),
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('estado')
      .isIn([
        'disponivel_estoque',
        'pendente_aceitacao',
        'com_funcionario',
        'em_obra',
        'em_manutencao',
        'inativo',
        'extraviado',
        'danificado',
        'em_transito',
      ])
      .withMessage('Estado inválido'),
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

      const {
        lacre,
        nome,
        categoria_id,
        estado,
        localizacao_tipo,
        localizacao_id,
        funcionario_id,
        obra_id,
        foto,
        qr_code,
        descricao,
        valor_unitario,
        data_aquisicao,
        local_armazenamento_id,
      } = req.body;

      // Verificar se lacre já existe
      const lacreExists = await pool.query(
        'SELECT id FROM items WHERE lacre = $1',
        [lacre]
      );

      if (lacreExists.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Lacre já cadastrado',
        });
      }

      const result = await pool.query(
        `INSERT INTO items (
          lacre, nome, categoria_id, estado, localizacao_tipo,
          localizacao_id, funcionario_id, obra_id, foto, qr_code,
          descricao, valor_unitario, data_aquisicao, local_armazenamento_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          lacre,
          nome,
          categoria_id,
          estado,
          localizacao_tipo,
          localizacao_id,
          funcionario_id,
          obra_id,
          foto,
          qr_code,
          descricao,
          valor_unitario,
          data_aquisicao,
          local_armazenamento_id,
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Item criado com sucesso',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Erro ao criar item:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar item',
      });
    }
  }
);

// ==================== ATUALIZAR ITEM ====================

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Construir query dinâmica
    const fields = Object.keys(updates);
    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(', ');
    const values = fields.map((field) => updates[field]);

    const result = await pool.query(
      `UPDATE items
       SET ${setClause}, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, ...values]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Item atualizado com sucesso',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar item',
    });
  }
});

// ==================== DELETAR ITEM ====================

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Item deletado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar item:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar item',
    });
  }
});

// ==================== ESTATÍSTICAS ====================

router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total_itens,
        COUNT(*) FILTER (WHERE estado = 'disponivel_estoque') as itens_disponiveis,
        COUNT(*) FILTER (WHERE estado = 'com_funcionario') as itens_em_uso,
        COUNT(*) FILTER (WHERE estado = 'em_manutencao') as itens_em_manutencao,
        COUNT(*) FILTER (WHERE estado = 'pendente_aceitacao') as itens_pendentes
      FROM items
    `);

    res.json({
      success: true,
      data: stats.rows[0],
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
    });
  }
});

module.exports = router;
