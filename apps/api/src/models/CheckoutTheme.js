const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CheckoutTheme = sequelize.define('CheckoutTheme', {
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
  theme_id: {
    type: DataTypes.STRING,
    defaultValue: 'winter_wonder'
  },
  business_name: {
    type: DataTypes.STRING,
    defaultValue: 'AutoPayX'
  },
  brand_color: {
    type: DataTypes.STRING,
    defaultValue: '#244531'
  },
  brand_logo: {
    type: DataTypes.TEXT,
    defaultValue: 'A'
  },
  logo_type: {
    type: DataTypes.ENUM('text', 'image'),
    defaultValue: 'text'
  },
  background_image: {
    type: DataTypes.TEXT,
    defaultValue: 'festive_pattern_bg.jpg'
  }
}, {
  tableName: 'checkout_themes',
  timestamps: true
});

module.exports = CheckoutTheme;
