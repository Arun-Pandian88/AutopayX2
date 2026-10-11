const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/pay/[slug]/page.tsx';
let data = fs.readFileSync(file, 'utf8');

// Change handleInitiate to a hoisted function
const oldHandleInitiate = /const handleInitiate = async \(\) => {([\s\S]*?)body: JSON\.stringify\(\{ customer_name: customerName, customer_email: customerEmail \}\)([\s\S]*?)\};/;
const newHandleInitiate = `async function handleInitiate(overrideName, overrideEmail) {
$1body: JSON.stringify({ customer_name: overrideName || customerName, customer_email: overrideEmail || customerEmail })$2}`;

data = data.replace(oldHandleInitiate, newHandleInitiate);

// Update useEffect to auto-initiate
const oldUseEffect = /useEffect\(\(\) => \{([\s\S]*?\.then\(json => \{[\s\S]*?if \(json\?\.success\) \{)\s*setData\(json\.data\);\s*setState\('checkout'\);\s*\}([\s\S]*?)\}, \[slug, API\]\);/;
const newUseEffect = `useEffect(() => {$1
          setData(json.data);
          
          if (json.data.customer_name) setCustomerName(json.data.customer_name);
          if (json.data.customer_email) setCustomerEmail(json.data.customer_email);
          
          if (json.data.customer_name && json.data.customer_email) {
            handleInitiate(json.data.customer_name, json.data.customer_email);
          } else {
            setState('checkout');
          }
        }$2}, [slug, API]);`;

data = data.replace(oldUseEffect, newUseEffect);

fs.writeFileSync(file, data);
