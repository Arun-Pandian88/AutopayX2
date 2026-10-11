const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/api/src/services/imapWorker.js';
let data = fs.readFileSync(file, 'utf8');

const replacement = `  try {
    connection = await imap.connect(config);
    
    // Catch random ECONNRESET or timeouts so they don't crash the server
    connection.on('error', (err) => {
      console.error('[AutoPayX IMAP Worker] Unexpected connection error:', err.message);
      // Try to restart worker after 5 seconds
      setTimeout(() => {
        console.log('[AutoPayX IMAP Worker] Attempting to reconnect...');
        startIMAPWorker();
      }, 5000);
    });

    connection.on('close', () => {
      console.log('[AutoPayX IMAP Worker] Connection closed unexpectedly. Reconnecting...');
      setTimeout(() => {
        startIMAPWorker();
      }, 5000);
    });

    await connection.openBox('INBOX');
    console.log('[AutoPayX IMAP Worker] Connected to IMAP. Listening for bank alerts...');
  } catch (error) {
    console.error('[AutoPayX IMAP Worker] Connection failed:', error.message);
    // Try to reconnect if initial connection fails (e.g. timeout)
    setTimeout(() => {
      console.log('[AutoPayX IMAP Worker] Attempting to reconnect after failure...');
      startIMAPWorker();
    }, 10000);
  }`;

data = data.replace(
  /  try \{\s+connection = await imap\.connect\(config\);\s+await connection\.openBox\('INBOX'\);\s+console\.log\('\[AutoPayX IMAP Worker\] Connected to IMAP. Listening for bank alerts\.\.\.'\);\s+\} catch \(error\) \{\s+console\.error\('\[AutoPayX IMAP Worker\] Connection failed:', error\);\s+\}/,
  replacement
);

fs.writeFileSync(file, data);
