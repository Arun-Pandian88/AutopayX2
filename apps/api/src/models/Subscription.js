const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  plan_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  // Usage tracking
  qr_codes_used: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  transactions_used: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // Billing cycle
  current_period_start: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  current_period_end: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'cancelled'),
    defaultValue: 'active',
  },
}, {
  tableName: 'subscriptions',
  timestamps: true,
});

module.exports = Subscription;
