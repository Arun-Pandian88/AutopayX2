require('dotenv').config({ path: 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/api/.env' });
const imap = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;

async function checkLatestBankEmail() {
  const config = {
    imap: {
      user: process.env.IMAP_USER,
      password: process.env.IMAP_PASSWORD,
      host: process.env.IMAP_HOST || 'imap.gmail.com',
      port: 993,
      tls: true,
      authTimeout: 10000,
      tlsOptions: { rejectUnauthorized: false }
    }
  };

  try {
    const connection = await imap.connect(config);
    await connection.openBox('INBOX');
    
    // Fetch last 5 emails
    const searchCriteria = ['ALL'];
    const fetchOptions = { bodies: [''], markSeen: false };
    
    let messages = await connection.search(searchCriteria, fetchOptions);
    messages = messages.slice(-5);
    
    for (const item of messages) {
      const all = item.parts.find(p => p.which === '');
      if (!all) continue;
      
      const mail = await simpleParser(all.body);
      const text = mail.text || mail.html || '';
      console.log("=========================================");
      console.log("SUBJECT:", mail.subject);
      
      let utrMatch = text.match(/(?:UPI Ref No|UTR|Ref no|UPI ID|Reference No|Ref\. No)[\s:-]*(\d{12})/i);
      let amountMatch = text.match(/(?:Rs\.?|INR)[\s]*([0-9,]+(?:\.[0-9]{2})?)/i);
      
      console.log("Regex UTR Match:", utrMatch ? utrMatch[1] : null);
      console.log("Regex Amount Match:", amountMatch ? amountMatch[1] : null);
      
      console.log("FULL TEXT PREVIEW:");
      console.log(text.substring(0, 500).replace(/\s+/g, ' '));
    }
    
    connection.end();
  } catch (err) {
    console.error("Error:", err);
  }
}

checkLatestBankEmail();
