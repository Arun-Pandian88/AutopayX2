const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config({ path: 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/api/.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

async function test() {
  try {
    const [results] = await sequelize.query("SELECT * FROM transactions WHERE status = 'processing' ORDER BY created_at DESC LIMIT 1");
    if (results.length > 0) {
      console.log("Found Txn:", results[0].txn_id);
      
      // Hit the simulate endpoint
      const res = await fetch(`http://127.0.0.1:8000/api/pay/dummy_link/simulate/${results[0].txn_id}`, { method: 'POST' });
      const text = await res.text();
      console.log("Simulate Response:", text);
      
      // Hit the status endpoint
      const res2 = await fetch(`http://127.0.0.1:8000/api/pay/dummy_link/status/${results[0].txn_id}`);
      const text2 = await res2.text();
      console.log("Status Response:", text2);
    } else {
      console.log("No processing transactions found.");
    }
  } catch (err) {
    console.error(err);
  }
}
test();
