const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/dashboard/transactions/page.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  '<div className="flex justify-between items-center mb-8">',
  '<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">'
);

data = data.replace(
  '<div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">',
  '<div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-gray-50/50">'
);

data = data.replace(
  '<div className="relative w-96">',
  '<div className="relative w-full md:w-96">'
);

fs.writeFileSync(file, data);
