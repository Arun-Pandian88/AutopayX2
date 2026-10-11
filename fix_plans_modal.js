const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/dashboard/plans/page.tsx';
let data = fs.readFileSync(file, 'utf8');

const modalHtml = `
      {/* Checkout Modal */}
      {checkoutPlan && !success && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#F8F9FA]">
              <div>
                <h3 className="text-xl font-black text-[#1C1D22]">Upgrade to {checkoutPlan.name}</h3>
                <p className="text-xs text-gray-500 font-medium">Complete your payment securely</p>
              </div>
              <button disabled={verifying} onClick={() => setCheckoutPlan(null)} className="text-gray-400 hover:text-gray-900 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 font-medium mb-1">Amount to pay</p>
                <h2 className="text-4xl font-black text-[#6C3FE2]">?{checkoutPlan.price}</h2>
              </div>
              
              <div className="bg-white p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 mb-6">
                <QRCodeSVG
                  value={\`upi://pay?pa=autopayx@upi&pn=AutoPayX&am=\${checkoutPlan.price}&cu=INR&tn=Upgrade to \${checkoutPlan.name}\`}
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>
              
              <p className="text-xs font-medium text-gray-400 mb-6 text-center px-4">
                Scan this QR code with any UPI app (GPay, PhonePe, Paytm) to complete the payment.
              </p>
              
              <button 
                onClick={executeVerify}
                disabled={verifying}
                className="w-full py-4 bg-[#1C1D22] text-white font-bold rounded-xl hover:bg-black transition-all shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {verifying ? 'Verifying Payment...' : 'I have completed the payment'}
              </button>
            </div>
            
            <div className="py-3 bg-gray-50 border-t border-gray-100 text-center flex items-center justify-center gap-1.5 text-xs text-gray-500 font-bold">
              <ShieldCheck className="w-4 h-4 text-green-600" /> Secured by AutoPayX
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 flex flex-col items-center max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 relative">
               <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
               <Check className="w-10 h-10 text-green-600 relative z-10" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Payment Verified!</h2>
            <p className="text-gray-500 text-center text-sm font-medium">Your plan has been upgraded successfully. Reloading dashboard...</p>
          </div>
        </div>
      )}`;

const replacementRegex = /      <\/div>\s*<\/div>\s*\);\s*\}/;
data = data.replace(replacementRegex, modalHtml + '\n      </div>\n    </div>\n  );\n}');

fs.writeFileSync(file, data);
