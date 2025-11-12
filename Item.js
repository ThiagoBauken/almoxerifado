const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  itemCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    comment: 'Código único do item para QR Code'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  locationId: {
    type: DataTypes.UUID,
    references: {
      model: 'locations',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  minQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Quantidade mínima para alerta de estoque baixo'
  },
  maxQuantity: {
    type: DataTypes.INTEGER,
    comment: 'Quantidade máxima permitida'
  },
  unit: {
    type: DataTypes.STRING,
    defaultValue: 'un',
    comment: 'Unidade de medida (un, kg, m, L, etc)'
  },
  barcode: {
    type: DataTypes.STRING,
    comment: 'Código de barras do fornecedor (se houver)'
  },
  serialNumber: {
    type: DataTypes.STRING,
    comment: 'Número de série (para equipamentos)'
  },
  manufacturer: {
    type: DataTypes.STRING,
    comment: 'Fabricante'
  },
  model: {
    type: DataTypes.STRING,
    comment: 'Modelo'
  },
  acquisitionDate: {
    type: DataTypes.DATE,
    comment: 'Data de aquisição'
  },
  expirationDate: {
    type: DataTypes.DATE,
    comment: 'Data de validade (para consumíveis)'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    comment: 'Preço unitário'
  },
  condition: {
    type: DataTypes.ENUM('new', 'good', 'fair', 'poor', 'damaged'),
    defaultValue: 'good'
  },
  status: {
    type: DataTypes.ENUM('available', 'in_use', 'maintenance', 'reserved', 'retired'),
    defaultValue: 'available'
  },
  currentUserId: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuário atual que está usando o item'
  },
  image: {
    type: DataTypes.STRING,
    comment: 'URL da imagem do item'
  },
  qrCodeUrl: {
    type: DataTypes.STRING,
    comment: 'URL da imagem do QR Code gerado'
  },
  notes: {
    type: DataTypes.TEXT
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'items',
  timestamps: true,
  hooks: {
    beforeCreate: (item) => {
      // Gerar código único se não fornecido
      if (!item.itemCode) {
        const prefix = item.name.substring(0, 3).toUpperCase();
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        item.itemCode = `${prefix}-${timestamp}-${random}`;
      }
    }
  }
});

module.exports = Item;
