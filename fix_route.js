const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/api/src/routes/publicCheckout.routes.js';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  "module.exports = router;",
  "router.post('/:link_id/simulate/:txn_id', publicCheckoutController.simulatePayment);\n\nmodule.exports = router;"
);

fs.writeFileSync(file, data);
