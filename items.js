const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/ItemController');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas públicas (todos os usuários autenticados)
router.get('/', ItemController.index);
router.get('/dashboard', ItemController.dashboard);
router.get('/code/:code', ItemController.findByCode);
router.get('/:id', ItemController.show);

// Rotas restritas (admin, manager, operator)
router.post('/', checkRole('admin', 'manager', 'operator'), ItemController.create);
router.put('/:id', checkRole('admin', 'manager', 'operator'), ItemController.update);
router.delete('/:id', checkRole('admin', 'manager'), ItemController.delete);

module.exports = router;
