'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function PlanStatusWidget() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    planName: string;
    qrUsed: number;
    qrLimit: number;
    expiry: string;
  } | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/subscription/my`, {
          credentials: 'include'
        });
        if (res.ok) {
          const json = await res.json();
          setData({
            planName: json.data?.plan?.name || 'Free',
            qrUsed: json.data?.qr_used || 0,
            qrLimit: json.data?.plan?.limits?.qr_codes || 0,
            expiry: json.data?.current_period_end ? new Date(json.data.current_period_end).toLocaleDateString() : 'no expiry',
          });
        }
      } catch (e) {
        console.error('Failed to fetch plan status', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center border border-white/10 rounded-[20px] bg-[#0A0A0B] px-4 py-6 transition-all w-full">
        <Loader2 className="w-5 h-5 animate-spin text-[#A880FF]" />
      </div>
    );
  }

  const name = data?.planName || 'Free plan';
  const used = data?.qrUsed || 0;
  const limit = data?.qrLimit || 0;
  const expiry = data?.expiry || 'no expiry';

  const isUnlimited = limit === 0 || limit === 9999;
  const remainingText = isUnlimited ? `${used} QR generated` : `${limit - used} of ${limit} QR left`;

  return (
    <Link href="/dashboard/plans" className="flex flex-col border border-white/10 rounded-[20px] bg-[#0A0A0B] px-4 py-3.5 transition-all hover:bg-black group/widget shadow-2xl w-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/widget:opacity-100 transition-opacity"></div>
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center text-sm font-black text-white tracking-wide">
          <Sparkles className="w-4 h-4 mr-2 text-[#A880FF] group-hover/widget:text-[#6C3FE2] transition-colors" />
          {name}
        </div>
        <div className="bg-[#E2F7E4] text-[#1E5632] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ml-3 shadow-sm">
          CURRENT
        </div>
      </div>
      <div className="text-[11px] font-bold text-gray-400 pl-6 relative z-10">
        {remainingText} &middot; {expiry}
      </div>
    </Link>
  );
}
