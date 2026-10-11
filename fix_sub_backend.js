const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/api/src/controllers/subscription.controller.js';
let data = fs.readFileSync(file, 'utf8');

// Add Transaction to imports
if (!data.includes("const Transaction = require('../models/Transaction');")) {
  data = data.replace("const Notification = require('../models/Notification');", "const Notification = require('../models/Notification');\nconst Transaction = require('../models/Transaction');");
}

// Update initiateSubscription
const initiateRegex = /exports\.initiateSubscription = async \([\s\S]*?res\.json\(\{ success: true, data: \{ txn_id, plan_name: plan\.name, amount: plan\.price \} \}\);\s*\} catch \(error\) \{/m;
const newInitiate = `exports.initiateSubscription = async (req, res, next) => {
  try {
    const { plan_id } = req.body;
    const plan = await Plan.findByPk(plan_id);
    if (!plan || plan.status !== 'active') {
      return res.status(404).json({ message: 'Plan not found or inactive.' });
    }
    
    // Create a transaction in DB
    const txn_id = 'sub_' + require('crypto').randomBytes(8).toString('hex');
    const order_id = 'plan_upgrade_' + plan_id;
    
    await Transaction.create({
      user_id: req.user.id,
      txn_id,
      order_id,
      amount: plan.price,
      status: 'processing',
      gateway_app: 'AutoPayX Platform',
      upi_id: 'autopayx@upi'
    });

    res.json({ success: true, data: { txn_id, plan_name: plan.name, amount: plan.price } });
  } catch (error) {`;
data = data.replace(initiateRegex, newInitiate);

// Add getSubscriptionStatus
const verifyRegex = /exports\.verifySubscription = async \([\s\S]*?\n\};/m;
const statusEndpoint = `exports.getSubscriptionStatus = async (req, res, next) => {
  try {
    const { txn_id } = req.params;
    const txn = await Transaction.findOne({ where: { txn_id, user_id: req.user.id } });
    
    if (!txn) return res.status(404).json({ success: false });
    
    if (txn.status === 'success') {
      res.json({ success: true, status: 'success' });
    } else {
      res.json({ success: true, status: 'processing' });
    }
  } catch (err) {
    next(err);
  }
};`;
data = data.replace(verifyRegex, statusEndpoint);

fs.writeFileSync(file, data);
