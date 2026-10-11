'use client';

import { useEffect, useState } from 'react';
import { Check, Phone, Loader2, X, ShieldCheck, Timer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useUser } from '@/context/UserContext';
import PageBanner, { bannerConfigs } from '@/components/PageBanner';

export default function PlansPage() {
  const { user } = useUser();
  const [plans, setPlans] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutPlan, setCheckoutPlan] = useState<any>(null);
  const [txnId, setTxnId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, subRes] = await Promise.all([
          fetch(`/api/dashboard/plans`, { credentials: 'include' }),
          fetch(`/api/subscription/my`, { credentials: 'include' })
        ]);

        if (plansRes.ok) {
          const plansData = await plansRes.json();
          setPlans(plansData.data);
        }
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubscription(subData.data);
        }
      } catch (err) {
        console.error('Error fetching plans/subscription:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubscribe = async (plan: any) => {
    try {
      const res = await fetch(`/api/subscription/initiate`, {
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
  };

  
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
        const res = await fetch(`/api/subscription/status/${txnId}`, {
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
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="flex justify-center mt-20"><Loader2 className="w-10 h-10 animate-spin text-[#6C3FE2]" /></div>;
  }

  const currentPlan = subscription?.plan;
  const currentSub = subscription?.subscription;

  // Find the free plan or default if no sub exists
  const activePlanName = currentPlan?.name || 'Free';
  const qrUsed = currentSub?.qr_codes_used || 0;
  const qrLimit = currentPlan?.limits?.qr_codes || 0;
  const qrRemaining = qrLimit > 0 ? qrLimit - qrUsed : 'Unlimited';
  const progressPercent = qrLimit > 0 ? Math.min((qrUsed / qrLimit) * 100, 100) : 100;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in">
      
      <PageBanner pageKey="plans" {...bannerConfigs.plans} />

      {/* Top Banner Area */}
      <div className="bg-white dark:bg-[#1C1D22] rounded-2xl border border-gray-100 dark:border-[#2d2e33] p-6 shadow-sm transition-colors relative">
        {/* Plan Name Pill */}
        <div className="absolute top-6 left-6">
          <span className="bg-[#f0eaff] text-[#6C3FE2] dark:bg-[#6C3FE2]/20 dark:text-[#a78bfa] text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
            {activePlanName}
          </span>
        </div>
        
        {/* QR Progress */}
        <div className="mt-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-[#1C1D22] dark:text-gray-300">QR codes used</span>
            <span className="text-sm font-black text-[#1C1D22] dark:text-white">{qrUsed} / {qrLimit === 0 ? 'Unlimited' : qrLimit}</span>
          </div>
          
          <div className="w-full h-2 bg-gray-100 dark:bg-[#2d2e33] rounded-full overflow-hidden">
            <div className="h-full bg-[#6C3FE2] transition-all" style={{ width: `${progressPercent}%` }}></div>
          </div>
          
          <div className="flex justify-between items-center mt-3">
            <div>
              <p className="text-xs font-medium text-gray-400">{qrRemaining} remaining</p>
              {qrLimit > 0 && qrUsed >= qrLimit && (
                <p className="text-xs font-medium text-red-500 mt-1">Limit reached. Upgrade to generate more.</p>
              )}
            </div>
            <span className="text-xs font-medium text-gray-400">
              {currentSub ? `Expires: ${new Date(currentSub.current_period_end).toLocaleDateString()}` : 'No expiry'}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {[...plans].sort((a: any, b: any) => {
          const getWeight = (name: string) => {
            const lower = name.toLowerCase();
            if (lower.includes('free')) return 0;
            if (lower.includes('pro')) return 1;
            return 2;
          };
          const weightA = getWeight(a.name);
          const weightB = getWeight(b.name);
          if (weightA !== weightB) return weightA - weightB;
          return parseFloat(a.price) - parseFloat(b.price);
        }).map((plan: any, i: number) => {
          const isCurrent = currentPlan?.id === plan.id || (!currentPlan && plan.name === 'Free');
          const isPopular = i === 1;
          
          return (
            <div key={plan.id} className={`bg-white dark:bg-[#1C1D22] rounded-2xl border ${isCurrent ? 'border-2 border-[#6C3FE2]/50 shadow-[0_0_15px_rgba(108,63,226,0.1)]' : 'border border-gray-100 dark:border-[#2d2e33]'} p-6 relative flex flex-col transition-colors overflow-hidden`}>
              {isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#A880FF] to-[#6C3FE2] text-white text-[10px] font-black rounded-b-lg uppercase tracking-widest shadow-md z-10">
                  Most Popular
                </div>
              )}
              {isCurrent && (
                <div className="absolute top-6 right-6 z-10">
                  <span className="bg-[#0A0A0B] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                    Current Plan
                  </span>
                </div>
              )}
              
              <h3 className="text-xl font-bold text-[#1C1D22] dark:text-white mb-4">{plan.name}</h3>
              
              <div className="mb-2">
                <span className="text-3xl font-black text-[#1C1D22] dark:text-white">
                  {plan.is_custom ? 'Talk to us' : `₹${plan.price}`}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium mb-8">
                {plan.is_custom ? 'for higher volume' : (plan.interval === 'monthly' ? 'per 30 days' : `per ${plan.interval}`)}
              </p>
              
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features?.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300">
                    <Check className="w-4 h-4 text-[#2c9d64] mr-3 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.is_custom ? (
                <button className="w-full bg-gray-50 dark:bg-[#2d2e33] hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-bold py-3 px-4 rounded-xl transition-colors border border-gray-200 dark:border-transparent flex items-center justify-center">
                  <Phone className="w-4 h-4 mr-2" />
                  +91 7603917369
                </button>
              ) : (
                <button 
                  onClick={() => !isCurrent && handleSubscribe(plan)}
                  disabled={isCurrent}
                  className={`w-full font-bold py-3 px-4 rounded-xl transition-colors shadow-sm ${
                    isCurrent 
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' 
                      : 'bg-[#6C3FE2] hover:bg-[#5b32c6] text-white'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : `Upgrade for ₹${plan.price}`}
                </button>
              )}
            </div>
          );
        })}
        

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
                  value={`upi://pay?pa=autopayx@upi&pn=AutoPayX&am=${checkoutPlan.price}&cu=INR&tn=Upgrade to ${checkoutPlan.name}`}
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
      )}
      </div>
    </div>
  );
}
