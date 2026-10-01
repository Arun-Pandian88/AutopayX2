'use client';

import { Gift, Copy, Link as LinkIcon } from 'lucide-react';
import PageBanner, { bannerConfigs } from '@/components/PageBanner';

export default function ReferralsPage() {
  return (
    <div className="max-w-6xl mx-auto pb-12">
      <PageBanner pageKey="referrals" {...bannerConfigs.referrals} />
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#1C1D22] mb-2">Referral Rewards</h2>
        <p className="text-gray-500 font-medium">Invite merchants with your unique referral link and track registered, qualified and paid rewards.</p>
      </div>

      <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50/50 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
              <Gift className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-[#1C1D22] mb-2">Earn ₹1000 for every merchant.</h3>
            <p className="text-gray-500 text-sm font-medium mb-6">When they sign up and complete ₹50,000 in transaction volume, you both receive a bonus directly to your settlement account.</p>
            
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Your Unique Link</label>
            <div className="flex items-center">
              <div className="flex-1 bg-[#F4F5F9] border border-gray-200 rounded-l-xl px-4 py-3 flex items-center text-sm font-bold text-gray-700">
                <LinkIcon className="w-4 h-4 mr-2 text-gray-400" /> https://autoupi.in/ref/demo_biz
              </div>
              <button className="px-6 py-3 bg-[#6C3FE2] text-white text-sm font-bold rounded-r-xl hover:bg-[#5a34bd] transition-colors flex items-center" onClick={() => alert('Referral link copied!')}>
                <Copy className="w-4 h-4 mr-2" /> Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm text-center">
          <p className="text-sm font-bold text-gray-400 mb-1">Registered Users</p>
          <p className="text-4xl font-black text-[#1C1D22]">12</p>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm text-center">
          <p className="text-sm font-bold text-gray-400 mb-1">Qualified (Hit 50k)</p>
          <p className="text-4xl font-black text-[#1C1D22]">4</p>
        </div>
        <div className="bg-green-50 p-6 rounded-[24px] border border-green-100 text-center">
          <p className="text-sm font-bold text-green-700 mb-1">Rewards Paid Out</p>
          <p className="text-4xl font-black text-green-600">₹4,000</p>
        </div>
      </div>
    </div>
  );
}
