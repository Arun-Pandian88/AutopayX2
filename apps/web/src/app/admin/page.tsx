import { Activity, Server, Users, Database, AlertCircle, CheckCircle2, ChevronRight, HardDrive } from 'lucide-react';

export default function AdminOverview() {
  return (
    <div className="space-y-8 pb-12">
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all duration-500"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-sm font-bold tracking-wider text-gray-400 uppercase">API Traffic</span>
            <div className="p-2 bg-white/5 rounded-lg border border-white/10"><Server className="w-5 h-5 text-gray-300" /></div>
          </div>
          <div className="text-4xl font-black text-white mb-2 relative z-10">4,245 <span className="text-lg text-gray-500 font-medium tracking-normal">req/s</span></div>
          <div className="flex items-center text-sm font-medium text-green-400 relative z-10">
            <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] mr-2"></span>
            Stable (p99: 45ms)
          </div>
        </div>

        <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-sm font-bold tracking-wider text-gray-400 uppercase">Reconciliation Queue</span>
            <div className="p-2 bg-white/5 rounded-lg border border-white/10"><Database className="w-5 h-5 text-gray-300" /></div>
          </div>
          <div className="text-4xl font-black text-white mb-2 relative z-10">12 <span className="text-lg text-gray-500 font-medium tracking-normal">txns</span></div>
          <div className="flex items-center text-sm font-medium text-blue-400 relative z-10">
            <Activity className="w-4 h-4 mr-1.5" />
            Workers processing...
          </div>
        </div>

        <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-all duration-500"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-sm font-bold tracking-wider text-gray-400 uppercase">Webhook Outbox</span>
            <div className="p-2 bg-white/5 rounded-lg border border-white/10"><Activity className="w-5 h-5 text-gray-300" /></div>
          </div>
          <div className="text-4xl font-black text-white mb-2 relative z-10">34 <span className="text-lg text-gray-500 font-medium tracking-normal">pending</span></div>
          <div className="flex items-center text-sm font-medium text-yellow-400 relative z-10">
            0 dead-lettered
          </div>
        </div>

        <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-sm font-bold tracking-wider text-gray-400 uppercase">Active Merchants</span>
            <div className="p-2 bg-white/5 rounded-lg border border-white/10"><Users className="w-5 h-5 text-gray-300" /></div>
          </div>
          <div className="text-4xl font-black text-white mb-2 relative z-10">89 <span className="text-lg text-gray-500 font-medium tracking-normal">nodes</span></div>
          <div className="flex items-center text-sm font-medium text-purple-400 relative z-10">
            +3 onboarding today
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Advanced Node Visualizer */}
        <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)] pointer-events-none"></div>
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Global Node Health</h2>
              <p className="text-sm text-gray-500 font-medium">Real-time infrastructure load balancing across availability zones.</p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></span>
              <span>WS Connected</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            {['ap-south-1a', 'ap-south-1b', 'ap-south-1c', 'eu-west-1a'].map((region, idx) => (
              <div key={region} className="bg-black border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <HardDrive className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-xs font-bold text-gray-300 uppercase">{region}</span>
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full ${idx === 3 ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]'}`}></div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-mono">
                      <span>CPU</span>
                      <span>{idx === 3 ? '78%' : `${40 + (idx * 5)}%`}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${idx === 3 ? 'bg-yellow-500' : 'bg-indigo-500'}`} style={{ width: idx === 3 ? '78%' : `${40 + (idx * 5)}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-mono">
                      <span>RAM</span>
                      <span>{idx === 3 ? '62%' : `${50 - (idx * 3)}%`}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-fuchsia-500 rounded-full" style={{ width: idx === 3 ? '62%' : `${50 - (idx * 3)}%` }}></div>
                    </div>
                  </div>
                </div>
                {/* Decorative mesh */}
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all"></div>
              </div>
            ))}
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl p-8 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Live Logs</h2>
            <button className="text-xs font-semibold text-gray-400 hover:text-white transition-colors">View All</button>
          </div>
          
          <div className="flex-1 bg-[#050505] border border-white/5 rounded-2xl p-5 font-mono text-[11px] leading-relaxed text-gray-400 space-y-3 overflow-y-auto relative shadow-inner">
            <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-[#050505] to-transparent z-10 pointer-events-none"></div>
            
            <div className="flex space-x-3 items-start group">
              <span className="text-gray-600 shrink-0">[10:24:15]</span>
              <span className="text-indigo-400 font-bold shrink-0">SYS</span>
              <span className="group-hover:text-gray-300 transition-colors">Worker node auto-scaled up to handle reconciliation spike.</span>
            </div>
            <div className="flex space-x-3 items-start group">
              <span className="text-gray-600 shrink-0">[10:24:12]</span>
              <span className="text-green-400 font-bold shrink-0">DB</span>
              <span className="group-hover:text-gray-300 transition-colors">Successfully acquired lock and reconciled 145 orders via bank_hdfc.</span>
            </div>
            <div className="flex space-x-3 items-start group">
              <span className="text-gray-600 shrink-0">[10:24:08]</span>
              <span className="text-yellow-400 font-bold shrink-0">WARN</span>
              <span className="group-hover:text-gray-300 transition-colors text-yellow-500/80">Webhook delivery timeout for merchant_892. Applying exponential backoff.</span>
            </div>
            <div className="flex space-x-3 items-start group">
              <span className="text-gray-600 shrink-0">[10:23:55]</span>
              <span className="text-green-400 font-bold shrink-0">DB</span>
              <span className="group-hover:text-gray-300 transition-colors">Database checkpoint WAL synced (took 0.045s).</span>
            </div>
            <div className="flex space-x-3 items-start group">
              <span className="text-gray-600 shrink-0">[10:23:40]</span>
              <span className="text-indigo-400 font-bold shrink-0">SEC</span>
              <span className="group-hover:text-gray-300 transition-colors">Admin login successful from IP 192.168.1.45</span>
            </div>
            <div className="flex space-x-3 items-start group opacity-50">
              <span className="text-gray-600 shrink-0">[10:23:10]</span>
              <span className="text-blue-400 font-bold shrink-0">API</span>
              <span className="group-hover:text-gray-300 transition-colors">Incoming intent request: amt=500.00 currency=INR</span>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#050505] to-transparent z-10 pointer-events-none"></div>
          </div>
        </div>

      </div>

      {/* Critical System Alerts */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <h3 className="font-bold text-white">Critical System Alerts</h3>
          </div>
          <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full border border-red-500/30">
            1 Active Issue
          </span>
        </div>
        
        <div className="divide-y divide-white/5">
          <div className="p-8 flex items-start justify-between hover:bg-white/[0.02] transition-colors cursor-pointer group">
            <div className="flex items-start space-x-5">
              <div className="mt-1 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse"></div>
              <div>
                <h4 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors">High Latency in UPI Node (eu-west-1a)</h4>
                <p className="text-gray-400 text-sm max-w-2xl leading-relaxed mb-4">
                  The backup UPI switching node in the EU region is experiencing elevated latency (avg 850ms). Traffic is automatically being routed to ap-south-1 until health checks pass. No merchant impact.
                </p>
                <div className="flex space-x-4">
                  <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">ID: ALRT-8943</span>
                  <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">Duration: 14m</span>
                </div>
              </div>
            </div>
            <button className="flex items-center text-sm font-bold text-white bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-xl transition-all border border-white/10 group-hover:border-white/20">
              Acknowledge
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
          
          <div className="p-8 flex items-start justify-between opacity-50 bg-black/50">
            <div className="flex items-start space-x-5">
              <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-gray-500" /></div>
              <div>
                <h4 className="text-lg font-bold text-gray-400 line-through decoration-gray-600">Database Connection Pool Exhaustion</h4>
                <p className="text-gray-500 text-sm mt-1">Resolved at 09:14 AM. Pool size increased from 100 to 500.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
