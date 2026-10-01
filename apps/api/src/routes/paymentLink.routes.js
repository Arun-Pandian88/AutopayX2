const express = require('express');
const router = express.Router();
const paymentLinkController = require('../controllers/paymentLink.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', paymentLinkController.getPaymentLinks);
router.post('/', paymentLinkController.createPaymentLink);
router.delete('/:id', paymentLinkController.deletePaymentLink);
router.put('/:id', paymentLinkController.updatePaymentLink);

module.exports = router;
