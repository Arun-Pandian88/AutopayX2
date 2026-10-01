const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const WebhookEndpoint = sequelize.define('WebhookEndpoint', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  events: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'all'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  secret: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'webhook_endpoints',
  timestamps: true
});

module.exports = WebhookEndpoint;
