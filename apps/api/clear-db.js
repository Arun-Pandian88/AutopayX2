require('dotenv').config();
const { sequelize } = require('./src/config/db');
const Transaction = require('./src/models/Transaction');

sequelize.sync().then(async () => {
  await Transaction.destroy({ where: {} });
  console.log('All transaction data has been successfully cleared!');
  process.exit();
}).catch(error => {
  console.error('Error clearing transactions:', error);
  process.exit(1);
});
