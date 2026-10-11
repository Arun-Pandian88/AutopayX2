const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/dashboard/transactions/page.tsx';
let data = fs.readFileSync(file, 'utf8');
data = data.replace(
  "import { Search, Filter, Download, ArrowUpRight, ArrowDownRight, CreditCard, Activity, Trash2 } from 'lucide-react';",
  "import { Search, Filter, Download, ArrowUpRight, ArrowDownRight, CreditCard, Activity, Trash2, Loader2 } from 'lucide-react';"
);
fs.writeFileSync(file, data);
