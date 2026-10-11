const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/api/src/controllers/transaction.controller.js';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  "status: { [Op.ne]: 'processing' } // Hide unpaid initiated checkouts",
  "// status: { [Op.ne]: 'processing' } // Removed: User wants to see processing txns too"
);

fs.writeFileSync(file, data);
