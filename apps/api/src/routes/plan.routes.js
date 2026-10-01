const express = require('express');
const router = express.Router();
const planController = require('../controllers/plan.controller');

// Public route to get active plans
router.get('/', planController.getActivePlans);

module.exports = router;
