const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/dashboard/transactions/page.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  "return matchesSearch && isCompleted;",
  "return matchesSearch; // Changed: Show processing transactions too"
);

fs.writeFileSync(file, data);
