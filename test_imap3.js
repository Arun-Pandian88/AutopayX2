require('dotenv').config({ path: 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/api/.env' });
const imap = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;

async function checkAllFolders() {
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
    const boxes = await connection.getBoxes();
    console.log("Found mailboxes:");
    for (const box in boxes) {
        console.log("- " + box);
        if (boxes[box].children) {
             for (const child in boxes[box].children) {
                 console.log("  - " + box + "/" + child);
             }
        }
    }
    
    // Check [Gmail]/All Mail for today's emails
    console.log("\nSearching in [Gmail]/All Mail...");
    await connection.openBox('[Gmail]/All Mail');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const searchCriteria = [['SINCE', today]];
    const fetchOptions = { bodies: ['HEADER.FIELDS (SUBJECT FROM DATE)'], markSeen: false };
    
    let messages = await connection.search(searchCriteria, fetchOptions);
    console.log(`Found ${messages.length} emails today across ALL folders.`);
    
    messages = messages.slice(-10); // Print last 10 subjects
    for (const item of messages) {
      const all = item.parts.find(p => p.which === 'HEADER.FIELDS (SUBJECT FROM DATE)');
      if (!all) continue;
      const mail = await simpleParser(all.body);
      console.log(`- [${mail.date}] From: ${mail.from.value[0].address} | Subject: ${mail.subject}`);
    }
    
    connection.end();
  } catch (err) {
    console.error("Error:", err);
  }
}

checkAllFolders();
