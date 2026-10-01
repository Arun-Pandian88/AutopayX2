require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
require('./models/User');
require('./models/Plan');
require('./models/Subscription');
require('./models/Notification');
require('./models/PaymentSetting');
const { Server } = require('socket.io');

// 1. Connect to Database
connectDB();

// Start Background IMAP Email Verification Worker
const { startIMAPWorker } = require('./services/imapWorker');
startIMAPWorker();

// 2. Create HTTP Server
const server = http.createServer(app);

// 3. Initialize WebSockets (Socket.io)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }
});

// Setup Socket logic
io.on('connection', (socket) => {
  console.log('Client connected to real-time stream:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Inject io into express for access in controllers
app.set('io', io);

// 4. Start Server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`AutoPayX Node.js API running on http://localhost:${PORT}`);
});
