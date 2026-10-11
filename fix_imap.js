const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/api/src/services/imapWorker.js';
let data = fs.readFileSync(file, 'utf8');

// We need to import Plan, Subscription, Notification models
if (!data.includes('const Plan = require')) {
  data = data.replace(
    "const Transaction = require('../models/Transaction');",
    "const Transaction = require('../models/Transaction');\nconst Plan = require('../models/Plan');\nconst Subscription = require('../models/Subscription');\nconst Notification = require('../models/Notification');"
  );
}

const matchLogicRegex = /if \(txn\) \{([\s\S]*?)console\.log\(\`\[AutoPayX IMAP Worker\] Transaction \$\{txn\.txn_id\} verified successfully\!\`\);\s*\}/;
const newMatchLogic = `if (txn) {
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
                // Cancel old active subs
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
          }`;

data = data.replace(matchLogicRegex, newMatchLogic);

fs.writeFileSync(file, data);
