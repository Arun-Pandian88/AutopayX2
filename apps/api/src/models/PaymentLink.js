const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PaymentLink = sequelize.define('PaymentLink', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  link_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('single', 'multiple'),
    defaultValue: 'single'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'expired'),
    defaultValue: 'active'
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'payment_links',
  timestamps: true
});

module.exports = PaymentLink;
