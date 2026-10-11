const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/next.config.ts';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  "destination: 'http://localhost:8000/api/:path*'",
  "destination: 'http://127.0.0.1:8000/api/:path*'"
);

fs.writeFileSync(file, data);
