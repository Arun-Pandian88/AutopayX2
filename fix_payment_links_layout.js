const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/dashboard/payment-links/page.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  '<div className="flex justify-between items-center mb-6">',
  '<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">'
);

fs.writeFileSync(file, data);
