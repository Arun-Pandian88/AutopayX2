'use client';

import { useEffect, useState } from 'react';
import { Check, Phone, Loader2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import PageBanner, { bannerConfigs } from '@/components/PageBanner';

export default function PlansPage() {
  const { user } = useUser();
  const [plans, setPlans] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, subRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/dashboard/plans`, { credentials: 'include' }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/subscription/my`, { credentials: 'include' })
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

  const handleSubscribe = async (planId: string) => {
    if (!confirm('Are you sure you want to subscribe to this plan?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/subscription/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan_id: planId }),
      });

      if (res.ok) {
        alert('Subscribed successfully!');
        window.location.reload(); // Quick refresh
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to subscribe');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
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
                  onClick={() => !isCurrent && handleSubscribe(plan.id)}
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
        
      </div>
    </div>
  );
}
