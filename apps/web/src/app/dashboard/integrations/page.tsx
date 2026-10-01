'use client';

import { Terminal, Copy, CheckCircle2, MonitorSmartphone } from 'lucide-react';
import { useState } from 'react';
import PageBanner, { bannerConfigs } from '@/components/PageBanner';

export default function IntegrationsPage() {
  const [copied, setCopied] = useState('');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  };

  const installCmd = "npm install -g autopayx-cli";

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <PageBanner pageKey="integrations" {...bannerConfigs.integrations} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#1C1D22] dark:text-white mb-1">
          Integrations & SDKs
        </h1>
        <p className="text-gray-500 font-medium text-sm">
          Connect AutoPayX to your existing workflows and terminals.
        </p>
      </div>

      <div className="bg-white dark:bg-[#1C1D22] rounded-2xl border border-gray-100 dark:border-[#2d2e33] shadow-sm p-8 transition-colors">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mr-4">
            <Terminal className="w-6 h-6 text-[#6C3FE2] dark:text-[#8b61ff]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1C1D22] dark:text-white">AutoPayX CLI</h2>
            <p className="text-gray-500 font-medium text-sm">Manage your UPI payments directly from your terminal across Windows, Mac, and Linux.</p>
          </div>
        </div>

        <div className="space-y-8">
          
          {/* Step 1: Install */}
          <div className="flex space-x-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1C1D22] text-white flex items-center justify-center font-bold">1</div>
            <div className="flex-1">
              <h3 className="font-bold text-[#1C1D22] mb-2">Install the CLI</h3>
              <p className="text-gray-500 text-sm font-medium mb-4">
                The AutoPayX CLI natively supports PowerShell, Command Prompt, VS Code Terminal, Cursor Terminal, and Antigravity Terminal on Windows, as well as native terminals on Mac and Linux.
              </p>
              
              <div className="bg-[#1C1D22] rounded-xl overflow-hidden flex items-center justify-between shadow-lg max-w-2xl">
                <code className="text-[#a9dc76] text-sm font-mono px-4 py-3">{installCmd}</code>
                <button 
                  onClick={() => handleCopy(installCmd)}
                  className="px-4 py-3 text-gray-400 hover:text-white transition-colors bg-[#222328] border-l border-[#2d2e33]"
                >
                  {copied === installCmd ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Step 2: Authenticate */}
          <div className="flex space-x-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold">2</div>
            <div className="flex-1">
              <h3 className="font-bold text-[#1C1D22] mb-2">Authenticate</h3>
              <p className="text-gray-500 text-sm font-medium mb-4">
                Login with your API key from the Dashboard.
              </p>
              
              <div className="bg-[#1C1D22] rounded-xl overflow-hidden flex items-center justify-between shadow-lg max-w-2xl">
                <code className="text-[#a9dc76] text-sm font-mono px-4 py-3">autopayx login aupi_live_your_api_key</code>
                <button 
                  onClick={() => handleCopy("autopayx login aupi_live_your_api_key")}
                  className="px-4 py-3 text-gray-400 hover:text-white transition-colors bg-[#222328] border-l border-[#2d2e33]"
                >
                  {copied === "autopayx login aupi_live_your_api_key" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Commands */}
          <div className="flex space-x-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold">3</div>
            <div className="flex-1">
              <h3 className="font-bold text-[#1C1D22] mb-2">Run Commands</h3>
              <p className="text-gray-500 text-sm font-medium mb-4">
                Create and track orders seamlessly.
              </p>
              
              <div className="bg-[#1C1D22] rounded-xl p-4 shadow-lg text-sm font-mono text-gray-300 space-y-2 max-w-2xl">
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
