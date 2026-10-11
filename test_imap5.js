require('dotenv').config({ path: 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/api/.env' });
const imap = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;

async function checkLatestEmails() {
  const config = {
    imap: {
      user: process.env.IMAP_USER,
      password: process.env.IMAP_PASSWORD,
      host: process.env.IMAP_HOST || 'imap.gmail.com',
      port: 993,
      tls: true,
      authTimeout: 3000,
      tlsOptions: { rejectUnauthorized: false }
    }
  };

  try {
    const connection = await imap.connect(config);
    await connection.openBox('INBOX');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const searchCriteria = [['SINCE', today]];
    const fetchOptions = { bodies: ['HEADER.FIELDS (SUBJECT FROM DATE)'], markSeen: false };
    
    let messages = await connection.search(searchCriteria, fetchOptions);
    console.log(`Total emails today: ${messages.length}`);
    messages = messages.slice(-15);
    
    for (const item of messages) {
      const all = item.parts.find(p => p.which === 'HEADER.FIELDS (SUBJECT FROM DATE)');
      if (!all) continue;
      const mail = await simpleParser(all.body);
      console.log(`[${mail.date}] ${mail.subject}`);
    }
    
    connection.end();
  } catch (err) {
    console.error("Error:", err);
  }
}

checkLatestEmails();
