const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Movement = sequelize.define('Movement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  itemId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'items',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuário que realizou a movimentação'
  },
  type: {
    type: DataTypes.ENUM(
      'entry',        // Entrada no estoque
      'exit',         // Saída do estoque
      'return',       // Devolução
      'transfer',     // Transferência
      'adjustment',   // Ajuste de inventário
      'loss',         // Perda/Extravio
      'maintenance',  // Enviado para manutenção
      'disposal'      // Descarte/Baixa
    ),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  previousQuantity: {
    type: DataTypes.INTEGER,
    comment: 'Quantidade anterior'
  },
  newQuantity: {
    type: DataTypes.INTEGER,
    comment: 'Nova quantidade após movimentação'
  },
  fromLocationId: {
    type: DataTypes.UUID,
    references: {
      model: 'locations',
      key: 'id'
    }
  },
  toLocationId: {
    type: DataTypes.UUID,
    references: {
      model: 'locations',
      key: 'id'
    }
  },
  relatedRequestId: {
    type: DataTypes.UUID,
    references: {
      model: 'requests',
      key: 'id'
    }
  },
  relatedTransferId: {
    type: DataTypes.UUID,
    references: {
      model: 'transfers',
      key: 'id'
    }
  },
  reason: {
    type: DataTypes.TEXT,
    comment: 'Motivo da movimentação'
  },
  notes: {
    type: DataTypes.TEXT
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Dados adicionais em formato JSON'
  }
}, {
  tableName: 'movements',
  timestamps: true,
  indexes: [
    {
      fields: ['itemId', 'createdAt']
    },
    {
      fields: ['userId', 'createdAt']
    },
    {
      fields: ['type', 'createdAt']
    }
  ]
});

module.exports = Movement;
