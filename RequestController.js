const { Request, Item, User, Movement } = require('../models');
const { Op } = require('sequelize');

class RequestController {
  // Listar solicitações
  async index(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        requesterId,
        priority
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      if (status) where.status = status;
      if (requesterId) where.requesterId = requesterId;
      if (priority) where.priority = priority;

      // Usuários comuns só veem suas próprias solicitações
      if (req.user.role === 'user') {
        where.requesterId = req.userId;
      }

      const { count, rows: requests } = await Request.findAndCountAll({
        where,
        include: [
          { model: User, as: 'requester', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'approver', attributes: ['id', 'name', 'email'] },
          { model: Item, as: 'item', include: ['location'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      return res.json({
        success: true,
        data: {
          requests,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao listar solicitações',
        error: error.message
      });
    }
  }

  // Buscar solicitação específica
  async show(req, res) {
    try {
      const { id } = req.params;

      const request = await Request.findByPk(id, {
        include: [
          { model: User, as: 'requester', attributes: ['id', 'name', 'email', 'phone'] },
          { model: User, as: 'approver', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'deliverer', attributes: ['id', 'name', 'email'] },
          { 
            model: Item, 
            as: 'item',
            include: ['location', 'category']
          }
        ]
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Solicitação não encontrada'
        });
      }

      // Verificar permissão
      if (req.user.role === 'user' && request.requesterId !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para visualizar esta solicitação'
        });
      }

      return res.json({
        success: true,
        data: request
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar solicitação',
        error: error.message
      });
    }
  }

  // Criar nova solicitação
  async create(req, res) {
    try {
      const {
        itemId,
        quantity,
        purpose,
        expectedReturnDate,
        priority
      } = req.body;

      // Verificar se o item existe e tem estoque
      const item = await Item.findByPk(itemId);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item não encontrado'
        });
      }

      if (item.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Quantidade insuficiente. Disponível: ${item.quantity}`
        });
      }

      if (item.status !== 'available') {
        return res.status(400).json({
          success: false,
          message: 'Item não está disponível no momento'
        });
      }

      // Criar solicitação
      const request = await Request.create({
        requesterId: req.userId,
        itemId,
        quantity,
        purpose,
        expectedReturnDate,
        priority: priority || 'normal',
        status: 'pending'
      });

      const createdRequest = await Request.findByPk(request.id, {
        include: [
          { model: User, as: 'requester', attributes: ['id', 'name', 'email'] },
          { model: Item, as: 'item', include: ['location'] }
        ]
      });

      return res.status(201).json({
        success: true,
        message: 'Solicitação criada com sucesso',
        data: createdRequest
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar solicitação',
        error: error.message
      });
    }
  }

  // Aprovar solicitação
  async approve(req, res) {
    try {
      const { id } = req.params;
      const { approvalNotes } = req.body;

      const request = await Request.findByPk(id, {
        include: ['item']
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Solicitação não encontrada'
        });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Solicitação já foi processada'
        });
      }

      // Verificar estoque novamente
      if (request.item.quantity < request.quantity) {
        return res.status(400).json({
          success: false,
          message: 'Quantidade insuficiente no estoque'
        });
      }

      // Atualizar solicitação
      await request.update({
        status: 'approved',
        approverId: req.userId,
        approvalDate: new Date(),
        approvalNotes
      });

      // Não alterar estoque ainda, isso será feito na entrega

      return res.json({
        success: true,
        message: 'Solicitação aprovada com sucesso',
        data: request
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao aprovar solicitação',
        error: error.message
      });
    }
  }

  // Rejeitar solicitação
  async reject(req, res) {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;

      const request = await Request.findByPk(id);

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Solicitação não encontrada'
        });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Solicitação já foi processada'
        });
      }

      await request.update({
        status: 'rejected',
        approverId: req.userId,
        approvalDate: new Date(),
        rejectionReason
      });

      return res.json({
        success: true,
        message: 'Solicitação rejeitada',
        data: request
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao rejeitar solicitação',
        error: error.message
      });
    }
  }

  // Completar entrega
  async complete(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const request = await Request.findByPk(id, {
        include: ['item']
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Solicitação não encontrada'
        });
      }

      if (request.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Solicitação precisa estar aprovada'
        });
      }

      // Atualizar estoque do item
      const item = request.item;
      const newQuantity = item.quantity - request.quantity;

      await item.update({
        quantity: newQuantity,
        status: newQuantity === 0 ? 'in_use' : 'available',
        currentUserId: request.requesterId
      });

      // Registrar movimentação
      await Movement.create({
        itemId: item.id,
        userId: req.userId,
        type: 'exit',
        quantity: request.quantity,
        previousQuantity: item.quantity,
        newQuantity,
        fromLocationId: item.locationId,
        relatedRequestId: request.id,
        reason: `Entrega para: ${request.purpose}`,
        metadata: {
          requestCode: request.requestCode,
          deliveredTo: request.requesterId
        }
      });

      // Completar solicitação
      await request.update({
        status: 'completed',
        completionDate: new Date(),
        deliveredBy: req.userId,
        notes
      });

      return res.json({
        success: true,
        message: 'Entrega realizada com sucesso',
        data: request
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao completar entrega',
        error: error.message
      });
    }
  }

  // Cancelar solicitação
  async cancel(req, res) {
    try {
      const { id } = req.params;

      const request = await Request.findByPk(id);

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Solicitação não encontrada'
        });
      }

      // Verificar permissão
      if (req.user.role === 'user' && request.requesterId !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para cancelar esta solicitação'
        });
      }

      if (!['pending', 'approved'].includes(request.status)) {
        return res.status(400).json({
          success: false,
          message: 'Solicitação não pode ser cancelada'
        });
      }

      await request.update({ status: 'cancelled' });

      return res.json({
        success: true,
        message: 'Solicitação cancelada',
        data: request
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao cancelar solicitação',
        error: error.message
      });
    }
  }
}

module.exports = new RequestController();
