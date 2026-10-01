const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Strict Auth Rate Limiter (Brute-force protection, handles Linux/Mac/Windows proxies properly)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { message: 'Too many authentication attempts from this IP, please try again after 15 minutes.' }
});

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/superadmin/login', authLimiter, authController.superadminLogin);
router.post('/logout', authController.logout);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.get('/me', protect, authController.getMe);
router.put('/me', protect, authController.updateMe);
router.put('/update-password', protect, authController.updatePassword);
router.get('/stats', protect, authController.getDashboardStats);
router.get('/plans', authController.getActivePlans);

module.exports = router;
