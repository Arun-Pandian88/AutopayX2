const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/pay/[slug]/page.tsx';
let data = fs.readFileSync(file, 'utf8');

const targetStr = `          <button 
            className="w-full py-4 text-white font-bold rounded-xl flex items-center justify-center transition-all hover:opacity-90 shadow-md"
            style={{ backgroundColor: brandColor && brandColor !== '#6C3FE2' ? brandColor : '#424553' }}
          >
            Scan QR to pay ,1{data?.amount?.toFixed(0)} <ArrowUpRight className="w-4 h-4 ml-1.5" />
          </button>`;

const replacementStr = `          <button 
            className="w-full py-4 text-white font-bold rounded-xl flex items-center justify-center transition-all hover:opacity-90 shadow-md"
            style={{ backgroundColor: brandColor && brandColor !== '#6C3FE2' ? brandColor : '#424553' }}
          >
            Scan QR to pay ?{data?.amount?.toFixed(0)} <ArrowUpRight className="w-4 h-4 ml-1.5" />
          </button>
          
          {/* Test Mode Button */}
          <div className="mt-4 pt-4 border-t border-gray-100 border-dashed">
            <button
              onClick={handleSimulatePayment}
              className="w-full py-2.5 bg-yellow-50 text-yellow-700 text-sm font-semibold rounded-lg hover:bg-yellow-100 transition-colors border border-yellow-200"
            >
              Simulate Payment (Dev Testing)
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-2 leading-relaxed">
              Clicking this will instantly bypass the IMAP email verification<br/>and mark this transaction as paid.
            </p>
          </div>`;

data = data.replace(targetStr, replacementStr);
fs.writeFileSync(file, data);
