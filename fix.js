const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/dashboard/payment-links/page.tsx';
let data = fs.readFileSync(file, 'utf8');

const toastCode = `
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1C1D22] text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm flex items-center z-[200] animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 mr-2 text-[#bdf32b]" />
          {toastMessage}
        </div>
      )}
`;

// Insert the toast at the end of the success view
// Look for the "Copy" button in success view which is followed by 3 closing divs
data = data.replace(/(<button[^>]*onClick=\{[^}]*copyToClipboard[^}]*\}[^>]*>\s*<Copy[^>]*\/> Copy\s*<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*)(<\/div>\s*\)\;\s*\})/m, '$1' + toastCode + '\n$2');

// Also for test checkout view
// Look for "Scan QR to pay" button which is followed by 3 closing divs
data = data.replace(/(Scan QR to pay.*?<\/button>\s*<\/div>\s*<\/div>\s*)(<\/div>\s*\)\;\s*\})/m, '$1' + toastCode + '\n$2');

fs.writeFileSync(file, data);
