const { sequelize } = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Location = require('./Location');
const Item = require('./Item');
const Request = require('./Request');
const Transfer = require('./Transfer');
const Movement = require('./Movement');

// ==================== RELACIONAMENTOS ====================

// User relationships
User.hasMany(Request, { as: 'requests', foreignKey: 'requesterId' });
User.hasMany(Request, { as: 'approvedRequests', foreignKey: 'approverId' });
User.hasMany(Transfer, { as: 'sentTransfers', foreignKey: 'fromUserId' });
User.hasMany(Transfer, { as: 'receivedTransfers', foreignKey: 'toUserId' });
User.hasMany(Movement, { as: 'movements', foreignKey: 'userId' });
User.hasMany(Item, { as: 'itemsInUse', foreignKey: 'currentUserId' });

// Category relationships
Category.hasMany(Item, { as: 'items', foreignKey: 'categoryId' });

// Location relationships
Location.hasMany(Item, { as: 'items', foreignKey: 'locationId' });
Location.hasMany(Transfer, { as: 'outgoingTransfers', foreignKey: 'fromLocationId' });
Location.hasMany(Transfer, { as: 'incomingTransfers', foreignKey: 'toLocationId' });

// Item relationships
Item.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });
Item.belongsTo(Location, { as: 'location', foreignKey: 'locationId' });
Item.belongsTo(User, { as: 'currentUser', foreignKey: 'currentUserId' });
Item.hasMany(Request, { as: 'requests', foreignKey: 'itemId' });
Item.hasMany(Transfer, { as: 'transfers', foreignKey: 'itemId' });
Item.hasMany(Movement, { as: 'movements', foreignKey: 'itemId' });

// Request relationships
Request.belongsTo(User, { as: 'requester', foreignKey: 'requesterId' });
Request.belongsTo(User, { as: 'approver', foreignKey: 'approverId' });
Request.belongsTo(User, { as: 'deliverer', foreignKey: 'deliveredBy' });
Request.belongsTo(Item, { as: 'item', foreignKey: 'itemId' });
Request.hasMany(Movement, { as: 'movements', foreignKey: 'relatedRequestId' });

// Transfer relationships
Transfer.belongsTo(User, { as: 'fromUser', foreignKey: 'fromUserId' });
Transfer.belongsTo(User, { as: 'toUser', foreignKey: 'toUserId' });
Transfer.belongsTo(User, { as: 'confirmer', foreignKey: 'confirmedBy' });
Transfer.belongsTo(Item, { as: 'item', foreignKey: 'itemId' });
Transfer.belongsTo(Location, { as: 'fromLocation', foreignKey: 'fromLocationId' });
Transfer.belongsTo(Location, { as: 'toLocation', foreignKey: 'toLocationId' });
Transfer.hasMany(Movement, { as: 'movements', foreignKey: 'relatedTransferId' });

// Movement relationships
Movement.belongsTo(Item, { as: 'item', foreignKey: 'itemId' });
Movement.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Movement.belongsTo(Location, { as: 'fromLocation', foreignKey: 'fromLocationId' });
Movement.belongsTo(Location, { as: 'toLocation', foreignKey: 'toLocationId' });
Movement.belongsTo(Request, { as: 'request', foreignKey: 'relatedRequestId' });
Movement.belongsTo(Transfer, { as: 'transfer', foreignKey: 'relatedTransferId' });

// Sincronizar todos os modelos
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Todos os modelos foram sincronizados com o banco de dados!');
  } catch (error) {
    console.error('❌ Erro ao sincronizar modelos:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Category,
  Location,
  Item,
  Request,
  Transfer,
  Movement,
  syncDatabase
};
