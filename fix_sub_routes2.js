const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/api/src/routes/subscription.routes.js';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  "router.post('/verify', subController.verifySubscription);",
  "router.get('/status/:txn_id', subController.getSubscriptionStatus);"
);

fs.writeFileSync(file, data);
