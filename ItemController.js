const { Item, Category, Location, User, Movement } = require('../models');
const { Op } = require('sequelize');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;

class ItemController {
  // Listar todos os itens com filtros e paginação
  async index(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        categoryId,
        locationId,
        status,
        condition,
        sortBy = 'name',
        sortOrder = 'ASC'
      } = req.query;

      const offset = (page - 1) * limit;

      // Construir filtros
      const where = { isActive: true };

      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { itemCode: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { tags: { [Op.contains]: [search.toLowerCase()] } }
        ];
      }

      if (categoryId) where.categoryId = categoryId;
      if (locationId) where.locationId = locationId;
      if (status) where.status = status;
      if (condition) where.condition = condition;

      const { count, rows: items } = await Item.findAndCountAll({
        where,
        include: [
          { model: Category, as: 'category' },
          { model: Location, as: 'location' },
          { model: User, as: 'currentUser', attributes: ['id', 'name', 'email'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder]]
      });

      return res.json({
        success: true,
        data: {
          items,
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
        message: 'Erro ao listar itens',
        error: error.message
      });
    }
  }

  // Buscar item por ID
  async show(req, res) {
    try {
      const { id } = req.params;

      const item = await Item.findByPk(id, {
        include: [
          { model: Category, as: 'category' },
          { model: Location, as: 'location' },
          { model: User, as: 'currentUser', attributes: ['id', 'name', 'email'] }
        ]
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item não encontrado'
        });
      }

      // Buscar histórico de movimentações
      const movements = await Movement.findAll({
        where: { itemId: id },
        include: [
          { model: User, as: 'user', attributes: ['id', 'name'] },
          { model: Location, as: 'fromLocation' },
          { model: Location, as: 'toLocation' }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10
      });

      return res.json({
        success: true,
        data: {
          item,
          recentMovements: movements
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar item',
        error: error.message
      });
    }
  }

  // Buscar item por código (QR Code)
  async findByCode(req, res) {
    try {
      const { code } = req.params;

      const item = await Item.findOne({
        where: { itemCode: code },
        include: [
          { model: Category, as: 'category' },
          { model: Location, as: 'location' },
          { model: User, as: 'currentUser', attributes: ['id', 'name', 'email'] }
        ]
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item não encontrado'
        });
      }

      return res.json({
        success: true,
        data: item
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar item',
        error: error.message
      });
    }
  }

  // Criar novo item
  async create(req, res) {
    try {
      const itemData = req.body;

      // Criar item
      const item = await Item.create(itemData);

      // Gerar QR Code
      const qrCodePath = await this.generateQRCode(item.itemCode);
      await item.update({ qrCodeUrl: qrCodePath });

      // Registrar movimentação de entrada
      await Movement.create({
        itemId: item.id,
        userId: req.userId,
        type: 'entry',
        quantity: item.quantity,
        previousQuantity: 0,
        newQuantity: item.quantity,
        toLocationId: item.locationId,
        reason: 'Cadastro inicial do item',
        metadata: { initialEntry: true }
      });

      const createdItem = await Item.findByPk(item.id, {
        include: [
          { model: Category, as: 'category' },
          { model: Location, as: 'location' }
        ]
      });

      return res.status(201).json({
        success: true,
        message: 'Item criado com sucesso',
        data: createdItem
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar item',
        error: error.message
      });
    }
  }

  // Atualizar item
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const item = await Item.findByPk(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item não encontrado'
        });
      }

      const previousQuantity = item.quantity;
      await item.update(updateData);

      // Se houve mudança de quantidade, registrar movimento
      if (updateData.quantity && updateData.quantity !== previousQuantity) {
        await Movement.create({
          itemId: item.id,
          userId: req.userId,
          type: 'adjustment',
          quantity: Math.abs(updateData.quantity - previousQuantity),
          previousQuantity,
          newQuantity: updateData.quantity,
          reason: updateData.adjustmentReason || 'Ajuste de estoque',
          metadata: { adjustment: true }
        });
      }

      const updatedItem = await Item.findByPk(id, {
        include: [
          { model: Category, as: 'category' },
          { model: Location, as: 'location' }
        ]
      });

      return res.json({
        success: true,
        message: 'Item atualizado com sucesso',
        data: updatedItem
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar item',
        error: error.message
      });
    }
  }

  // Deletar item (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;

      const item = await Item.findByPk(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item não encontrado'
        });
      }

      await item.update({ isActive: false });

      return res.json({
        success: true,
        message: 'Item removido com sucesso'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao remover item',
        error: error.message
      });
    }
  }

  // Gerar QR Code
  async generateQRCode(itemCode) {
    try {
      const qrCodeDir = path.join(__dirname, '../../uploads/qrcodes');
      await fs.mkdir(qrCodeDir, { recursive: true });
      
      const filename = `${itemCode}.png`;
      const filepath = path.join(qrCodeDir, filename);
      
      await QRCode.toFile(filepath, itemCode, {
        errorCorrectionLevel: 'H',
        type: 'png',
        width: 300,
        margin: 1
      });

      return `/uploads/qrcodes/${filename}`;
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      return null;
    }
  }

  // Dashboard de estatísticas
  async dashboard(req, res) {
    try {
      const totalItems = await Item.count({ where: { isActive: true } });
      const availableItems = await Item.count({ 
        where: { isActive: true, status: 'available' } 
      });
      const inUseItems = await Item.count({ 
        where: { isActive: true, status: 'in_use' } 
      });
      const lowStockItems = await Item.count({
        where: {
          isActive: true,
          quantity: { [Op.lte]: sequelize.col('minQuantity') }
        }
      });

      const itemsByCategory = await Item.findAll({
        attributes: [
          'categoryId',
          [sequelize.fn('COUNT', sequelize.col('Item.id')), 'count']
        ],
        include: [{ 
          model: Category, 
          as: 'category',
          attributes: ['name', 'color']
        }],
        where: { isActive: true },
        group: ['categoryId', 'category.id', 'category.name', 'category.color']
      });

      return res.json({
        success: true,
        data: {
          totalItems,
          availableItems,
          inUseItems,
          lowStockItems,
          itemsByCategory
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas',
        error: error.message
      });
    }
  }
}

module.exports = new ItemController();
