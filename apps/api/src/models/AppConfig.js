const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AppConfig = sequelize.define('AppConfig', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  success_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  failed_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  webhook_url: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'app_configs',
  timestamps: true
});

module.exports = AppConfig;
