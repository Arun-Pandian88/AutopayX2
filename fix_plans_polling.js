const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/dashboard/plans/page.tsx';
let data = fs.readFileSync(file, 'utf8');

// Add Timer to lucide imports if not there
if (!data.includes('Timer')) {
  data = data.replace("import { Check, Loader2, Phone, X, ShieldCheck } from 'lucide-react';", "import { Check, Loader2, Phone, X, ShieldCheck, Timer } from 'lucide-react';");
}

// Add state for txnId
const stateRegex = /const \[checkoutPlan, setCheckoutPlan\] = useState<any>\(null\);/;
data = data.replace(stateRegex, "const [checkoutPlan, setCheckoutPlan] = useState<any>(null);\n  const [txnId, setTxnId] = useState<string | null>(null);\n  const [timeLeft, setTimeLeft] = useState(300);");

// Update handleSubscribe to initiate
const handleSubRegex = /const handleSubscribe = async \(plan: any\) => \{\s*setCheckoutPlan\(plan\);\s*\};/m;
const newHandleSubscribe = `const handleSubscribe = async (plan: any) => {
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
  };`;
data = data.replace(handleSubRegex, newHandleSubscribe);

// Remove executeVerify since we will poll
const verifyRegex = /const executeVerify = async \(\) => \{[\s\S]*?\}, 4000\);\s*\};\s*/m;
data = data.replace(verifyRegex, "");

// Add useEffect for polling and timer
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

// Insert the useEffects before the return statement
data = data.replace('if (loading) {', useEffectHooks + '\n  if (loading) {');

// Update the modal HTML
const modalRegex = /<button[\s\S]*?executeVerify[\s\S]*?<\/button>/m;
const timerHtml = `<div className="w-full py-4 bg-gray-50 text-gray-500 font-bold rounded-xl border border-gray-100 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Waiting for payment... <span className="ml-2 text-red-500 flex items-center"><Timer className="w-4 h-4 mr-1" /> {formatTime(timeLeft)}</span>
              </div>`;
data = data.replace(modalRegex, timerHtml);

fs.writeFileSync(file, data);
