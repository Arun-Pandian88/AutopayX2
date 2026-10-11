const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/api/src/controllers/publicCheckout.controller.js';
let data = fs.readFileSync(file, 'utf8');

const regex = /\s*\/\/ If single-use link, mark as inactive after first use\s*if \(link\.type === 'single'\) \{\s*link\.status = 'inactive';\s*await link\.save\(\);\s*\}/m;
data = data.replace(regex, "");

fs.writeFileSync(file, data);
