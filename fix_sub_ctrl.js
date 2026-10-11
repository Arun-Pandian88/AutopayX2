const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/api/src/controllers/subscription.controller.js';
let data = fs.readFileSync(file, 'utf8');

// Add initiate
const initiateCode = `// Initiate subscription (creates a mock intent for now)
exports.initiateSubscription = async (req, res, next) => {
  try {
    const { plan_id } = req.body;
    const plan = await Plan.findByPk(plan_id);
    if (!plan || plan.status !== 'active') {
      return res.status(404).json({ message: 'Plan not found or inactive.' });
    }
    
    // Just return a tracking ID and the plan details for the checkout modal
    const txn_id = 'sub_' + Math.random().toString(36).substr(2, 9);
    res.json({ success: true, data: { txn_id, plan_name: plan.name, amount: plan.price } });
  } catch (error) {
    next(error);
  }
};
`;

// Replace subscribeToPlan with verifySubscription
data = data.replace('exports.subscribeToPlan = async', initiateCode + '\nexports.verifySubscription = async');

fs.writeFileSync(file, data);
