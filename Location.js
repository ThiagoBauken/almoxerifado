const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Location = sequelize.define('Location', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  container: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nome do container ou obra (ex: CONTAINER HEIGHTECH, BLUE COAST FG)'
  },
  shelf: {
    type: DataTypes.STRING,
    comment: 'Número/Nome da prateleira'
  },
  row: {
    type: DataTypes.STRING,
    comment: 'Número/Nome da fileira'
  },
  box: {
    type: DataTypes.STRING,
    comment: 'Número/Nome da caixa'
  },
  description: {
    type: DataTypes.TEXT
  },
  capacity: {
    type: DataTypes.INTEGER,
    comment: 'Capacidade máxima de itens'
  },
  currentOccupancy: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Ocupação atual'
  },
  coordinates: {
    type: DataTypes.STRING,
    comment: 'Código de localização completo (ex: CT-01-P-A1-C5)'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'locations',
  timestamps: true,
  hooks: {
    beforeSave: (location) => {
      // Gerar código de coordenadas automaticamente
      const parts = [];
      if (location.container) parts.push(location.container.substring(0, 3).toUpperCase());
      if (location.shelf) parts.push(`P${location.shelf}`);
      if (location.row) parts.push(`F${location.row}`);
      if (location.box) parts.push(`C${location.box}`);
      location.coordinates = parts.join('-');
    }
  }
});

module.exports = Location;
