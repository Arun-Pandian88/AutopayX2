const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/dashboard/settings/page.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  "import { User, Shield, Bell, CreditCard, Key, Smartphone, Mail, Lock, Camera, Check, Loader2, Eye, EyeOff } from 'lucide-react';",
  "import { User, Shield, Bell, CreditCard, Key, Smartphone, Mail, Lock, Camera, Check, Loader2, Eye, EyeOff, LogOut } from 'lucide-react';"
);

fs.writeFileSync(file, data);
