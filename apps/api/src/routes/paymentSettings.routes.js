const express = require('express');
const router = express.Router();
const paymentSettingsController = require('../controllers/paymentSettings.controller');
const { protect } = require('../middleware/auth');

router.get('/', protect, paymentSettingsController.getSettings);
router.post('/master', protect, paymentSettingsController.saveMasterDetails);
router.post('/mailbox', protect, paymentSettingsController.connectMailbox);
router.post('/mailbox/disconnect', protect, paymentSettingsController.disconnectMailbox);
router.post('/routing', protect, paymentSettingsController.saveRoutingList);

module.exports = router;
