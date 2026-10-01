const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', webhookController.getWebhooks);
router.post('/', webhookController.createWebhook);
router.put('/:id', webhookController.updateWebhook);
router.delete('/:id', webhookController.deleteWebhook);

module.exports = router;
