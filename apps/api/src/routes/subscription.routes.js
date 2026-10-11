const express = require('express');
const router = express.Router();
const subController = require('../controllers/subscription.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/my', subController.getMySubscription);
router.post('/initiate', subController.initiateSubscription);
router.get('/status/:txn_id', subController.getSubscriptionStatus);
router.post('/use-resource', subController.useResource);
router.get('/notifications', subController.getNotifications);
router.put('/notifications/read', subController.markRead);

module.exports = router;
