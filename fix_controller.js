const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/api/src/controllers/publicCheckout.controller.js';
let data = fs.readFileSync(file, 'utf8');

const simulateFunc = `
// POST /api/pay/:link_id/simulate/:txn_id - DEMO PURPOSES ONLY
exports.simulatePayment = async (req, res, next) => {
  try {
    const { txn_id } = req.params;
    const transaction = await Transaction.findOne({ where: { txn_id } });
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    if (transaction.status === 'success') {
      return res.json({ success: true, message: 'Already paid' });
    }

    // Fake Verification
    transaction.status = 'success';
    transaction.utr = 'DEMO' + Math.floor(10000000 + Math.random() * 90000000);
    await transaction.save();

    res.json({ success: true, message: 'Payment simulated successfully' });
  } catch (error) {
    next(error);
  }
};
`;

data = data + '\n' + simulateFunc;
fs.writeFileSync(file, data);
