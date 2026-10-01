'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, XCircle, Loader2, Shield, CreditCard, Copy, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

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

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
          setState('checkout');
        }
      })
      .catch(() => setState('not_found'));
  }, [slug, API]);

  const brandColor = data?.theme?.brand_color || '#6C3FE2';

  const handleInitiate = async () => {
    setState('paying');
    try {
      const res = await fetch(`${API}/api/pay/${slug}/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_name: customerName, customer_email: customerEmail })
      });
      const json = await res.json();
      if (json.success) {
        setTxnId(json.data.txn_id);
        setState('verifying');
      } else {
        setError(json.message || 'Payment initiation failed');
        setState('failed');
      }
    } catch {
      setError('Network error. Please try again.');
      setState('failed');
    }
  };

  useEffect(() => {
    if (state !== 'verifying' || !txnId) return;

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
      <div className="min-h-screen bg-[#0D0518] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Payment Successful!</h1>
          <p className="text-gray-400 font-medium mb-8">Your payment of <span className="text-white font-bold">₹{data?.amount?.toFixed(2)}</span> has been verified.</p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Paid to</span>
              <span className="text-white font-bold">{data?.merchant?.business_name || data?.merchant?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount</span>
              <span className="text-white font-bold">₹{data?.amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Transaction ID</span>
              <span className="text-white font-mono text-xs">{txnId}</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-8 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Secured by AutoPayX
          </p>
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

  // --- VERIFYING (Automatic Polling) ---
  if (state === 'verifying') {
    return (
      <div className="min-h-screen bg-[#0D0518] flex items-center justify-center px-6 py-12">
        <div className="text-center max-w-md">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-[#6C3FE2]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#6C3FE2] rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-[#6C3FE2]" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white mb-3">Verifying Payment...</h1>
          <p className="text-gray-400 font-medium mb-2">Please wait while we securely confirm your payment with the bank.</p>
          <p className="text-sm font-bold text-[#6C3FE2] animate-pulse">Do not close or refresh this page.</p>
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

          {/* QR Code */}
          {data?.upi_deep_link && (
            <div className="p-8 flex flex-col items-center border-b border-white/5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">Scan QR to Pay</p>
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <QRCodeSVG
                  value={data.upi_deep_link}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              {/* UPI Deep Link for Mobile */}
              <div className="w-full mt-5 md:hidden">
                <a
                  href={data.upi_deep_link}
                  className="w-full flex items-center justify-center py-3.5 text-white font-bold rounded-xl transition-colors text-sm shadow-md"
                  style={{ backgroundColor: brandColor }}
                >
                  Open UPI App to Pay
                </a>
              </div>
              
              {/* UPI ID Copy */}
              {data.upi_id && (
                <button onClick={copyUPI} className="mt-5 flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-mono text-gray-300 hover:bg-white/10 transition-colors">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  {data.upi_id}
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                </button>
              )}
              {copied && <span className="text-green-400 text-xs mt-2 font-bold">Copied!</span>}
            </div>
          )}

          {/* Customer Info + Pay */}
          <div className="p-8">
            <div className="space-y-4 mb-6">
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
              onClick={handleInitiate}
              className="w-full py-4 text-white font-bold rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center text-sm shadow-lg"
              style={{ backgroundColor: brandColor }}
            >
              I have paid ₹{data?.amount?.toFixed(2)} <ArrowRight className="w-4 h-4 ml-2" />
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
