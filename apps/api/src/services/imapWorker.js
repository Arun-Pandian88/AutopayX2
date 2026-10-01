const imap = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;
const Transaction = require('../models/Transaction');

let connection;

const startIMAPWorker = async () => {
  // Wait for IMAP credentials in .env, else do nothing
  if (!process.env.IMAP_USER || !process.env.IMAP_PASSWORD) {
    console.log('IMAP_USER or IMAP_PASSWORD not configured. Automatic email verification is disabled.');
    return;
  }

  const config = {
    imap: {
      user: process.env.IMAP_USER,
      password: process.env.IMAP_PASSWORD,
      host: process.env.IMAP_HOST || 'imap.gmail.com',
      port: 993,
      tls: true,
      authTimeout: 3000,
      tlsOptions: { rejectUnauthorized: false }
    },
    onmail: function (numNewMail) {
      console.log(`[AutoPayX IMAP Worker] New email received: ${numNewMail}`);
      processNewEmails();
    }
  };

  try {
    connection = await imap.connect(config);
    await connection.openBox('INBOX');
    console.log('[AutoPayX IMAP Worker] Connected to IMAP. Listening for bank alerts...');
  } catch (error) {
    console.error('[AutoPayX IMAP Worker] Connection failed:', error);
  }
};

const processNewEmails = async () => {
  try {
    // Fetch unread emails
    const searchCriteria = ['UNSEEN'];
    const fetchOptions = {
      bodies: ['HEADER', 'TEXT'],
      markSeen: true
    };
    
    const messages = await connection.search(searchCriteria, fetchOptions);
    
    for (const item of messages) {
      const all = item.parts.find(p => p.which === 'TEXT');
      const id = item.attributes.uid;
      const idHeader = "Imap-Id: "+id+"\r\n";
      
      const mail = await simpleParser(idHeader + all.body);
      
      const text = mail.text || '';
      
      // Simple parsing logic for Indian Banks (HDFC, ICICI, SBI etc.)
      // Ex: "Rs. 2499.00 has been credited to your a/c ... UPI Ref No 123456789012"
      let utrMatch = text.match(/(?:UPI Ref No|UTR|Ref no)[\s:-]*(\d{12})/i);
      let amountMatch = text.match(/(?:Rs\.?|INR)[\s]*([0-9,]+\.[0-9]{2})/i);
      
      if (utrMatch && amountMatch) {
        const utr = utrMatch[1];
        const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
        
        console.log(`[AutoPayX IMAP Worker] Found Bank Alert - UTR: ${utr}, Amount: ${amount}`);
        
        // Find matching pending transaction
        const txn = await Transaction.findOne({ 
          where: { 
            status: 'processing',
            amount: amount // Match exact amount
          },
          order: [['createdAt', 'DESC']] // get latest
        });
        
        if (txn) {
          console.log(`[AutoPayX IMAP Worker] Match found for Txn: ${txn.txn_id}. Verifying...`);
          txn.status = 'success';
          txn.utr = utr;
          await txn.save();
          console.log(`[AutoPayX IMAP Worker] Transaction ${txn.txn_id} verified successfully!`);
        }
      }
    }
  } catch (error) {
    console.error('[AutoPayX IMAP Worker] Error processing emails:', error);
  }
};

module.exports = { startIMAPWorker };
