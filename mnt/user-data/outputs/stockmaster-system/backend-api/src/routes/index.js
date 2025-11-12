const express = require('express');
const router = express.Router();

// Importar rotas
const authRoutes = require('./auth');
const itemRoutes = require('./items');
const requestRoutes = require('./requests');

// Definir rotas
router.use('/auth', authRoutes);
router.use('/items', itemRoutes);
router.use('/requests', requestRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API StockMaster funcionando!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
