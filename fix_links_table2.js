const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/dashboard/payment-links/page.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  /<\/tbody>\s*<\/table>/,
  "</tbody>\n          </table>\n        </div>"
);

fs.writeFileSync(file, data);
