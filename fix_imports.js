const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/dashboard/plans/page.tsx';
let data = fs.readFileSync(file, 'utf8');

const importRegex = /import \{ (.*?) \} from 'lucide-react';/;
data = data.replace(importRegex, "import { $1, X, ShieldCheck } from 'lucide-react';\nimport { QRCodeSVG } from 'qrcode.react';");

fs.writeFileSync(file, data);
