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
    const fetchOptions = { bodies: [''], markSeen: false };
    
    let messages = await connection.search(searchCriteria, fetchOptions);
    messages = messages.slice(-5); // Get last 5
    
    for (const item of messages) {
      const all = item.parts.find(p => p.which === '');
      if (!all) continue;
      
      const mail = await simpleParser(all.body);
      const text = mail.text || mail.html || '';
      console.log("=========================================");
      console.log("SUBJECT:", mail.subject);
      
      let utrMatch = text.match(/(?:UPI Ref No|UTR|Ref no|UPI ID)[\s:-]*(\d{12})/i);
      let amountMatch = text.match(/(?:Rs\.?|INR)[\s]*([0-9,]+(?:\.[0-9]{2})?)/i);
      
      console.log("UTR Match:", utrMatch ? utrMatch[1] : null);
      console.log("Amount Match:", amountMatch ? amountMatch[1] : null);
      
      // If it looks like a bank email but didn't match, print the text
      if (mail.subject.toLowerCase().includes('credit') || mail.subject.toLowerCase().includes('rs') || mail.subject.toLowerCase().includes('inr') || mail.subject.toLowerCase().includes('transfer') || mail.subject.toLowerCase().includes('received')) {
         console.log("TEXT FULL:", text.substring(0, 1000).replace(/\s+/g, ' '));
      }
    }
    
    connection.end();
  } catch (err) {
    console.error("Error:", err);
  }
}

checkLatestEmails();
