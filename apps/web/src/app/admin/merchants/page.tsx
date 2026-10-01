'use client';

import { useState } from 'react';
import { Search, MoreVertical, Shield, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function AdminMerchants() {
  const [search, setSearch] = useState('');

  const merchants = [
    { id: 'm_892', name: 'Demo Merchant', email: 'demo@example.com', status: 'active', volume: '₹1.2M', risk: 'low' },
    { id: 'm_443', name: 'TechStore India', email: 'billing@techstore.in', status: 'active', volume: '₹4.5M', risk: 'low' },
    { id: 'm_901', name: 'Crypto Exchange', email: 'payments@crypto.io', status: 'suspended', volume: '₹12.8M', risk: 'high' },
    { id: 'm_112', name: 'Local Grocery', email: 'shop@local.com', status: 'active', volume: '₹45K', risk: 'low' },
  ];

  const filtered = merchants.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.id.includes(search));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Merchant Directory</h2>
          <p className="text-gray-400 text-sm">Manage onboarded merchants, adjust risk limits, and suspend accounts.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search merchants..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#111] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500 w-64 transition-colors"
          />
        </div>
      </div>

      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-gray-500 font-bold bg-[#111]/50">
              <th className="px-6 py-4">Merchant</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Risk Profile</th>
              <th className="px-6 py-4">30d Volume</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                <td className="px-6 py-4">
                  <div className="font-bold text-white">{m.name}</div>
                  <div className="text-xs text-gray-500 font-mono mt-0.5">{m.id} • {m.email}</div>
                </td>
                <td className="px-6 py-4">
                  {m.status === 'active' ? (
                    <span className="inline-flex items-center px-2 py-1 rounded bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">
                      <ShieldAlert className="w-3 h-3 mr-1" /> Suspended
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {m.risk === 'low' ? (
                    <span className="flex items-center text-sm text-gray-400"><Shield className="w-4 h-4 mr-2 text-green-500" /> Low Risk</span>
                  ) : (
                    <span className="flex items-center text-sm text-gray-400"><ShieldAlert className="w-4 h-4 mr-2 text-red-500" /> High Risk</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-300">
                  {m.volume}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white" onClick={(e) => { e.stopPropagation(); alert(`Manage ${m.id}`); }}>
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No merchants found matching "{search}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
