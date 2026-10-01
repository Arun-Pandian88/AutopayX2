const express = require('express');
const router = express.Router();
const superadminController = require('../controllers/superadmin.controller');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes below and restrict to superadmin only
router.use(protect);
router.use(authorize('superadmin'));

router.get('/stats', superadminController.getStats);
router.get('/logs', superadminController.getLogs);

// Plan Routes
router.get('/plans', superadminController.getPlans);
router.post('/plans', superadminController.createPlan);
router.put('/plans/:id', superadminController.updatePlan);
router.delete('/plans/:id', superadminController.deletePlan);

// Merchant Management Routes
router.get('/merchants', superadminController.getMerchants);
router.put('/merchants/:id/status', superadminController.updateMerchantStatus);

module.exports = router;
