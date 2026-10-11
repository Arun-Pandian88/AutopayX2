const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/pay/[slug]/page.tsx';
let data = fs.readFileSync(file, 'utf8');

// Fix handleInitiate declaration
data = data.replace(
  "async function handleInitiate(overrideName, overrideEmail) {",
  "async function handleInitiate(overrideName?: any, overrideEmail?: any) {"
);

// Fix onClick
data = data.replace(
  "onClick={handleInitiate}",
  "onClick={() => handleInitiate()}"
);

fs.writeFileSync(file, data);
