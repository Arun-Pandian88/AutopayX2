'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, XCircle, Loader2, Shield, CreditCard, Copy, ArrowRight, ShieldCheck, AlertCircle, Timer, QrCode, Link as LinkIcon, Smartphone, ArrowUpRight } from 'lucide-react';

type CheckoutData = {
  link_id: string;
  title: string;
  amount: number;
  currency: string;
  type: string;
  merchant: { name: string; business_name: string };
  upi_id: string | null;
  payee_name: string;
  upi_deep_link: string | null;
  theme: {
    theme_id: string;
    business_name: string;
    brand_color: string;
    brand_logo: string;
    logo_type: string;
  } | null;
};

type PaymentState = 'loading' | 'checkout' | 'paying' | 'verifying' | 'success' | 'failed' | 'expired' | 'not_found';

export default function CheckoutPage() {
  const handleSimulatePayment = async () => {
    try {
      const res = await fetch(`${API}/api/pay/${slug}/simulate/${txnId}`, {
        method: 'POST'
      });
      const json = await res.json();
      if (json.success) {
        // Polling will automatically pick it up in 5 seconds and transition to success
        alert('Simulated! Waiting for next poll...');
      }
    } catch (err) {
      console.error(err);
    }
  };
  const params = useParams();
  const slug = params.slug as string;

  const [state, setState] = useState<PaymentState>('loading');
  const [data, setData] = useState<CheckoutData | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [txnId, setTxnId] = useState('');
  const [utr, setUtr] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timer
  const [paymentTab, setPaymentTab] = useState<'qr' | 'upi_id' | 'upi_app'>('qr');

  const API = '';

  useEffect(() => {
    if (!slug) return;
    fetch(`${API}/api/pay/${slug}`)
      .then(res => {
        if (res.status === 404) { setState('not_found'); return null; }
        if (res.status === 410) { setState('expired'); return null; }
        return res.json();
      })
      .then(json => {
        if (json?.success) {
          setData(json.data);
          
          if (json.data.customer_name) setCustomerName(json.data.customer_name);
          if (json.data.customer_email) setCustomerEmail(json.data.customer_email);
          
          if (json.data.customer_name && json.data.customer_email) {
            handleInitiate(json.data.customer_name, json.data.customer_email);
          } else {
            setState('checkout');
          }
        }
      })
      .catch(() => setState('not_found'));
  }, [slug, API]);

  const brandColor = data?.theme?.brand_color || '#6C3FE2';

  async function handleInitiate(overrideName?: any, overrideEmail?: any) {
      const finalName = typeof overrideName === 'string' ? overrideName : customerName;
      const finalEmail = typeof overrideEmail === 'string' ? overrideEmail : customerEmail;
      
      setState('loading'); // Show loading while generating order
      try {
        const res = await fetch(`${API}/api/pay/${slug}/initiate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customer_name: finalName, customer_email: finalEmail })
        });
        const json = await res.json();
        if (json.success) {
          setTxnId(json.data.txn_id);
          setState('paying'); // Now show the QR code and start polling
        } else {
          setError(json.message || 'Payment initiation failed');
          setState('failed');
        }
      } catch (err) {
        console.error("Initiate error:", err);
      setError('Network error. Please try again.');
      setState('failed');
    }
  }

  useEffect(() => {
    if (state !== 'paying' || !txnId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/pay/${slug}/status/${txnId}`);
        const json = await res.json();
        if (json.success && json.data.status === 'success') {
          setState('success');
          clearInterval(interval);
        }
      } catch (e) {
        console.error('Polling error', e);
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [state, txnId, slug, API]);

  useEffect(() => {
    if (state !== 'paying') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('Payment session expired. Please try again.');
          setState('failed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state]);

  
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const copyUPI = () => {
    if (data?.upi_id) {
      navigator.clipboard.writeText(data.upi_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // --- LOADING ---
  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-[#0D0518] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#6C3FE2] animate-spin" />
      </div>
    );
  }

  // --- NOT FOUND ---
  if (state === 'not_found') {
    return (
      <div className="min-h-screen bg-[#0D0518] flex items-center justify-center px-6">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-white mb-3">Payment Link Not Found</h1>
          <p className="text-gray-400 font-medium">This payment link does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  // --- EXPIRED ---
  if (state === 'expired') {
    return (
      <div className="min-h-screen bg-[#0D0518] flex items-center justify-center px-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-white mb-3">Link Expired</h1>
          <p className="text-gray-400 font-medium">This payment link is no longer active. Please contact the merchant.</p>
        </div>
      </div>
    );
  }

  // --- SUCCESS ---
  if (state === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 overflow-hidden relative transition-colors duration-1000" style={{ backgroundColor: brandColor }}>
        {/* Background Animation Effects */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/20 rounded-full blur-[100px] animate-pulse"></div>
        
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl relative z-10 animate-in zoom-in-95 duration-500 fade-in">
          
          <div className="flex flex-col items-center mb-8 animate-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
            <div className="relative mb-8 mt-4">
              <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20 scale-150"></div>
              <div className="absolute inset-0 bg-white rounded-full animate-pulse opacity-40 scale-110"></div>
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.5)] relative z-10">
                <CheckCircle2 className="w-12 h-12 animate-in zoom-in duration-500 delay-300" style={{ color: brandColor }} strokeWidth={3} />
              </div>
            </div>
            
            <h1 className="text-3xl font-black text-white text-center tracking-tight mb-3">Payment Successful!</h1>
            <p className="text-white/80 text-center font-medium text-sm">
              Your payment has been verified securely. <br/>
              <span className="text-white font-bold mt-1 inline-block text-base">{data?.merchant?.business_name || data?.merchant?.name}</span>
            </p>
          </div>

          <div className="bg-white/10 rounded-3xl p-6 mb-8 border border-white/10 animate-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-both shadow-inner space-y-5">
            <div className="flex flex-col items-center pb-5 border-b border-white/10">
              <span className="text-white/60 font-medium text-sm mb-1">Amount Paid</span>
              <span className="text-5xl font-black text-white tracking-tighter">?{data?.amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-white/60 font-medium text-sm">Transaction ID</span>
              <span className="text-white font-mono text-xs font-bold tracking-wider bg-black/20 px-3 py-1.5 rounded-xl">{txnId}</span>
            </div>
          </div>
          
          <div className="text-center animate-in fade-in duration-700 delay-500 fill-mode-both">
            <p className="text-white/50 text-xs font-bold flex items-center justify-center gap-1.5 uppercase tracking-[0.2em]">
              <ShieldCheck className="w-4 h-4" /> Secured by AutoPayX
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- FAILED ---
  if (state === 'failed') {
    return (
      <div className="min-h-screen bg-[#0D0518] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-white mb-3">Payment Failed</h1>
          <p className="text-gray-400 font-medium mb-6">{error || 'Something went wrong. Please try again.'}</p>
          <button onClick={() => setState('checkout')} className="px-6 py-3 bg-[#6C3FE2] text-white font-bold rounded-xl hover:bg-[#5a34bd] transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --- PAYING (QR Code & Polling) ---
  if (state === 'paying') {
    const upiLinkWithTr = data?.upi_deep_link ? `${data.upi_deep_link}&tr=${txnId}` : '';
    
    return (
      <div className="min-h-screen bg-[#F4F5F9] flex items-center justify-center px-4 py-12 relative font-sans">
        
        <div className="w-full max-w-md bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 relative z-10">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#1C1D22]">Choose how to pay</h2>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-500 text-xs font-bold animate-pulse">
              <Timer className="w-3.5 h-3.5" /> {formatTime(timeLeft)}
            </div>
          </div>

          {/* Tabs */}
            <div className="flex bg-[#F4F5F9] p-1.5 rounded-xl mb-8">
              <button 
                onClick={() => setPaymentTab('qr')}
                className={`flex-1 py-2.5 ${paymentTab === 'qr' ? 'bg-[#1C1D22] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'} rounded-lg text-sm font-bold flex items-center justify-center transition-all`}
              >
                <QrCode className="w-4 h-4 mr-2" /> Scan QR
              </button>
              <button 
                onClick={() => setPaymentTab('upi_id')}
                className={`flex-1 py-2.5 ${paymentTab === 'upi_id' ? 'bg-[#1C1D22] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'} rounded-lg text-sm font-bold flex items-center justify-center transition-all`}
              >
                <LinkIcon className="w-4 h-4 mr-2" /> UPI ID
              </button>
              <button 
                onClick={() => setPaymentTab('upi_app')}
                className={`flex-1 py-2.5 ${paymentTab === 'upi_app' ? 'bg-[#1C1D22] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'} rounded-lg text-sm font-bold flex items-center justify-center transition-all`}
              >
                <Smartphone className="w-4 h-4 mr-2" /> UPI app
              </button>
            </div>

          {/* QR Box */}
            <div className="flex flex-col items-center justify-center mb-6 min-h-[300px]">
              {paymentTab === 'qr' && (
                <>
                  {upiLinkWithTr ? (
                    <div className="bg-white p-4 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 mb-6 flex justify-center">
                      <QRCodeSVG value={upiLinkWithTr} size={200} level="H" includeMargin={false} />
                    </div>
                  ) : (
                    <div className="w-[232px] h-[232px] bg-gray-100 rounded-[24px] mb-6 flex flex-col items-center justify-center text-gray-400 text-sm font-medium">
                      QR Not Available
                    </div>
                  )}
                  <h3 className="text-[#1C1D22] font-bold mb-1.5 text-base">Scan with any UPI app</h3>
                  <p className="text-xs font-medium text-gray-400">Google Pay � PhonePe � Paytm � BHIM</p>
                </>
              )}
              
              {paymentTab === 'upi_id' && (
                <div className="w-full">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#F4F5F9] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                      <LinkIcon className="w-8 h-8 text-[#1C1D22]" />
                    </div>
                    <h3 className="text-[#1C1D22] font-bold mb-1">Pay via UPI ID</h3>
                    <p className="text-sm text-gray-500 mb-6">Copy our UPI ID to pay from any app</p>
                    
                    <div className="bg-[#F4F5F9] border border-gray-100 rounded-xl p-4 flex items-center justify-between mb-4">
                      <div className="text-left">
                        <p className="text-xs text-gray-500 font-bold mb-1">VPA / UPI ID</p>
                        <p className="text-sm font-bold text-[#1C1D22]">{data?.upi_id || 'Not available'}</p>
                      </div>
                      <button 
                        onClick={copyUPI}
                        className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-600" />}
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      Step 1: Copy the UPI ID<br/>
                      Step 2: Open any UPI app<br/>
                      Step 3: Paste and pay exactly ?{data?.amount?.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
              
              {paymentTab === 'upi_app' && (
                <div className="w-full text-center">
                  <div className="w-16 h-16 bg-[#F4F5F9] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <Smartphone className="w-8 h-8 text-[#1C1D22]" />
                  </div>
                  <h3 className="text-[#1C1D22] font-bold mb-1">Open UPI App</h3>
                  <p className="text-sm text-gray-500 mb-6">Directly open a UPI app on your phone</p>
                  
                  {isMobile ? (
                    <a 
                      href={upiLinkWithTr}
                      className="w-full py-4 text-white font-bold rounded-xl flex items-center justify-center shadow-md shadow-[#6C3FE2]/20 mb-4 bg-[#6C3FE2] transition-transform active:scale-95"
                    >
                      <Smartphone className="w-5 h-5 mr-2" /> Open UPI App
                    </a>
                  ) : (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-orange-700 text-sm font-bold">
                      This option is only available on mobile devices. Please scan the QR code instead.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Button */}
          <button 
            className="w-full py-4 text-white font-bold rounded-xl flex items-center justify-center transition-all hover:opacity-90 shadow-md"
            style={{ backgroundColor: brandColor && brandColor !== '#6C3FE2' ? brandColor : '#424553' }}
          >
            Scan QR to pay ₹{data?.amount?.toFixed(0)} <ArrowUpRight className="w-4 h-4 ml-1.5" />
          </button>
          
        </div>
      </div>
    );
  }

  // --- CHECKOUT (Main Payment Page) ---
  return (
    <div className="min-h-screen bg-[#0D0518] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none opacity-20" style={{ backgroundColor: brandColor }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Merchant Header */}
        <div className="text-center mb-8">
          {data?.theme?.logo_type === 'image' && data?.theme?.brand_logo ? (
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden" style={{ backgroundColor: brandColor }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.theme.brand_logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black mx-auto mb-4 shadow-lg" style={{ backgroundColor: brandColor }}>
              {data?.theme?.brand_logo || data?.merchant?.business_name?.charAt(0) || 'A'}
            </div>
          )}
          <h1 className="text-lg font-bold text-white">{data?.theme?.business_name || data?.merchant?.business_name || data?.merchant?.name}</h1>
        </div>

        {/* Payment Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
          {/* Amount Header */}
          <div className="p-8 text-center border-b border-white/5">
            <p className="text-gray-400 text-sm font-medium mb-2">{data?.title}</p>
            <div className="text-4xl font-black text-white">
              ₹{data?.amount?.toFixed(2)}
            </div>
          </div>

          {/* Customer Info + Proceed */}
          <div className="p-8">
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Name (Optional)</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#6C3FE2]/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email (Optional)</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#6C3FE2]/50"
                />
              </div>
            </div>

            <button
              onClick={() => handleInitiate()}
              className="w-full py-4 text-white font-bold rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center text-sm shadow-lg"
              style={{ backgroundColor: brandColor }}
            >
              Proceed to Pay <ArrowRight className="w-4 h-4 ml-2" />
            </button>

            {!data?.upi_id && (
              <div className="mt-4 bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
                <p className="text-orange-300 text-xs font-bold">⚠️ Merchant has not configured UPI ID yet. Please contact them.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> End-to-end encrypted · Secured by AutoPayX
          </p>
        </div>
      </div>
    </div>
  );
}
