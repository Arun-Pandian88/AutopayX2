const express = require('express'); // trigger restart
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Import Routes
const authRoutes = require('./routes/auth.routes');
const superadminRoutes = require('./routes/superadmin.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const paymentSettingsRoutes = require('./routes/paymentSettings.routes');
const webhookRoutes = require('./routes/webhook.routes');
const apikeyRoutes = require('./routes/apikey.routes');
const checkoutRoutes = require('./routes/checkout.routes');
const configRoutes = require('./routes/config.routes');
const paymentLinkRoutes = require('./routes/paymentLink.routes');
const transactionRoutes = require('./routes/transaction.routes');
const publicCheckoutRoutes = require('./routes/publicCheckout.routes');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

// Load models to ensure they sync
require('./models/WebhookEndpoint');
require('./models/ApiKey');
require('./models/CheckoutTheme');
require('./models/AppConfig');
require('./models/PaymentLink');
require('./models/Transaction');

const app = express();

// Trust reverse proxy to properly extract real IP addresses in Linux/Ubuntu/Mac production environments (like Nginx, AWS, Cloudflare)
app.set('trust proxy', 1);

// Security Middlewares - Bank Level
app.use(helmet({
  contentSecurityPolicy: false, // Usually disabled in API servers since it's mostly for browsers
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' }, // Anti-clickjacking
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }, // Strict Transport Security
  ieNoOpen: true,
  noSniff: true, // X-Content-Type-Options
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true, // Basic XSS protection
}));

// Strict Global Rate limiting (DDoS protection)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 500, // strictly limit each IP to 500 requests per 15 mins
  message: { message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Prevent HTTP Param Pollution
app.use(hpp());

// Middlewares
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS (Bank-level strict origin policy)'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Mount Routes
app.use('/api/dashboard', authRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/payment-settings', paymentSettingsRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/apikeys', apikeyRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/config', configRoutes);
app.use('/api/payment-links', paymentLinkRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/pay', publicCheckoutRoutes); // Public checkout — no auth required

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AutoPayX Node.js API' });
});

// Error Handling Middleware (Global)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;
