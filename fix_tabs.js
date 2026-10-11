const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/pay/[slug]/page.tsx';
let data = fs.readFileSync(file, 'utf8');

// Add the paymentTab state
const stateLineRegex = /const \[copied, setCopied\] = useState\(false\);\n  const \[timeLeft, setTimeLeft\] = useState\(300\); \/\/ 5 minutes timer/;
const newStateCode = `const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timer
  const [paymentTab, setPaymentTab] = useState<'qr' | 'upi_id' | 'upi_app'>('qr');`;

data = data.replace(stateLineRegex, newStateCode);

// Add isMobile logic
const isMobileCode = `
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
`;
data = data.replace('const formatTime =', isMobileCode + '\n  const formatTime =');

// Update Tabs
const oldTabsRegex = /\{\/\* Tabs \*\/\}\s*<div className="flex bg-\[#F4F5F9\] p-1\.5 rounded-xl mb-8">[\s\S]*?<\/div>/;
const newTabsCode = `{/* Tabs */}
            <div className="flex bg-[#F4F5F9] p-1.5 rounded-xl mb-8">
              <button 
                onClick={() => setPaymentTab('qr')}
                className={\`flex-1 py-2.5 \${paymentTab === 'qr' ? 'bg-[#1C1D22] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'} rounded-lg text-sm font-bold flex items-center justify-center transition-all\`}
              >
                <QrCode className="w-4 h-4 mr-2" /> Scan QR
              </button>
              <button 
                onClick={() => setPaymentTab('upi_id')}
                className={\`flex-1 py-2.5 \${paymentTab === 'upi_id' ? 'bg-[#1C1D22] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'} rounded-lg text-sm font-bold flex items-center justify-center transition-all\`}
              >
                <LinkIcon className="w-4 h-4 mr-2" /> UPI ID
              </button>
              <button 
                onClick={() => setPaymentTab('upi_app')}
                className={\`flex-1 py-2.5 \${paymentTab === 'upi_app' ? 'bg-[#1C1D22] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'} rounded-lg text-sm font-bold flex items-center justify-center transition-all\`}
              >
                <Smartphone className="w-4 h-4 mr-2" /> UPI app
              </button>
            </div>`;

data = data.replace(oldTabsRegex, newTabsCode);

// Update QR Box and other contents
const oldQrBoxRegex = /\{\/\* QR Box \*\/\}\s*<div className="flex flex-col items-center justify-center mb-6">[\s\S]*?\{\/\* Action Button \*\/\}/;

const newQrBoxCode = `{/* QR Box */}
            <div className="flex flex-col items-center justify-center mb-6 min-h-[300px]">
              {paymentTab === 'qr' && (
                <>
                  {upiLinkWithTr ? (
                    <div className="bg-white p-4 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 mb-6 flex justify-center">
                      <QRCodeSVG value={upiLinkWithTr} size={200} level="H" includeMargin={false} />
                    </div>
                  ) : (
                    <div className="w-[232px] h-[232px] bg-gray-100 rounded-[24px] mb-6 flex flex-col items-center justify-center text-gray-400 text-sm font-medium">
                      QR Not Available
                    </div>
                  )}
                  <h3 className="text-[#1C1D22] font-bold mb-1.5 text-base">Scan with any UPI app</h3>
                  <p className="text-xs font-medium text-gray-400">Google Pay • PhonePe • Paytm • BHIM</p>
                </>
              )}
              
              {paymentTab === 'upi_id' && (
                <div className="w-full">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#F4F5F9] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                      <LinkIcon className="w-8 h-8 text-[#1C1D22]" />
                    </div>
                    <h3 className="text-[#1C1D22] font-bold mb-1">Pay via UPI ID</h3>
                    <p className="text-sm text-gray-500 mb-6">Copy our UPI ID to pay from any app</p>
                    
                    <div className="bg-[#F4F5F9] border border-gray-100 rounded-xl p-4 flex items-center justify-between mb-4">
                      <div className="text-left">
                        <p className="text-xs text-gray-500 font-bold mb-1">VPA / UPI ID</p>
                        <p className="text-sm font-bold text-[#1C1D22]">{data?.upi_id || 'Not available'}</p>
                      </div>
                      <button 
                        onClick={copyUPI}
                        className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-600" />}
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      Step 1: Copy the UPI ID<br/>
                      Step 2: Open any UPI app<br/>
                      Step 3: Paste and pay exactly ?{data?.amount?.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
              
              {paymentTab === 'upi_app' && (
                <div className="w-full text-center">
                  <div className="w-16 h-16 bg-[#F4F5F9] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <Smartphone className="w-8 h-8 text-[#1C1D22]" />
                  </div>
                  <h3 className="text-[#1C1D22] font-bold mb-1">Open UPI App</h3>
                  <p className="text-sm text-gray-500 mb-6">Directly open a UPI app on your phone</p>
                  
                  {isMobile ? (
                    <a 
                      href={upiLinkWithTr}
                      className="w-full py-4 text-white font-bold rounded-xl flex items-center justify-center shadow-md shadow-[#6C3FE2]/20 mb-4 bg-[#6C3FE2] transition-transform active:scale-95"
                    >
                      <Smartphone className="w-5 h-5 mr-2" /> Open UPI App
                    </a>
                  ) : (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-orange-700 text-sm font-bold">
                      This option is only available on mobile devices. Please scan the QR code instead.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Button */}`;

data = data.replace(oldQrBoxRegex, newQrBoxCode);

// Update Action button based on tab
const oldActionButtonRegex = /\{\/\* Action Button \*\/\}\s*<button[\s\S]*?Scan QR to pay.*?<\/button>/;
const newActionButtonCode = `{/* Action Button */}
            {paymentTab === 'qr' && (
              <button 
                className="w-full py-4 text-white font-bold rounded-xl flex items-center justify-center transition-all hover:opacity-90 shadow-md"
                style={{ backgroundColor: brandColor && brandColor !== '#6C3FE2' ? brandColor : '#424553' }}
              >
                Scan QR to pay ?{data?.amount?.toFixed(0)} <ArrowUpRight className="w-4 h-4 ml-1.5" />
              </button>
            )}`;

data = data.replace(oldActionButtonRegex, newActionButtonCode);

fs.writeFileSync(file, data);
