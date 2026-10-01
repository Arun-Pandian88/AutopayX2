const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  txn_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  order_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customer_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  customer_email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'INR'
  },
  status: {
    type: DataTypes.ENUM('processing', 'success', 'failed'),
    defaultValue: 'processing'
  },
  payment_method: {
    type: DataTypes.STRING,
    defaultValue: 'UPI'
  },
  upi_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  utr: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'transactions',
  timestamps: true
});

module.exports = Transaction;
