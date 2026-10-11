const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/dashboard/layout.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  'className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar"',
  'className="flex-1 overflow-y-auto px-4 md:px-10 pb-10 custom-scrollbar"'
);

fs.writeFileSync(file, data);
