const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/pay/[slug]/page.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  "const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';",
  "const API = '';"
);

fs.writeFileSync(file, data);
