const { Sequelize } = require('sequelize');

let sequelize;

const dialectOptions = process.env.NODE_ENV === 'production' && !process.env.DB_DISABLE_SSL ? {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
} : {};

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'autopayx',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASS || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions
    }
  );
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected Successfully');
    
    // Sync all models (creates tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('Database tables synced');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
