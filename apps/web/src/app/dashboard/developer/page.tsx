'use client';

import { Terminal, Copy, CheckCircle2, MonitorSmartphone } from 'lucide-react';
import { useState } from 'react';
import PageBanner, { bannerConfigs } from '@/components/PageBanner';

export default function DeveloperPage() {
  const [copied, setCopied] = useState('');
  const [activeTab, setActiveTab] = useState<'mac' | 'windows' | 'linux'>('windows');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  };

  const getInstallCmd = () => {
    switch(activeTab) {
      case 'mac': return "brew tap autopayx/tap && brew install autopayx";
      case 'linux': return "curl -fsSL https://autopayx.in/install.sh | bash";
      case 'windows': return "npm install -g autopayx-cli";
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <PageBanner pageKey="developer" {...bannerConfigs.developer} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#1C1D22] dark:text-white mb-1">
          Developer Tools
        </h1>
        <p className="text-gray-500 font-medium text-sm">
          Secure, professional SDKs and CLIs for AutoPayX integration.
        </p>
      </div>

      <div className="bg-white dark:bg-[#1C1D22] rounded-2xl border border-gray-100 dark:border-[#2d2e33] shadow-sm p-8 transition-colors">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mr-4">
            <Terminal className="w-6 h-6 text-[#6C3FE2] dark:text-[#8b61ff]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1C1D22] dark:text-white">AutoPayX CLI</h2>
            <p className="text-gray-500 font-medium text-sm">Manage your UPI payments directly from your terminal.</p>
          </div>
        </div>

        <div className="space-y-8">
          
          {/* Step 1: Install */}
          <div className="flex space-x-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1C1D22] dark:bg-white text-white dark:text-[#1C1D22] flex items-center justify-center font-bold">1</div>
            <div className="flex-1">
              <h3 className="font-bold text-[#1C1D22] dark:text-white mb-2">Install the CLI</h3>
              <p className="text-gray-500 text-sm font-medium mb-4">
                Choose your operating system.
              </p>
              
              {/* OS Tabs */}
              <div className="flex space-x-2 mb-4">
                <button 
                  onClick={() => setActiveTab('windows')}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'windows' ? 'bg-[#6C3FE2] text-white' : 'bg-gray-100 dark:bg-[#2d2e33] text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Windows
                </button>
                <button 
                  onClick={() => setActiveTab('mac')}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'mac' ? 'bg-[#6C3FE2] text-white' : 'bg-gray-100 dark:bg-[#2d2e33] text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  macOS
                </button>
                <button 
                  onClick={() => setActiveTab('linux')}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'linux' ? 'bg-[#6C3FE2] text-white' : 'bg-gray-100 dark:bg-[#2d2e33] text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Linux
                </button>
              </div>

              <div className="bg-[#0A0A0B] rounded-xl overflow-hidden flex items-center justify-between shadow-lg max-w-2xl border border-gray-800">
                <code className="text-[#a9dc76] text-sm font-mono px-4 py-3">{getInstallCmd()}</code>
                <button 
                  onClick={() => handleCopy(getInstallCmd())}
                  className="px-4 py-3 text-gray-400 hover:text-white transition-colors bg-[#1C1D22] border-l border-gray-800"
                >
                  {copied === getInstallCmd() ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Step 2: Authenticate */}
          <div className="flex space-x-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2d2e33] text-gray-400 flex items-center justify-center font-bold">2</div>
            <div className="flex-1">
              <h3 className="font-bold text-[#1C1D22] dark:text-white mb-2">Authenticate</h3>
              <p className="text-gray-500 text-sm font-medium mb-4">
                Login securely with your API key from the Dashboard.
              </p>
              
              <div className="bg-[#0A0A0B] rounded-xl overflow-hidden flex items-center justify-between shadow-lg max-w-2xl border border-gray-800">
                <code className="text-[#a9dc76] text-sm font-mono px-4 py-3">autopayx login aupi_live_your_api_key</code>
                <button 
                  onClick={() => handleCopy("autopayx login aupi_live_your_api_key")}
                  className="px-4 py-3 text-gray-400 hover:text-white transition-colors bg-[#1C1D22] border-l border-gray-800"
                >
                  {copied === "autopayx login aupi_live_your_api_key" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Commands */}
          <div className="flex space-x-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2d2e33] text-gray-400 flex items-center justify-center font-bold">3</div>
            <div className="flex-1">
              <h3 className="font-bold text-[#1C1D22] dark:text-white mb-2">Run Commands</h3>
              <p className="text-gray-500 text-sm font-medium mb-4">
                Create and track orders seamlessly.
              </p>
              
              <div className="bg-[#0A0A0B] rounded-xl p-4 shadow-lg text-sm font-mono text-gray-300 space-y-2 max-w-2xl border border-gray-800">
                <div><span className="text-gray-500"># Create a new ₹1499 payment link</span></div>
                <div className="text-[#a9dc76]">autopayx orders create --amount 1499 --customer "Rahul Sharma"</div>
                <div className="mt-4"><span className="text-gray-500"># Check if the customer paid</span></div>
                <div className="text-[#a9dc76]">autopayx orders status ORD20260915A1B2C3</div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
