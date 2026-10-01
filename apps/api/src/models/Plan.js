const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Plan = sequelize.define('Plan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'INR',
  },
  interval: {
    type: DataTypes.ENUM('monthly', 'yearly', 'forever'),
    defaultValue: 'monthly',
  },
  features: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  // Plan Limits
  limits: {
    type: DataTypes.JSONB,
    defaultValue: {
      qr_codes: 0,
      transactions_per_month: 0,
      webhooks: false,
      api_access: false,
      whatsapp_alerts: false,
      priority_support: false,
    },
  },
  is_custom: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'archived'),
    defaultValue: 'active',
  },
}, {
  tableName: 'plans',
  timestamps: true,
});

module.exports = Plan;
