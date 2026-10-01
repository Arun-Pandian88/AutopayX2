'use client';

import { Activity, Loader2, AlertCircle, Search } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import PageBanner, { bannerConfigs } from '@/components/PageBanner';
import { useEffect, useState } from 'react';

export default function SystemLogs() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!userLoading && (!user || user.role !== 'superadmin')) {
      router.replace('/dashboard');
    }
  }, [user, userLoading, router]);

  // Fetch real logs from API
  const fetchLogs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/superadmin/logs`, {
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        setLogs(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'superadmin') {
      fetchLogs();
    }
  }, [user]);

  // Polling for live logs
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      fetchLogs();
    }, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [isLive, user]);

  const filteredLogs = logs.filter(log => {
    if (filter !== 'All' && log.type.toLowerCase() !== filter.toLowerCase()) return false;
    if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (userLoading) {
    return <div className="flex justify-center mt-20"><Loader2 className="w-10 h-10 animate-spin text-[#6C3FE2]" /></div>;
  }

  return (
    <div className="mt-8 max-w-6xl mx-auto space-y-6 animate-fade-in relative">
      <PageBanner pageKey="superadmin_logs" {...bannerConfigs.superadmin_logs} />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">System Logs</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Real-time application health and network activity.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center px-4 py-2.5 rounded-xl font-bold transition-all ${isLive ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20' : 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20'}`}
          >
            {isLive ? (
              <><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></span> Pause Live Logs</>
            ) : (
              <><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Resume Live Logs</>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[700px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111111] flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex space-x-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {['All', 'Info', 'Success', 'Warning', 'Error'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${filter === f ? 'bg-[#6C3FE2] text-white shadow-md' : 'bg-white dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-white/5'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6C3FE2]/50 text-gray-900 dark:text-white"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Terminal Window */}
        <div className="flex-1 bg-[#0D0D0E] p-6 overflow-y-auto font-mono text-sm shadow-inner relative custom-scrollbar">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <Activity className="w-12 h-12 mb-4 opacity-20" />
              <p>No logs found matching criteria.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start group hover:bg-white/5 p-2 rounded-lg transition-colors border border-transparent hover:border-white/5">
                  <span className="text-gray-500 w-32 shrink-0">{new Date(log.createdAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + new Date(log.createdAt).getMilliseconds().toString().padStart(3, '0')}</span>
                  <span className={`w-24 shrink-0 font-bold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded-md text-center mr-4 ${
                    log.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                    log.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                    log.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                    'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                  }`}>
                    {log.type}
                  </span>
                  <span className={`flex-1 ${
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'warning' ? 'text-yellow-400' :
                    'text-gray-300'
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Status Footer */}
        <div className="bg-[#111111] border-t border-gray-800 p-3 flex justify-between items-center text-xs font-bold text-gray-500">
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            System Operational
          </div>
          <div>
            Showing {filteredLogs.length} logs
          </div>
        </div>
      </div>
    </div>
  );
}
