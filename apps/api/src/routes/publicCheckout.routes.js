const express = require('express');
const router = express.Router();
const publicCheckoutController = require('../controllers/publicCheckout.controller');
const rateLimit = require('express-rate-limit');

// Rate limit for public checkout (prevent abuse)
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 requests per 15 mins per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});

// These are PUBLIC routes — no auth required
router.get('/:link_id', checkoutLimiter, publicCheckoutController.getCheckoutDetails);
router.post('/:link_id/initiate', checkoutLimiter, publicCheckoutController.initiatePayment);
router.get('/:link_id/status/:txn_id', publicCheckoutController.checkStatus);

module.exports = router;
