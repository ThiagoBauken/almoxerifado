const express = require('express');
const pool = require('../database/config');
const { authMiddleware } = require('./auth');

const router = express.Router();
router.use(authMiddleware);

// ==================== CRIAR NOTIFICAÇÃO (HELPER) ====================

async function createNotification(client, { user_id, tipo, titulo, mensagem, reference_type, reference_id, link }) {
  try {
    const result = await client.query(
      `INSERT INTO notifications (user_id, tipo, titulo, mensagem, reference_type, reference_id, link, read)
       VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)
       RETURNING *`,
      [user_id, tipo, titulo, mensagem, reference_type, reference_id, link]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    throw error;
  }
}

// ==================== LISTAR NOTIFICAÇÕES ====================

router.get('/', async (req, res) => {
  try {
    const { read, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT * FROM notifications
      WHERE user_id = $1
    `;
    const params = [req.user.id];
    let paramIndex = 2;

    if (read !== undefined) {
      query += ` AND read = $${paramIndex}`;
      params.push(read === 'true');
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Erro ao listar notificações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar notificações',
    });
  }
});

// ==================== CONTAR NÃO LIDAS ====================

router.get('/unread-count', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = FALSE',
      [req.user.id]
    );

    res.json({
      success: true,
      count: parseInt(result.rows[0].count),
    });
  } catch (error) {
    console.error('Erro ao contar notificações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao contar notificações',
    });
  }
});

// ==================== MARCAR COMO LIDA ====================

router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se notificação pertence ao usuário
    const notificationCheck = await pool.query(
      'SELECT * FROM notifications WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (notificationCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notificação não encontrada',
      });
    }

    const result = await pool.query(
      `UPDATE notifications
       SET read = TRUE, read_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.user.id]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar notificação como lida',
    });
  }
});

// ==================== MARCAR TODAS COMO LIDAS ====================

router.put('/read-all', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE notifications
       SET read = TRUE, read_at = NOW()
       WHERE user_id = $1 AND read = FALSE
       RETURNING *`,
      [req.user.id]
    );

    res.json({
      success: true,
      message: `${result.rowCount} notificações marcadas como lidas`,
    });
  } catch (error) {
    console.error('Erro ao marcar todas as notificações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar todas as notificações',
    });
  }
});

// ==================== DELETAR NOTIFICAÇÃO ====================

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se notificação pertence ao usuário
    const notificationCheck = await pool.query(
      'SELECT * FROM notifications WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (notificationCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notificação não encontrada',
      });
    }

    await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Notificação deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar notificação',
    });
  }
});

// Exportar o helper também
module.exports = router;
module.exports.createNotification = createNotification;
