const express = require('express');
const pool = require('../database/config');
const { authMiddleware } = require('./auth');

const router = express.Router();
router.use(authMiddleware);

// Endpoint de sincronização completa
router.post('/full', async (req, res) => {
  try {
    const { lastSync } = req.body;

    // Buscar dados atualizados desde a última sincronização
    const items = await pool.query(
      lastSync
        ? 'SELECT * FROM items WHERE updated_at > $1'
        : 'SELECT * FROM items',
      lastSync ? [lastSync] : []
    );

    const transfers = await pool.query(
      lastSync
        ? 'SELECT * FROM transfers WHERE updated_at > $1'
        : 'SELECT * FROM transfers',
      lastSync ? [lastSync] : []
    );

    const users = await pool.query('SELECT id, nome, email, perfil, obra_id, foto FROM users');
    const categories = await pool.query('SELECT * FROM categories');
    const obras = await pool.query('SELECT * FROM obras');

    res.json({
      success: true,
      data: {
        items: items.rows,
        transfers: transfers.rows,
        users: users.rows,
        categories: categories.rows,
        obras: obras.rows,
        syncTimestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Erro na sincronização:', error);
    res.status(500).json({ success: false, message: 'Erro na sincronização' });
  }
});

module.exports = router;
