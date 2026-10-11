const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/api/src/routes/subscription.routes.js';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  "router.post('/subscribe', subController.subscribeToPlan);",
  "router.post('/initiate', subController.initiateSubscription);\nrouter.post('/verify', subController.verifySubscription);"
);

fs.writeFileSync(file, data);
