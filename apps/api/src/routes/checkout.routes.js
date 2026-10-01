const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkout.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', checkoutController.getThemeSettings);
router.put('/', checkoutController.updateThemeSettings);

module.exports = router;
