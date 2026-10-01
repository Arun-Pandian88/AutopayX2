'use client';

import { Globe, Webhook, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ConfigPage() {
  const [successUrl, setSuccessUrl] = useState('');
  const [failedUrl, setFailedUrl] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/config`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setSuccessUrl(data.data.success_url || '');
          setFailedUrl(data.data.failed_url || '');
          setWebhookUrl(data.data.webhook_url || '');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          success_url: successUrl,
          failed_url: failedUrl,
          webhook_url: webhookUrl
        })
      });
      showToast('Config Saved Successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1C1D22] dark:text-white mb-2">
          Config
        </h1>
        <p className="text-gray-500 font-medium text-sm">
          Set where your customers return after paying and where we send payment events. These settings apply only to your own payment links.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Form Card */}
        <div className="bg-white dark:bg-[#1C1D22] rounded-2xl border border-gray-100 dark:border-[#2d2e33] p-6 lg:p-8 shadow-sm transition-colors flex flex-col space-y-8">
          
          {/* Redirect URLs Section */}
          <div>
            <div className="flex items-center mb-6">
              <Globe className="w-5 h-5 text-[#2c9d64] mr-3 shrink-0" />
              <div>
                <h2 className="text-lg font-bold text-[#1C1D22] dark:text-white">Redirect URLs</h2>
                <p className="text-xs text-gray-500 mt-1">Where the payer lands after the payment page</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1C1D22] dark:text-gray-200">Success redirect URL</label>
                <input 
                  type="url" 
                  placeholder="https://yoursite.com/payment-success"
                  value={successUrl}
                  onChange={(e) => setSuccessUrl(e.target.value)}
                  className="w-full bg-white dark:bg-[#0A0A0B] border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3FE2]/30 dark:text-white transition-all shadow-sm" 
                />
                <p className="text-xs text-gray-500 mt-1">
                  Opened after a successful payment, with <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[10px] font-mono">?order_id=...&status=paid</code> added.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1C1D22] dark:text-gray-200">Failed redirect URL</label>
                <input 
                  type="url" 
                  placeholder="https://yoursite.com/payment-failed"
                  value={failedUrl}
                  onChange={(e) => setFailedUrl(e.target.value)}
                  className="w-full bg-white dark:bg-[#0A0A0B] border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3FE2]/30 dark:text-white transition-all shadow-sm" 
                />
                <p className="text-xs text-gray-500 mt-1">
                  Opened when the payment link expires without payment, with <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[10px] font-mono">?order_id=...&status=failed</code> added.
                </p>
              </div>
            </div>
          </div>

          {/* Webhook URL Section */}
          <div className="pt-2">
            <div className="flex items-center mb-6">
              <Webhook className="w-5 h-5 text-[#2c9d64] mr-3 shrink-0" />
              <div>
                <h2 className="text-lg font-bold text-[#1C1D22] dark:text-white">Webhook URL</h2>
                <p className="text-xs text-gray-500 mt-1">Signed payment.paid events, server to server</p>
              </div>
            </div>

            <div className="space-y-2 mb-8">
              <label className="text-sm font-bold text-[#1C1D22] dark:text-gray-200">Webhook URL</label>
              <input 
                type="url" 
                placeholder="https://yoursite.com/autoupi-webhook.php"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-white dark:bg-[#0A0A0B] border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3FE2]/30 dark:text-white transition-all shadow-sm" 
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be HTTPS. Used for every order unless you send a <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[10px] font-mono">webhook_url</code> in the create order API.
              </p>
            </div>

            <button onClick={handleSave} disabled={saving} className="w-full bg-[#6C3FE2] hover:bg-[#5b32c6] text-white font-bold py-3.5 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center">
              {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Save config
            </button>
          </div>

        </div>

        {/* Right Settings Status Card */}
        <div className="bg-white dark:bg-[#1C1D22] rounded-2xl border border-gray-100 dark:border-[#2d2e33] p-6 lg:p-8 shadow-sm transition-colors">
          
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-lg font-bold text-[#1C1D22] dark:text-white">Current settings</h2>
            <span className="text-xs text-gray-400 font-medium">Only your account</span>
          </div>

          <div className="space-y-3">
            
            <div className="flex flex-col sm:flex-row sm:items-center px-4 py-4 border border-gray-100 dark:border-[#2d2e33] rounded-xl bg-white dark:bg-[#0A0A0B] shadow-sm">
              <div className="flex items-center sm:w-1/3 mb-2 sm:mb-0">
                <CheckCircle2 className="w-4 h-4 text-[#a9dc76] mr-3 shrink-0" />
                <span className="font-bold text-sm text-[#1C1D22] dark:text-white">Success</span>
              </div>
              <div className="sm:w-2/3">
                <span className="text-sm text-gray-500 line-clamp-1">{successUrl || 'Not set — payer stays on the result page'}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center px-4 py-4 border border-gray-100 dark:border-[#2d2e33] rounded-xl bg-white dark:bg-[#0A0A0B] shadow-sm">
              <div className="flex items-center sm:w-1/3 mb-2 sm:mb-0">
                <CheckCircle2 className="w-4 h-4 text-[#a9dc76] mr-3 shrink-0" />
                <span className="font-bold text-sm text-[#1C1D22] dark:text-white">Failed</span>
              </div>
              <div className="sm:w-2/3">
                <span className="text-sm text-gray-500 line-clamp-1">{failedUrl || 'Not set — payer stays on the result page'}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center px-4 py-4 border border-gray-100 dark:border-[#2d2e33] rounded-xl bg-white dark:bg-[#0A0A0B] shadow-sm">
              <div className="flex items-center sm:w-1/3 mb-2 sm:mb-0">
                <CheckCircle2 className="w-4 h-4 text-[#a9dc76] mr-3 shrink-0" />
                <span className="font-bold text-sm text-[#1C1D22] dark:text-white">Webhook</span>
              </div>
              <div className="sm:w-2/3">
                <span className="text-sm text-gray-500 line-clamp-1">{webhookUrl || 'Not set — no webhook is sent'}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
