'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Copy, ShieldCheck, Beaker, AlertTriangle, X, CheckCircle2, Trash2, Plus } from 'lucide-react';
import PageBanner, { bannerConfigs } from '@/components/PageBanner';

export default function ApiKeysPage() {
  const [isTestMode, setIsTestMode] = useState(false);
  
  useEffect(() => {
    // Check initial mode
    const mode = localStorage.getItem('autopayx_mode');
    setIsTestMode(mode !== 'live'); // default to test if not live, or whatever the logic is. Wait, let's sync strictly.
    
    // Listener for custom modeChange event
    const handleModeChange = () => {
      const currentMode = localStorage.getItem('autopayx_mode');
      setIsTestMode(currentMode !== 'live');
    };
    
    window.addEventListener('modeChange', handleModeChange);
    return () => window.removeEventListener('modeChange', handleModeChange);
  }, []);

  const [toastMessage, setToastMessage] = useState('');
  
  // Modals state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalAction, setModalAction] = useState<{type: 'delete' | 'regenerate', id: string} | null>(null);

  // State for multiple keys
  const [liveKeys, setLiveKeys] = useState<any[]>([]);
  const [testKeys, setTestKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKeys = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/apikeys`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setLiveKeys(data.data.liveKeys || []);
          setTestKeys(data.data.testKeys || []);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleGenerateNew = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/apikeys/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mode: isTestMode ? 'test' : 'live' })
      });
      if (res.ok) {
        fetchKeys();
        showToast('New key generated successfully!');
      } else {
        showToast('Failed to generate key');
      }
    } catch (error) {
      console.error(error);
      showToast('Error generating key');
    }
  };

  const executeModalAction = async () => {
    if (!modalAction) return;

    if (modalAction.type === 'delete') {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/apikeys/${modalAction.id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (res.ok) {
          showToast('Key deleted permanently.');
          fetchKeys();
        }
      } catch (err) {
        console.error(err);
      }
    } else if (modalAction.type === 'regenerate') {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/apikeys/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ mode: isTestMode ? 'test' : 'live' })
        });
        if (res.ok) {
          showToast('Key regenerated successfully!');
          fetchKeys();
        }
      } catch (err) {
        console.error(err);
      }
    }

    setShowConfirmModal(false);
    setModalAction(null);
  };

  const openModal = (type: 'delete' | 'regenerate', id: string) => {
    setModalAction({ type, id });
    setShowConfirmModal(true);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy', err);
      showToast('Failed to copy');
    });
  };

  const currentData = isTestMode ? testKeys : liveKeys;

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans relative">
      <PageBanner pageKey="apikeys" {...bannerConfigs.apikeys} />
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center bg-[#1C1D22] text-white px-5 py-3.5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
          <CheckCircle2 className="w-5 h-5 text-green-400 mr-3" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Action Modal */}
      {showConfirmModal && modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.1)] relative z-10 overflow-hidden animate-scale-in">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${modalAction.type === 'delete' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <button onClick={() => setShowConfirmModal(false)} className="p-2 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-xl transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-xl font-bold text-[#1C1D22] mb-2">
                {modalAction.type === 'delete' ? 'Delete this Key?' : 'Regenerate this Key?'}
              </h3>
              <p className="text-sm font-medium text-gray-500 leading-relaxed mb-8">
                {modalAction.type === 'delete' 
                  ? 'Any integrations using this key will immediately break. This action cannot be undone.'
                  : 'The old key will stop working immediately. Are you sure you want to replace it?'}
              </p>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3.5 bg-[#F4F5F9] hover:bg-[#E5E7EB] text-[#1C1D22] text-sm font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeModalAction}
                  className={`flex-1 py-3.5 text-white text-sm font-bold rounded-xl transition-colors shadow-sm ${modalAction.type === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                  {modalAction.type === 'delete' ? 'Yes, Delete' : 'Yes, Regenerate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1C1D22] mb-2">API Keys</h2>
          <p className="text-gray-500 text-sm">Keys let your website or app create payments through AutoPayX.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleGenerateNew}
            className={`px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center ${isTestMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#6C3FE2] hover:bg-[#5a34bd]'}`}
          >
            <Plus className="w-4 h-4 mr-2" /> Generate new {isTestMode ? 'test' : 'live'} key
          </button>
        </div>
      </div>

      {isTestMode && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl mb-6 flex items-start text-sm font-medium">
          <Beaker className="w-5 h-5 text-orange-500 mr-3 shrink-0" />
          You are currently in Test Mode. These keys will not process real money.
        </div>
      )}

      {/* Keys Table Card */}
      <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-gray-100 flex justify-between items-center bg-[#fcfdfd]">
          <h3 className="font-bold text-[#1C1D22] text-lg">Active Keys</h3>
          <span className="px-3 py-1 bg-[#F4F5F9] text-gray-500 text-xs font-bold rounded-full">{currentData.length} Keys</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-gray-400 font-bold border-b border-gray-100 bg-[#fcfdfd]">
                <th className="px-8 py-4">API Key</th>
                <th className="px-8 py-4">Webhook Secret</th>
                <th className="px-8 py-4">Created</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-gray-400 text-sm font-medium">
                    No keys found. Generate one to get started.
                  </td>
                </tr>
              ) : (
                currentData.map((item) => (
                  <tr key={item.id} className="text-sm border-b border-gray-50 hover:bg-[#F4F5F9]/50 transition-colors group">
                    <td className="px-6 sm:px-8 py-5">
                      <div className="flex items-center">
                        <span className="font-mono font-medium text-[#1C1D22] mr-3 truncate inline-block w-[150px] sm:w-[200px] lg:w-[280px]" title={item.key}>{item.key}</span>
                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100 shrink-0" onClick={() => handleCopy(item.key)}>
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 sm:px-8 py-5">
                      <div className="flex items-center">
                        <span className="font-mono text-gray-500 mr-3 truncate inline-block w-[150px] sm:w-[200px] lg:w-[280px]" title={item.secret}>{item.secret}</span>
                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100 shrink-0" onClick={() => handleCopy(item.secret)}>
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-gray-500 font-medium">
                      {item.created}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => openModal('regenerate', item.id)}
                          className="px-3 py-1.5 bg-white border border-gray-200 hover:border-orange-200 hover:bg-orange-50 text-gray-600 hover:text-orange-600 text-xs font-bold rounded-lg transition-colors flex items-center shadow-sm"
                        >
                          <RefreshCw className="w-3 h-3 mr-1.5" /> Regenerate
                        </button>
                        <button 
                          onClick={() => openModal('delete', item.id)}
                          className="px-3 py-1.5 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-600 hover:text-red-600 text-xs font-bold rounded-lg transition-colors flex items-center shadow-sm"
                        >
                          <Trash2 className="w-3 h-3 mr-1.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-[#fcfdfd] px-8 py-4 border-t border-gray-100 flex items-center text-xs font-medium text-gray-500">
          <ShieldCheck className="w-4 h-4 text-indigo-400 mr-2" />
          Keys grant full access to your API. Keep them secure and never expose them in client-side code.
        </div>
      </div>
    </div>
  );
}
