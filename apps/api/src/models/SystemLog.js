const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SystemLog = sequelize.define('SystemLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('info', 'success', 'warning', 'error'),
    defaultValue: 'info',
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  merchant_id: {
    type: DataTypes.UUID,
    allowNull: true,
  }
}, {
  timestamps: true,
});

module.exports = SystemLog;
