import Link from 'next/link';
import { Shield, Users, Building2, Server, Database, LogOut, Zap, Activity, Repeat } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Super Admin Sidebar (Dark Theme to differentiate from Merchant) */}
      <aside className="w-64 bg-[#0A0A0A] border-r border-white/5 flex flex-col fixed h-full z-10">
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.4)]">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">AutoPayX <span className="text-red-500 font-mono text-xs uppercase tracking-widest ml-1 border border-red-500/30 px-1.5 py-0.5 rounded">Admin</span></span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">Platform Controls</div>
          
          <Link href="/admin" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-red-500/10 text-red-400 font-medium border border-red-500/20">
            <Activity className="w-5 h-5" />
            <span>System Health</span>
          </Link>
          
          <Link href="/admin/merchants" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white font-medium transition-colors">
            <Building2 className="w-5 h-5" />
            <span>Merchants</span>
          </Link>
          
          <Link href="/admin/users" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white font-medium transition-colors">
            <Users className="w-5 h-5" />
            <span>Users & Roles</span>
          </Link>

          <Link href="/admin/nodes" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white font-medium transition-colors">
            <Server className="w-5 h-5" />
            <span>UPI Nodes</span>
          </Link>

          <Link href="/admin/plans" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white font-medium transition-colors">
            <Repeat className="w-5 h-5" />
            <span>Platform Plans</span>
          </Link>
          
          <Link href="/admin/database" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white font-medium transition-colors">
            <Database className="w-5 h-5" />
            <span>Reconciliation</span>
          </Link>
        </div>
        
        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-red-900/50 flex items-center justify-center text-red-200 font-bold border border-red-500/30">
              SA
            </div>
            <div>
              <p className="text-sm font-bold text-white">Super Admin</p>
              <p className="text-xs text-gray-500">God Mode</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white font-medium transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform Overview</h1>
          <div className="flex space-x-4">
            <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-sm font-medium text-gray-400 shadow-sm flex items-center">
              <Zap className="w-4 h-4 text-green-400 mr-2" />
              All Systems Operational
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
