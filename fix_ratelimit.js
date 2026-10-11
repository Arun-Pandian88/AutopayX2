const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/api/src/routes/publicCheckout.routes.js';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  "max: 30, // 30 requests per 15 mins per IP",
  "max: 3000, // 3000 requests per 15 mins per IP (Increased for Dev Testing)"
);

fs.writeFileSync(file, data);
