'use client';

import { useState } from 'react';
import { Search, Plus, Repeat, MoreVertical, CheckCircle2 } from 'lucide-react';

export default function AdminPlansPage() {
  const [search, setSearch] = useState('');

  const plans = [
    { id: 'pln_alpha', name: 'Starter Tier', provider: 'AutoPayX Default', amount: '₹0 (0%)', interval: 'free', status: 'active' },
    { id: 'pln_beta', name: 'Growth Tier', provider: 'AutoPayX Default', amount: '2% per txn', interval: 'usage-based', status: 'active' },
    { id: 'pln_gamma', name: 'Enterprise Custom', provider: 'Custom Config', amount: 'Flat ₹10/txn', interval: 'negotiated', status: 'active' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Platform Plans</h2>
          <p className="text-gray-400 text-sm">Manage the global pricing plans and fee structures assigned to merchants.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-all flex items-center shadow-[0_0_15px_rgba(79,70,229,0.3)]">
          <Plus className="w-4 h-4 mr-2" />
          New Pricing Tier
        </button>
      </div>

      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-[#111]/50">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search platform plans..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-gray-500 font-bold bg-[#111]/50">
              <th className="px-6 py-4">Plan Identity</th>
              <th className="px-6 py-4">Fee Structure</th>
              <th className="px-6 py-4">Interval/Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {plans.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                <td className="px-6 py-4">
                  <div className="font-bold text-white">{p.name}</div>
                  <div className="text-xs text-gray-500 font-mono mt-0.5">{p.id}</div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-indigo-400">
                  {p.amount}
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-mono text-gray-400 uppercase">{p.interval}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white" onClick={(e) => { e.stopPropagation(); alert(`Edit ${p.id}`); }}>
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
