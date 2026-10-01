const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const PaymentSetting = sequelize.define('PaymentSetting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  app_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  master_upi_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  upi_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  payee_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mailbox_email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mailbox_password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_connected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  auto_routing_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  routing_upi_list: {
    type: DataTypes.JSON,
    defaultValue: [],
  }
}, {
  tableName: 'payment_settings',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'app_name']
    }
  ]
});

User.hasMany(PaymentSetting, { foreignKey: 'user_id', as: 'payment_settings' });
PaymentSetting.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = PaymentSetting;
