const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transfer = sequelize.define('Transfer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  transferCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  itemId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'items',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  fromUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuário que está transferindo'
  },
  toUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuário que vai receber'
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
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Motivo da transferência'
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_transit', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  sentDate: {
    type: DataTypes.DATE
  },
  receivedDate: {
    type: DataTypes.DATE
  },
  confirmedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuário que confirmou o recebimento'
  },
  notes: {
    type: DataTypes.TEXT
  },
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'URLs de fotos/documentos anexados'
  }
}, {
  tableName: 'transfers',
  timestamps: true,
  hooks: {
    beforeCreate: (transfer) => {
      // Gerar código único para a transferência
      if (!transfer.transferCode) {
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        transfer.transferCode = `TRF-${dateStr}-${random}`;
      }
    }
  }
});

module.exports = Transfer;
