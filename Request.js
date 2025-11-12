const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Request = sequelize.define('Request', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  requestCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  requesterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuário que está solicitando'
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
  purpose: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Finalidade da solicitação'
  },
  expectedReturnDate: {
    type: DataTypes.DATE,
    comment: 'Data prevista de devolução'
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed'),
    defaultValue: 'pending'
  },
  approverId: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuário que aprovou/rejeitou'
  },
  approvalDate: {
    type: DataTypes.DATE
  },
  approvalNotes: {
    type: DataTypes.TEXT
  },
  rejectionReason: {
    type: DataTypes.TEXT
  },
  completionDate: {
    type: DataTypes.DATE
  },
  deliveredBy: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuário do almoxarifado que entregou'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'requests',
  timestamps: true,
  hooks: {
    beforeCreate: (request) => {
      // Gerar código único para a solicitação
      if (!request.requestCode) {
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        request.requestCode = `REQ-${dateStr}-${random}`;
      }
    }
  }
});

module.exports = Request;
