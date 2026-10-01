require('dotenv').config();
const { connectDB } = require('./src/config/db');
const User = require('./src/models/User');

const createSuperAdmin = async () => {
  await connectDB();
  
  try {
    const existing = await User.findOne({ where: { email: 'admin@autopayx.in' } });
    
    if (existing) {
      console.log('Superadmin already exists!');
      process.exit(0);
    }

    await User.create({
      name: 'Super Admin',
      email: 'admin@autopayx.in',
      password: 'password123', // Will be hashed by Sequelize hook
      business_name: 'AutoPayX HQ',
      role: 'superadmin',
      status: 'active'
    });

    console.log('Superadmin created successfully! (Email: admin@autopayx.in, Password: password123)');
    process.exit(0);
  } catch (error) {
    console.error('Error creating superadmin:', error);
    process.exit(1);
  }
};

createSuperAdmin();
