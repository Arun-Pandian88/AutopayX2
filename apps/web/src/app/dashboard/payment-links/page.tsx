'use client';

import { useState, useEffect } from 'react';
import { Link as LinkIcon, Plus, Copy, CheckCircle2, Search, AlertCircle, ArrowUpRight, ShieldCheck, Check, ExternalLink, QrCode, Smartphone, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function PaymentLinksPage() {
  const [view, setView] = useState<'list' | 'create' | 'test-checkout' | 'success'>('list');
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success State Data
  const [createdLink, setCreatedLink] = useState<any>(null);
  const [realUpiId, setRealUpiId] = useState('test@upi');
  const [realPayeeName, setRealPayeeName] = useState('TestMerchant');
  const [testTxnId, setTestTxnId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentMethodTab, setPaymentMethodTab] = useState<'qr' | 'upi_id' | 'upi_app'>('qr');

  // Modal & Toast State
  const [deleteModal, setDeleteModal] = useState<{ id: string, title: string } | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/payment-links`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setLinks(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/payment-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: description,
          amount: parseFloat(amount),
          type: 'single'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedLink(data.data);
        fetchLinks();
        
        // Fetch Real UPI ID for the QR code
        try {
          const resSettings = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/payment-settings`, { credentials: 'include' });
          if (resSettings.ok) {
            const settings = await resSettings.json();
            if (settings && settings.length > 0) {
              setRealUpiId(settings[0].master_upi_id || settings[0].upi_number || 'test@upi');
              setRealPayeeName(settings[0].payee_name || 'TestMerchant');
            }
          }
        } catch (e) {}

        setView('test-checkout');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  };

  // Trigger real-time backend verification loop for test-checkout
  useEffect(() => {
    if (view === 'test-checkout' && createdLink) {
      let interval: any;
      let txnId = testTxnId;

      const initiateAndPoll = async () => {
        try {
          if (!txnId) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/pay/${createdLink.link_id}/initiate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ customer_name: customerName || 'Walk-in customer', customer_email: customerEmail })
            });
            if (!res.ok) {
              const text = await res.text();
              console.error("Initiate error:", text);
              return;
            }
            const json = await res.json();
            if (json.success) {
              txnId = json.data.txn_id;
              setTestTxnId(txnId);
            }
          }

          if (txnId) {
            interval = setInterval(async () => {
              try {
                const statusRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/pay/${createdLink.link_id}/status/${txnId}`);
                if (!statusRes.ok) {
                  const text = await statusRes.text();
                  console.error("Status error:", text);
                  return;
                }
                const statusJson = await statusRes.json();
                if (statusJson.success && statusJson.data.status === 'success') {
                  clearInterval(interval);
                  setView('success');
                }
              } catch (err) {
                console.error(err);
              }
            }, 2000);
          }
        } catch (err) {
          console.error(err);
        }
      };

      initiateAndPoll();
      return () => { if (interval) clearInterval(interval); };
    }
  }, [view, createdLink]);

  const executeDelete = async () => {
    if (!deleteModal) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/payment-links/${deleteModal.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchLinks();
        showToast('Payment link deleted successfully');
      } else {
        showToast('Failed to delete payment link');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred while deleting');
    } finally {
      setDeleteModal(null);
    }
  };

  // --- HEADER ---
  const Header = () => (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-[#1C1D22]">Payment links</h1>
      <div className="flex gap-3">
        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
          <AlertCircle className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setView('create')}
          className="px-4 py-2 bg-[#1C1D22] text-white text-sm font-semibold rounded-lg hover:bg-black transition-all flex items-center gap-2"
        >
          <LinkIcon className="w-4 h-4" /> New payment link
        </button>
      </div>
    </div>
  );

  // --- CREATE VIEW ---
  if (view === 'create') {
    return (
      <div className="max-w-[1000px] mx-auto pb-12 pt-6 px-4 font-sans">
        <Header />
        
        <p className="text-gray-500 text-sm mb-8">Send a secure UPI payment request to a customer.</p>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Form Panel */}
          <div className="flex-1 bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-700">01</div>
              <div>
                <h3 className="font-bold text-[#1C1D22]">Payment details</h3>
                <p className="text-sm text-gray-500">What should the customer pay?</p>
              </div>
            </div>

            <form onSubmit={handleCreateLink} className="space-y-6">
              {/* Amount */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold text-[#1C1D22]">Amount</label>
                  <span className="text-xs font-bold text-gray-400">INR</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-bold">₹</span>
                  </div>
                  <input 
                    type="number" 
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="2499"
                    className="w-full border border-gray-200 rounded-xl py-3 pl-8 pr-4 text-[#1C1D22] font-bold focus:outline-none focus:ring-2 focus:ring-[#1C1D22] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-[#1C1D22] mb-2">Payment description</label>
                <input 
                  type="text" 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Pro plan renewal"
                  className="w-full border border-gray-200 rounded-xl py-3 px-4 text-[#1C1D22] text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1D22] focus:border-transparent transition-all"
                />
              </div>

              {/* Customer Details */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-[#1C1D22]">Customer name</label>
                    <span className="text-xs text-gray-400">Optional</span>
                  </div>
                  <input 
                    type="text" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ananya Sharma"
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 text-[#1C1D22] text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1D22] focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-[#1C1D22]">Email receipt</label>
                    <span className="text-xs text-gray-400">Optional</span>
                  </div>
                  <input 
                    type="email" 
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="ananya@email.com"
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 text-[#1C1D22] text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1D22] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isSubmitting || !amount || !description}
                  className="w-full py-4 bg-[#202532] text-white font-bold rounded-xl hover:bg-[#151923] transition-colors flex items-center justify-center disabled:opacity-70 gap-2 shadow-md"
                >
                  {isSubmitting ? 'Creating...' : 'Create payment link'} <ArrowUpRight className="w-4 h-4" />
                </button>
                <p className="text-center text-xs text-gray-400 font-medium mt-4">The link expires in 24 hours</p>
              </div>
            </form>
          </div>

          {/* Right Preview Panel */}
          <div className="flex-1 bg-[#FAFAFA] rounded-3xl p-8 border border-gray-100/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-700">02</div>
              <div>
                <h3 className="font-bold text-[#1C1D22]">Customer preview</h3>
                <p className="text-sm text-gray-500">This is what they will see</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col items-center pt-8 pb-6 px-6">
              
              <div className="w-full flex justify-between items-start mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center text-white">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">FlowPay</h4>
                    <p className="text-xs text-gray-500">Secure checkout</p>
                  </div>
                </div>
                <ShieldCheck className="w-5 h-5 text-[#008945]" />
              </div>

              <div className="text-center mb-10">
                <p className="text-sm text-gray-500 font-medium mb-1">Amount to pay</p>
                <h2 className="text-4xl font-black text-gray-900 mb-2">₹{amount ? parseFloat(amount).toLocaleString() : '0'}</h2>
                <p className="text-sm text-gray-500">{description || 'Payment description'}</p>
              </div>

              <div className="w-full border-t border-gray-100 pt-4 flex justify-between items-center text-xs font-bold">
                <span className="text-gray-400 uppercase tracking-wider">UPI payment</span>
                <span className="text-[#008945] flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Encrypted</span>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 font-medium mt-6">Fast, familiar and secure payments with any UPI app.</p>
          </div>

        </div>
      </div>
    );
  }

  // --- TEST CHECKOUT VIEW (Screenshot 3) ---
  if (view === 'test-checkout') {
    return (
      <div className="max-w-[1100px] mx-auto pb-12 pt-6 px-4 font-sans">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-[#1C1D22]">Checkout preview</h1>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://autopay.in';
                copyToClipboard(`${baseUrl}/pay/${createdLink?.link_id}`);
              }}
              className="px-4 py-2 bg-white text-[#1C1D22] border border-gray-200 text-sm font-bold rounded-lg hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
            >
              <Copy className="w-4 h-4" /> Copy link
            </button>
            <button 
              onClick={() => {
                setAmount('');
                setDescription('');
                setCustomerName('');
                setCustomerEmail('');
                setView('create');
              }}
              className="text-sm font-bold text-gray-600 hover:text-gray-900 px-2"
            >
              Start over
            </button>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Summary Panel */}
          <div className="flex-1 bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h4 className="font-bold text-[#1C1D22] text-sm">FlowPay checkout</h4>
                <p className="text-xs text-gray-500 font-mono">{testTxnId || 'Initiating...'}</p>
              </div>
              <div className="bg-[#FFF4E5] text-[#B76E00] px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                Awaiting payment...
              </div>
            </div>

            <div className="text-center mb-12">
              <p className="text-sm text-gray-500 font-medium mb-1">Amount due</p>
              <h2 className="text-4xl font-black text-[#1C1D22] mb-2">₹{amount ? parseFloat(amount).toLocaleString() : '0'}</h2>
              <p className="text-sm text-gray-500">{description}</p>
            </div>

            <div className="bg-[#F8F9FA] rounded-2xl p-6 space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Customer</span>
                <span className="font-bold text-[#1C1D22]">{customerName || 'Walk-in customer'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment ID</span>
                <span className="font-bold text-[#1C1D22] font-mono">{testTxnId || '...'}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 font-medium">
              Live Checkout URL active
            </div>
          </div>

          {/* Right Payment Panel */}
          <div className="flex-[1.2] bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] flex flex-col">
            <h3 className="font-bold text-[#1C1D22] mb-4">Choose how to pay</h3>
            
            <div className="flex p-1 bg-[#F4F5F9] rounded-xl mb-12">
              <button 
                onClick={() => setPaymentMethodTab('qr')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${paymentMethodTab === 'qr' ? 'bg-[#1C1D22] text-white shadow-sm' : 'text-gray-600 hover:text-[#1C1D22]'}`}
              >
                <QrCode className="w-4 h-4" /> Scan QR
              </button>
              <button 
                onClick={() => setPaymentMethodTab('upi_id')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${paymentMethodTab === 'upi_id' ? 'bg-[#1C1D22] text-white shadow-sm' : 'text-gray-600 hover:text-[#1C1D22]'}`}
              >
                <LinkIcon className="w-4 h-4" /> UPI ID
              </button>
              <button 
                onClick={() => setPaymentMethodTab('upi_app')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${paymentMethodTab === 'upi_app' ? 'bg-[#1C1D22] text-white shadow-sm' : 'text-gray-600 hover:text-[#1C1D22]'}`}
              >
                <Smartphone className="w-4 h-4" /> UPI app
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              {paymentMethodTab === 'qr' && (
                <>
                  <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-6 inline-block">
                    <QRCodeSVG 
                      value={`upi://pay?pa=${realUpiId}&pn=${realPayeeName}&am=${amount}&cu=INR`}
                      size={200}
                      level="Q"
                      includeMargin={false}
                    />
                  </div>
                  <h4 className="font-bold text-[#1C1D22] mb-1">Scan with any UPI app</h4>
                  <p className="text-xs text-gray-500 mb-8">Google Pay • PhonePe • Paytm • BHIM</p>
                  
                  <button 
                    disabled={true}
                    className="w-full py-4 bg-[#141721] text-white font-bold rounded-xl flex items-center justify-center gap-2 opacity-80 cursor-wait mt-auto"
                  >
                    Scan QR to pay ₹{amount ? parseFloat(amount).toLocaleString() : '0'} <ArrowUpRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {paymentMethodTab === 'upi_id' && (
                <div className="w-full flex flex-col h-full">
                  <div className="flex-1 flex flex-col justify-center">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Enter your UPI ID</label>
                    <div className="relative mb-4">
                      <input 
                        type="text" 
                        placeholder="e.g. name@okhdfcbank"
                        className="w-full pl-4 pr-10 py-4 bg-white border border-gray-200 rounded-xl text-[#1C1D22] text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1D22]/10 focus:border-[#1C1D22] transition-all placeholder:text-gray-400 font-medium"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                         <span className="text-green-500 hidden">✓</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">A payment request will be sent to your UPI app.</p>
                  </div>
                  <button 
                    className="w-full py-4 bg-[#141721] text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 mt-auto shadow-md"
                  >
                    Pay ₹{amount ? parseFloat(amount).toLocaleString() : '0'} <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {paymentMethodTab === 'upi_app' && (
                <div className="w-full flex flex-col h-full">
                  <div className="flex-1 flex flex-col justify-center gap-4">
                    <a href={`upi://pay?pa=${realUpiId}&pn=${realPayeeName}&am=${amount}&cu=INR`} className="w-full p-4 border border-gray-200 rounded-2xl flex items-center justify-between hover:border-gray-300 hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center p-2">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-bold text-gray-800">Google Pay</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-800 transition-colors" />
                    </a>
                    
                    <a href={`upi://pay?pa=${realUpiId}&pn=${realPayeeName}&am=${amount}&cu=INR`} className="w-full p-4 border border-gray-200 rounded-2xl flex items-center justify-between hover:border-gray-300 hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#5F259F] rounded-full shadow-sm border border-gray-100 flex items-center justify-center p-2">
                          <span className="text-white font-black text-xs">Pê</span>
                        </div>
                        <span className="font-bold text-gray-800">PhonePe</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-800 transition-colors" />
                    </a>

                    <a href={`upi://pay?pa=${realUpiId}&pn=${realPayeeName}&am=${amount}&cu=INR`} className="w-full p-4 border border-gray-200 rounded-2xl flex items-center justify-between hover:border-gray-300 hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#002970] rounded-full shadow-sm border border-gray-100 flex items-center justify-center p-1.5">
                          <span className="text-white font-black text-[10px]">Paytm</span>
                        </div>
                        <span className="font-bold text-gray-800">Paytm</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-800 transition-colors" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // --- SUCCESS VIEW (Screenshot 2) ---
  if (view === 'success') {
    return (
      <div className="max-w-[1000px] mx-auto pb-12 pt-6 px-4 font-sans">
        <Header />
        
        <div className="flex flex-col items-center justify-center mt-12 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-[#D7F1E2] rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-[#008945]" strokeWidth={2.5} />
          </div>
          
          <h2 className="text-[#008945] font-bold text-sm mb-2">Payment link created</h2>
          <h1 className="text-3xl font-black text-[#1C1D22] mb-4 text-center">Ready to receive ₹{createdLink?.amount?.toLocaleString()}</h1>
          <p className="text-gray-500 text-center text-sm mb-8">
            The payment link was generated successfully and added to your dashboard. Share it with your customer to collect the payment.
          </p>

          <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 space-y-4 mb-8 shadow-sm">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-500 text-sm">Link ID</span>
              <span className="font-bold text-[#1C1D22] text-sm font-mono">{createdLink?.link_id}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-500 text-sm">Customer</span>
              <span className="font-bold text-[#1C1D22] text-sm">{customerName || 'Walk-in customer'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-500 text-sm">Description</span>
              <span className="font-bold text-[#1C1D22] text-sm">{createdLink?.title}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-500 text-sm">Status</span>
              <span className="font-bold text-[#008945] text-sm">Active</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-500 text-sm">Payment URL</span>
              <button 
                onClick={() => {
                  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://autopay.in';
                  copyToClipboard(`${baseUrl}/pay/${createdLink?.link_id}`);
                }}
                className="text-indigo-600 hover:text-indigo-800 font-bold text-sm flex items-center gap-1"
              >
                Copy Link <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => {
                setAmount('');
                setDescription('');
                setCustomerName('');
                setCustomerEmail('');
                setView('create');
              }}
              className="px-6 py-3 bg-[#1C1D22] text-white text-sm font-bold rounded-xl hover:bg-black transition-all shadow-md flex items-center gap-2"
            >
              <LinkIcon className="w-4 h-4" /> Create another link
            </button>
            <button 
              onClick={() => setView('list')}
              className="px-6 py-3 bg-white text-[#1C1D22] border border-gray-200 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" /> View all links
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="max-w-[1000px] mx-auto pb-12 pt-6 px-4 font-sans">
      <Header />
      
      {loading ? (
        <div className="py-20 text-center text-gray-400 font-medium animate-pulse">Loading payment links...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#F8F9FA] border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-bold text-[#1C1D22] text-sm mb-1">{link.title || link.name}</p>
                    <p className="text-xs text-gray-500 font-mono">/pay/{link.link_id}</p>
                  </td>
                  <td className="px-6 py-5 font-bold text-[#1C1D22] text-sm">₹{link.amount.toLocaleString()}</td>
                  <td className="px-6 py-5">
                    {link.status === 'active' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EBF5FF] text-[#0066FF] border border-[#0066FF]/20">
                        <span className="w-1.5 h-1.5 bg-[#0066FF] rounded-full mr-1.5 animate-pulse"></span> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#D7F1E2] text-[#008945] border border-[#008945]/20">
                        <Check className="w-3 h-3 mr-1" /> Paid
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://autopay.in';
                          copyToClipboard(`${baseUrl}/pay/${link.link_id}`);
                        }}
                        className="inline-flex items-center justify-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
                      >
                        Copy Link
                      </button>
                      <button 
                        onClick={() => setDeleteModal({ id: link.id, title: link.title || link.name })}
                        className="inline-flex items-center justify-center px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                      <LinkIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-[#1C1D22] font-bold text-sm mb-1">No payment links yet</p>
                    <p className="text-gray-500 text-sm mb-4">Create your first link to start collecting payments.</p>
                    <button 
                      onClick={() => setView('create')}
                      className="px-4 py-2 bg-[#1C1D22] text-white text-xs font-bold rounded-lg hover:bg-black transition-all shadow-md inline-flex items-center gap-2"
                    >
                      <Plus className="w-3 h-3" /> Create link
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#1C1D22]">Delete Payment Link</h3>
              <button onClick={() => setDeleteModal(null)} className="text-gray-400 hover:text-gray-900 transition-colors">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600 font-medium text-sm">
                Are you sure you want to delete <strong className="text-gray-900">{deleteModal.title}</strong>? This action cannot be undone and customers won't be able to pay using this link.
              </p>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setDeleteModal(null)} 
                  className="flex-1 py-3 px-4 font-bold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeDelete} 
                  className="flex-1 py-3 px-4 font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1C1D22] text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm flex items-center z-[200] animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 mr-2 text-[#bdf32b]" />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
