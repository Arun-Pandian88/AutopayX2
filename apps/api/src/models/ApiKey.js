const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ApiKey = sequelize.define('ApiKey', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  mode: {
    type: DataTypes.ENUM('live', 'test'),
    defaultValue: 'test'
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  secret: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'revoked'),
    defaultValue: 'active'
  }
}, {
  tableName: 'api_keys',
  timestamps: true
});

module.exports = ApiKey;
