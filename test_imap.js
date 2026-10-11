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
    console.log("Connecting to IMAP...");
    const connection = await imap.connect(config);
    await connection.openBox('INBOX');
    console.log("Connected. Searching latest 3 emails...");
    
    // Fetch last 3 emails
    const searchCriteria = ['ALL'];
    const fetchOptions = { bodies: [''], markSeen: false };
    
    let messages = await connection.search(searchCriteria, fetchOptions);
    messages = messages.slice(-3); // Get last 3
    
    for (const item of messages) {
      const all = item.parts.find(p => p.which === '');
      if (!all) continue;
      
      const mail = await simpleParser(all.body);
      const text = mail.text || '';
      console.log("=========================================");
      console.log("SUBJECT:", mail.subject);
      console.log("TEXT PREVIEW:", text.substring(0, 300).replace(/\s+/g, ' '));
      
      // Test regex
      let utrMatch = text.match(/(?:UPI Ref No|UTR|Ref no)[\s:-]*(\d{12})/i);
      let amountMatch = text.match(/(?:Rs\.?|INR)[\s]*([0-9,]+(?:\.[0-9]{2})?)/i);
      
      console.log("UTR Match:", utrMatch ? utrMatch[1] : null);
      console.log("Amount Match:", amountMatch ? amountMatch[1] : null);
    }
    
    connection.end();
  } catch (err) {
    console.error("Error:", err);
  }
}

checkLatestEmails();
