'use client';

import { useState } from 'react';
import { Database, Lock, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminDatabasePage() {
  const [isReconciling, setIsReconciling] = useState(false);
  const [logs, setLogs] = useState<{id: number, msg: string, type: 'info'|'success'|'error'}[]>([
    { id: 1, msg: "Reconciliation worker idle.", type: "info" }
  ]);

  const triggerReconciliation = () => {
    setIsReconciling(true);
    setLogs([{ id: Date.now(), msg: "Initiating atomic reconciliation sweep...", type: "info" }]);
    
    setTimeout(() => {
      setLogs(prev => [...prev, { id: Date.now(), msg: "Acquired FOR UPDATE lock on 12 pending transactions.", type: "info" }]);
    }, 800);

    setTimeout(() => {
      setLogs(prev => [...prev, { id: Date.now(), msg: "Verified UTRs against bank settlement files.", type: "success" }]);
    }, 1600);

    setTimeout(() => {
      setLogs(prev => [...prev, { id: Date.now(), msg: "Committed updates. Released row locks.", type: "success" }]);
      setIsReconciling(false);
    }, 2400);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Atomic Reconciliation Engine</h2>
          <p className="text-gray-400 text-sm max-w-2xl">Manage database row locks and manually trigger reconciliation sweeps to settle pending transactions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Worker Controls */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">DB Workers</h3>
              <p className="text-sm text-gray-400">PostgreSQL (Primary)</p>
            </div>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400 font-medium">Pending Txns (Unsettled)</span>
              <span className="text-2xl font-bold text-white">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-medium">Active Row Locks</span>
              <span className="text-2xl font-bold text-yellow-500">0</span>
            </div>
          </div>

          <button 
            onClick={triggerReconciliation}
            disabled={isReconciling}
            className="w-full py-4 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 disabled:hover:bg-fuchsia-600 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(192,38,211,0.3)] flex items-center justify-center"
          >
            {isReconciling ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Processing Sweep...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Trigger Atomic Sweep
              </>
            )}
          </button>
        </div>

        {/* Worker Logs */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col">
          <h3 className="text-xl font-bold text-white mb-6">Worker Log Stream</h3>
          
          <div className="flex-1 bg-black border border-white/5 rounded-2xl p-5 font-mono text-[11px] leading-relaxed text-gray-400 space-y-3 overflow-y-auto relative shadow-inner min-h-[300px]">
            {logs.map((log) => (
              <div key={log.id} className="flex space-x-3 items-start animate-fade-in">
                <span className="text-gray-600 shrink-0">[{new Date(log.id).toLocaleTimeString()}]</span>
                
                {log.type === 'info' && <span className="text-blue-400 font-bold shrink-0">INFO</span>}
                {log.type === 'success' && <span className="text-green-400 font-bold shrink-0">OK</span>}
                {log.type === 'error' && <span className="text-red-400 font-bold shrink-0">ERR</span>}
                
                <span className="text-gray-300">{log.msg}</span>
              </div>
            ))}
            {isReconciling && (
              <div className="flex items-center text-fuchsia-400 mt-4">
                <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-bounce mr-1"></span>
                <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-bounce mr-1" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
