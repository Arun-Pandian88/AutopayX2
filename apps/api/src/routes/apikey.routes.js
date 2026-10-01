const express = require('express');
const router = express.Router();
const apikeyController = require('../controllers/apikey.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', apikeyController.getKeys);
router.post('/generate', apikeyController.generateKey);
router.delete('/:id', apikeyController.deleteKey);

module.exports = router;
