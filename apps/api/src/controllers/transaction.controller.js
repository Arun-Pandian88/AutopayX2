const Transaction = require('../models/Transaction');
const { Op } = require('sequelize');

exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.findAll({ 
      where: { 
        user_id: req.user.id,
        // status: { [Op.ne]: 'processing' } // Removed: User wants to see processing txns too
      },
      order: [['createdAt', 'DESC']]
    });
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { utr } = req.body;
    
    const transaction = await Transaction.findOne({ where: { id, user_id: req.user.id } });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Stub for Auto-Verify Payment logic
    if (utr) {
      // Simulate verifying with bank/NPCI via UTR
      transaction.utr = utr;
      transaction.status = 'success';
      await transaction.save();
      
      return res.json({ success: true, message: 'Transaction auto-verified successfully', data: transaction });
    }

    res.status(400).json({ success: false, message: 'UTR is required for verification' });
  } catch (error) {
    next(error);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findOne({ where: { id, user_id: req.user.id } });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    await transaction.destroy();
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
};
exports.deleteAllTransactions = async (req, res, next) => {
  try {
    await Transaction.destroy({ where: { user_id: req.user.id } });
    res.json({ success: true, message: 'All transactions deleted successfully' });
  } catch (error) {
    next(error);
  }
};
