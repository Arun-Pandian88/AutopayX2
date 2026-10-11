const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/api/src/services/imapWorker.js';
let data = fs.readFileSync(file, 'utf8');

const newProcessNewEmails = `const processNewEmails = async () => {
  try {
    // Fetch emails from the last 24 hours to avoid missing read emails
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const searchCriteria = [['SINCE', since]];
    const fetchOptions = {
      bodies: [''],
      markSeen: true
    };
    
    const messages = await connection.search(searchCriteria, fetchOptions);
    
    for (const item of messages) {
      const all = item.parts.find(p => p.which === '');
      if (!all) continue;
      
      const mail = await simpleParser(all.body);
      const text = mail.text || mail.html || '';
      
      // Match UTR and Amount
      let utrMatch = text.match(/(?:UPI Ref No|UTR|Ref no)[\s:-]*(\d{12})/i);
      let amountMatch = text.match(/(?:Rs\.?|INR)[\s]*([0-9,]+(?:\.[0-9]{2})?)/i);
      
      if (utrMatch && amountMatch) {
        const utr = utrMatch[1];
        const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
        
        // Check if UTR is already processed to prevent duplicate processing
        const existingTxn = await Transaction.findOne({ where: { utr: utr } });
        if (existingTxn) {
          continue; // UTR already used, skip
        }
        
        console.log(\`[AutoPayX IMAP Worker] Found NEW Bank Alert - UTR: \${utr}, Amount: \${amount}\`);
        
        // Find matching pending transaction
        const txn = await Transaction.findOne({ 
          where: { 
            status: 'processing',
            amount: amount
          },
          order: [['createdAt', 'DESC']]
        });
        
        if (txn) {
            console.log(\`[AutoPayX IMAP Worker] Match found for Txn: \${txn.txn_id}. Verifying...\`);
            txn.status = 'success';
            txn.utr = utr;
            await txn.save();
            console.log(\`[AutoPayX IMAP Worker] Transaction \${txn.txn_id} verified successfully!\`);
            
            // Check if this is a platform plan upgrade
            if (txn.order_id && txn.order_id.startsWith('plan_upgrade_')) {
              const plan_id = txn.order_id.split('plan_upgrade_')[1];
              const plan = await Plan.findByPk(plan_id);
              if (plan) {
                await Subscription.update(
                  { status: 'cancelled' },
                  { where: { user_id: txn.user_id, status: 'active' } }
                );

                const now = new Date();
                const periodEnd = new Date(now);
                if (plan.interval === 'monthly') periodEnd.setMonth(periodEnd.getMonth() + 1);
                else periodEnd.setFullYear(periodEnd.getFullYear() + 1);

                await Subscription.create({
                  user_id: txn.user_id,
                  plan_id: plan.id,
                  qr_codes_used: 0,
                  transactions_used: 0,
                  current_period_start: now,
                  current_period_end: periodEnd,
                  status: 'active',
                });

                await Notification.create({
                  user_id: txn.user_id,
                  type: 'info',
                  title: \`Subscribed to \${plan.name}!\`,
                  message: \`Your plan has been upgraded successfully.\`,
                });
                console.log(\`[AutoPayX IMAP Worker] Plan upgrade executed for user \${txn.user_id}\`);
              }
            }
          }
      }
    }
  } catch (error) {
    console.error('[AutoPayX IMAP Worker] Error processing emails:', error);
  }
};`;

data = data.replace(/const processNewEmails = async \(\) => \{[\s\S]*\};\s*module\.exports = \{ startIMAPWorker \};/, newProcessNewEmails + '\n\nmodule.exports = { startIMAPWorker };');
fs.writeFileSync(file, data);
