const express = require('express');
const pool = require('../database/config');
const { authMiddleware } = require('./auth');

const router = express.Router();
router.use(authMiddleware);

// Listar usuários
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, email, perfil, obra_id, foto, ativo FROM users ORDER BY nome'
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

// Buscar usuário por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, email, perfil, obra_id, foto, ativo FROM users WHERE id = $1',
      [req.params.id]
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

module.exports = router;
