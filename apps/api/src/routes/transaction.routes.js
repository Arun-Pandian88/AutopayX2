const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', transactionController.getTransactions);
router.post('/:id/verify', transactionController.verifyTransaction);
router.delete('/', transactionController.deleteAllTransactions);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
