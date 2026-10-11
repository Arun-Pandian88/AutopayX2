const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/.env.local';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  'NEXT_PUBLIC_API_URL=http://localhost:8000',
  'NEXT_PUBLIC_API_URL=http://10.225.28.243:8000'
);

fs.writeFileSync(file, data);
