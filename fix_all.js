const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/dashboard/plans/page.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  "import { Check, Phone, Loader2 } from 'lucide-react';",
  "import { Check, Phone, Loader2, X, ShieldCheck, Timer } from 'lucide-react';\nimport { QRCodeSVG } from 'qrcode.react';"
);

const stateRegex = /const \[loading, setLoading\] = useState\(true\);/;
data = data.replace(stateRegex, `const [loading, setLoading] = useState(true);
  const [checkoutPlan, setCheckoutPlan] = useState<any>(null);
  const [txnId, setTxnId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [success, setSuccess] = useState(false);`);

const handleSubRegex = /const handleSubscribe = async \(planId: string\) => \{[\s\S]*?\} catch \(err\) \{[\s\S]*?alert\('An error occurred'\);\s*\}\s*\};/m;
data = data.replace(handleSubRegex, `const handleSubscribe = async (plan: any) => {
    try {
      const res = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/subscription/initiate\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan_id: plan.id }),
      });
      const json = await res.json();
      if (json.success) {
        setTxnId(json.data.txn_id);
        setCheckoutPlan(plan);
        setTimeLeft(300);
      } else {
        alert(json.message || 'Failed to initiate checkout');
      }
    } catch (err) {
      alert('Error initiating checkout');
    }
  };`);

const useEffectHooks = `
  useEffect(() => {
    if (!checkoutPlan || !txnId || success) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCheckoutPlan(null);
          alert('Payment session expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const poller = setInterval(async () => {
      try {
        const res = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/subscription/status/\${txnId}\`, {
          credentials: 'include'
        });
        const json = await res.json();
        if (json.success && json.status === 'success') {
          setSuccess(true);
          clearInterval(poller);
          setTimeout(() => window.location.reload(), 3000);
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(poller);
    };
  }, [checkoutPlan, txnId, success]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return \`\${m}:\${s.toString().padStart(2, '0')}\`;
  };
`;
data = data.replace('if (loading) {', useEffectHooks + '\n  if (loading) {');

data = data.replace(/onClick=\{\(\) => !isCurrent && handleSubscribe\(plan\.id\)\}/g, "onClick={() => !isCurrent && handleSubscribe(plan)}");

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
              <button onClick={() => setCheckoutPlan(null)} className="text-gray-400 hover:text-gray-900 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200">
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
              
              <div className="w-full py-4 bg-gray-50 text-gray-500 font-bold rounded-xl border border-gray-100 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Waiting for payment... <span className="ml-2 text-red-500 flex items-center"><Timer className="w-4 h-4 mr-1" /> {formatTime(timeLeft)}</span>
              </div>
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
