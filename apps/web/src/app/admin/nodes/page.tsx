'use client';

import { useState } from 'react';
import { Network, Server, Zap, AlertTriangle, ArrowRightLeft, Activity } from 'lucide-react';

export default function AdminNodesPage() {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const nodes = [
    { id: 'yes_bank_primary', name: 'YES Bank (Primary)', type: 'UPI Switching', status: 'online', latency: 42, successRate: 99.9, volume: '840 TPS' },
    { id: 'icici_backup', name: 'ICICI Bank (Failover)', type: 'UPI Switching', status: 'standby', latency: 68, successRate: 99.5, volume: '0 TPS' },
    { id: 'hdfc_routing', name: 'HDFC (Netbanking)', type: 'Direct Integration', status: 'online', latency: 120, successRate: 98.2, volume: '45 TPS' },
    { id: 'npci_direct', name: 'NPCI Direct Node', type: 'Core Infrastructure', status: 'online', latency: 15, successRate: 99.99, volume: '1250 TPS' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Banking Node Topology</h2>
          <p className="text-gray-400 text-sm max-w-2xl">Advanced visualization of direct integrations with banking partners and NPCI. Adjust routing weights dynamically to prevent cascade failures.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]">
          Run Load Balancer Diagnostic
        </button>
      </div>

      {/* Advanced Network Flow Visualization */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 max-w-4xl mx-auto py-12">
          
          {/* AutoPayX Core */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_0_40px_rgba(99,102,241,0.5)] flex items-center justify-center border border-white/20 z-10 relative">
              <Zap className="w-10 h-10 text-white" />
              {/* Pulsing rings */}
              <div className="absolute inset-0 rounded-2xl border-2 border-indigo-400 animate-ping opacity-20"></div>
            </div>
            <span className="mt-4 font-bold text-white">AutoPayX Core</span>
            <span className="text-xs text-indigo-400 font-mono">Routing Engine v2</span>
          </div>

          {/* Connection Lines (Simulated with CSS) */}
          <div className="hidden md:flex flex-1 relative h-32 items-center justify-center">
            <div className="w-full h-0.5 bg-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-shimmer"></div>
            </div>
            <div className="absolute px-4 py-1.5 bg-black border border-white/10 rounded-full text-[10px] font-mono text-gray-400 flex items-center shadow-lg">
              <ArrowRightLeft className="w-3 h-3 mr-2 text-indigo-400" />
              1,250 TPS
            </div>
          </div>

          {/* Banking Partners */}
          <div className="grid grid-cols-2 gap-4">
            {nodes.map((node) => (
              <div 
                key={node.id} 
                onClick={() => setActiveNode(node.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${activeNode === node.id ? 'bg-indigo-900/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-[#111] border-white/10 hover:border-white/30'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Server className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className={`w-2 h-2 rounded-full ${node.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-yellow-500'}`}></div>
                </div>
                <h4 className="text-sm font-bold text-white">{node.name}</h4>
                <p className="text-[10px] text-gray-500 font-mono mt-1">{node.latency}ms • {node.successRate}%</p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Selected Node Details */}
      {activeNode && (
        <div className="bg-[#111] border border-indigo-500/30 rounded-2xl p-6 shadow-xl animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          {nodes.filter(n => n.id === activeNode).map(node => (
            <div key="detail" className="relative z-10 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{node.name} Node Configuration</h3>
                <p className="text-sm text-gray-400 mb-6">Traffic is currently being routed based on adaptive AI weight distribution.</p>
                
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Load</div>
                    <div className="text-2xl font-mono text-white">{node.volume}</div>
                  </div>
                  <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">P99 Latency</div>
                    <div className="text-2xl font-mono text-white">{node.latency}ms</div>
                  </div>
                  <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Success Rate</div>
                    <div className="text-2xl font-mono text-green-400">{node.successRate}%</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-3">
                <button className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-bold rounded-lg transition-all">
                  Force Failover
                </button>
                <button className="px-6 py-2.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-sm font-bold rounded-lg transition-all">
                  Drain Traffic
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
