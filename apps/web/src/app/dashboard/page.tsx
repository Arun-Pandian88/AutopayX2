'use client';

import { useState, useEffect } from 'react';
import PageBanner, { bannerConfigs } from '@/components/PageBanner';
import { 
  IndianRupee, 
  ShoppingBag, 
  ShieldCheck, 
  Activity, 
  TrendingUp,
  TrendingDown,
  CreditCard
} from 'lucide-react';

export default function DashboardOverview() {
  const [dateFilter, setDateFilter] = useState('Today');
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState<any>({
    totalRevenue: 0,
    totalOrders: 0,
    successRate: 0,
    pending: 0,
    failed: 0,
    chartData: [],
    paymentMethods: { UPI: 0, Cards: 0, Netbanking: 0 },
    recentTransactions: []
  });

  const maxRevenue = stats.chartData?.length ? Math.max(...stats.chartData.map((d: any) => d.revenue), 1) : 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, statsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/dashboard/me`, { credentials: 'include' }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/dashboard/stats?filter=${encodeURIComponent(dateFilter)}`, { credentials: 'include' })
        ]);
        if (userRes.ok) {
          const u = await userRes.json();
          setUserName(u.data?.name || '');
        }
        if (statsRes.ok) {
          const s = await statsRes.json();
          setStats(s.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [dateFilter]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      
      <PageBanner pageKey="dashboard" {...bannerConfigs.dashboard} />

      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1C1D22] dark:text-white mb-1">
            Welcome Back{userName ? `, ${userName}` : ''}!
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            Here's what's happening with your payments.
          </p>
        </div>
        
        {/* Time Filters */}
        <div className="flex bg-white dark:bg-[#1C1D22] rounded-lg border border-gray-200 dark:border-[#2d2e33] p-1 shadow-sm transition-colors">
          {['Today', 'Last 7 Days', 'Last 30 Days'].map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${
                dateFilter === filter
                  ? 'bg-[#0A0A0B] dark:bg-[#6C3FE2] text-white shadow-sm'
                  : 'text-[#4876e7] dark:text-gray-400 dark:hover:text-white hover:text-[#375cbd] bg-transparent'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white dark:bg-[#1C1D22] p-5 rounded-2xl border border-gray-100 dark:border-[#2d2e33] shadow-sm flex flex-col justify-between h-[160px] transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-[#eefae6] text-[#6bb935] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#1C1D22] dark:text-white mb-3">₹{stats.totalRevenue.toLocaleString()}</div>
            <div className="inline-flex items-center px-2 py-1 bg-[#eefae6] text-[#4d971e] text-[10px] font-bold rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> {stats.totalOrders} successful payments
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-[#1C1D22] p-5 rounded-2xl border border-gray-100 dark:border-[#2d2e33] shadow-sm flex flex-col justify-between h-[160px] transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-[#eef2fc] text-[#4876e7] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#1C1D22] dark:text-white mb-3">{stats.totalOrders}</div>
            <div className="inline-flex items-center px-2 py-1 bg-[#eefae6] text-[#4d971e] text-[10px] font-bold rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> {stats.pending} still awaiting payment
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white dark:bg-[#1C1D22] p-5 rounded-2xl border border-gray-100 dark:border-[#2d2e33] shadow-sm flex flex-col justify-between h-[160px] transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500">Success Rate</span>
            <div className="w-8 h-8 rounded-lg bg-[#eaf7f0] text-[#2c9d64] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#1C1D22] dark:text-white mb-3">{stats.successRate}%</div>
            <div className="inline-flex items-center px-2 py-1 bg-[#eaf7f0] text-[#2c9d64] text-[10px] font-bold rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> Excellent
            </div>
          </div>
        </div>

        {/* Pending / Failed */}
        <div className="bg-white dark:bg-[#1C1D22] p-5 rounded-2xl border border-gray-100 dark:border-[#2d2e33] shadow-sm flex flex-col justify-between h-[160px] transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500">Pending / Failed</span>
            <div className="w-8 h-8 rounded-lg bg-[#fff4e6] text-[#f29d38] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#1C1D22] dark:text-white mb-3">{stats.pending} / {stats.failed}</div>
            <div className="inline-flex items-center px-2 py-1 bg-[#fff1f2] text-[#e11d48] text-[10px] font-bold rounded-full">
              <TrendingDown className="w-3 h-3 mr-1" /> Requires action
            </div>
          </div>
        </div>

      </div>

      {/* Middle Row: Analytics & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Transaction & Revenue Analytics Chart (Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1C1D22] rounded-2xl border border-gray-100 dark:border-[#2d2e33] shadow-sm p-6 min-h-[380px] flex flex-col transition-colors">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-[#1C1D22] dark:text-white">Transaction & Revenue Analytics</h3>
            <span className="text-xs font-medium text-gray-400">Today</span>
          </div>
          
          {/* Mock Chart Area */}
          <div className="flex-1 relative flex mt-4">
            {/* Y-Axis */}
            <div className="flex flex-col justify-between text-xs font-medium text-gray-400 pr-4 w-12 items-end">
              <span>₹{maxRevenue}</span>
              <span>₹{Math.round(maxRevenue * 0.75)}</span>
              <span>₹{Math.round(maxRevenue * 0.5)}</span>
              <span>₹{Math.round(maxRevenue * 0.25)}</span>
              <span>0</span>
            </div>
            
            {/* Chart Grid & Data */}
            <div className="flex-1 relative flex flex-col justify-between h-[200px]">
              {/* Grid Lines */}
              <div className="w-full border-t border-dashed border-gray-200 dark:border-gray-700 mt-2"></div>
              <div className="w-full border-t border-dashed border-gray-200 dark:border-gray-700"></div>
              <div className="w-full border-t border-dashed border-gray-200 dark:border-gray-700"></div>
              <div className="w-full border-t border-dashed border-gray-200 dark:border-gray-700"></div>
              <div className="w-full border-t border-dashed border-gray-200 dark:border-gray-700 mb-2"></div>
              
              {/* Bar Chart Data */}
              <div className="absolute inset-0 pt-2 pb-2 flex items-end justify-around">
                {stats.chartData?.map((data: any, idx: number) => {
                  const heightPercent = Math.max((data.revenue / maxRevenue) * 100, 2); // min height 2%
                  return (
                    <div key={idx} className="flex flex-col items-center w-8 group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap z-10 pointer-events-none">
                        ₹{data.revenue} ({data.orders} orders)
                      </div>
                      
                      {/* Bar */}
                      <div 
                        className="w-full bg-[#8cc63f] rounded-t-sm hover:bg-[#7abd36] transition-colors"
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                      
                      {/* X-Axis Label */}
                      <span className="absolute -bottom-6 text-[10px] font-bold text-gray-500 whitespace-nowrap">
                        {data.date.split('-').slice(1).join('/')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white dark:bg-[#1C1D22] rounded-2xl border border-gray-100 dark:border-[#2d2e33] shadow-sm p-6 min-h-[380px] flex flex-col transition-colors">
          <h3 className="font-bold text-[#1C1D22] dark:text-white mb-8">Payment Methods</h3>
          
          {stats.totalOrders === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center mb-8">
              <CreditCard className="w-8 h-8 text-[#2c9d64] mb-3" />
              <p className="font-bold text-[#1C1D22] dark:text-white text-sm mb-1">No payments yet</p>
              <p className="text-xs text-gray-400 font-medium text-center">Method split will appear after your first transaction.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center">
              <div className="space-y-4 w-full">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-[#8cc63f] mr-2"></div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">UPI</span>
                  </div>
                  <span className="font-bold text-[#1C1D22] dark:text-white">{stats.paymentMethods?.UPI || 0}%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-[#1e7eb6] mr-2"></div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Cards</span>
                  </div>
                  <span className="font-bold text-[#1C1D22] dark:text-white">{stats.paymentMethods?.Cards || 0}%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-[#f29d38] mr-2"></div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Netbanking</span>
                  </div>
                  <span className="font-bold text-[#1C1D22] dark:text-white">{stats.paymentMethods?.Netbanking || 0}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent Transactions */}
      <div className="bg-white dark:bg-[#1C1D22] rounded-2xl border border-gray-100 dark:border-[#2d2e33] shadow-sm p-6 min-h-[300px] transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-[#1C1D22] dark:text-white dark:text-white">Recent Transactions</h3>
          <span className="text-xs font-medium text-gray-400">Latest activity on your account</span>
        </div>
        
        {stats.recentTransactions?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-black/20">
            <Activity className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm font-bold text-gray-400">No recent transactions</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 dark:border-[#2d2e33] rounded-xl">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-[#2d2e33] text-gray-500 dark:text-gray-400 font-semibold">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#2d2e33]">
                {stats.recentTransactions?.map((txn: any) => (
                  <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{txn.txn_id}</td>
                    <td className="px-6 py-4 font-bold">{txn.customer_name || 'Anonymous'}</td>
                    <td className="px-6 py-4 font-bold">₹{txn.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                        txn.status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                        txn.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                        'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
