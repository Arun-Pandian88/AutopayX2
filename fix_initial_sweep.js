const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/api/src/services/imapWorker.js';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  "console.log('[AutoPayX IMAP Worker] Connected to IMAP. Listening for bank alerts...');",
  "console.log('[AutoPayX IMAP Worker] Connected to IMAP. Listening for bank alerts...');\n    // Do an initial sweep for emails missed while offline\n    processNewEmails();"
);

fs.writeFileSync(file, data);
