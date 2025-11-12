const express = require('express');
const router = express.Router();
const RequestController = require('../controllers/RequestController');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas para todos os usuários
router.get('/', RequestController.index);
router.get('/:id', RequestController.show);
router.post('/', RequestController.create);
router.put('/:id/cancel', RequestController.cancel);

// Rotas para gerentes e administradores
router.put('/:id/approve', checkRole('admin', 'manager', 'operator'), RequestController.approve);
router.put('/:id/reject', checkRole('admin', 'manager', 'operator'), RequestController.reject);
router.put('/:id/complete', checkRole('admin', 'manager', 'operator'), RequestController.complete);

module.exports = router;
