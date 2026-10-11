const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/dashboard/transactions/page.tsx';
let data = fs.readFileSync(file, 'utf8');

const oldBtn = /className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"/;
const newBtn = 'className="w-9 h-9 bg-red-50/80 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors shadow-sm ml-auto"';

data = data.replace(oldBtn, newBtn);
fs.writeFileSync(file, data);
