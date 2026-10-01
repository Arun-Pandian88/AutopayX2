'use client';

import { Wallet, Mail, Watch, PlayCircle, Shuffle, ChevronDown, Check, Loader2, Plug, CheckCircle2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import PageBanner, { bannerConfigs } from '@/components/PageBanner';
import { QRCodeSVG } from 'qrcode.react';

export default function ConnectAccountsPage() {
  const [autoRouting, setAutoRouting] = useState(true);
  const [paymentApp, setPaymentApp] = useState('Google Pay');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mailbox Connect State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // UPI Routing State
  const [masterUpi, setMasterUpi] = useState('');
  const [upiNumber, setUpiNumber] = useState('');
  const [masterPayeeName, setMasterPayeeName] = useState('');
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [hasSavedDetails, setHasSavedDetails] = useState(false);
  const [upiList, setUpiList] = useState<{id: string, name: string}[]>([]);
  const [newUpiId, setNewUpiId] = useState('');
  const [newPayeeName, setNewPayeeName] = useState('');

  const [allSettings, setAllSettings] = useState<any[]>([]);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/payment-settings`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setAllSettings(data);
        
        // Find setting for current app
        const appSetting = data.find((s: any) => s.app_name === paymentApp);
        if (appSetting) {
          setMasterUpi(appSetting.master_upi_id || '');
          setUpiNumber(appSetting.upi_number || '');
          setMasterPayeeName(appSetting.payee_name || '');
          setEmail(appSetting.mailbox_email || '');
          setIsConnected(appSetting.is_connected || false);
          setAutoRouting(appSetting.auto_routing_enabled ?? true);
          setUpiList(appSetting.routing_upi_list || []);
        } else {
          setMasterUpi('');
          setUpiNumber('');
          setMasterPayeeName('');
          setEmail('');
          setIsConnected(false);
          setAutoRouting(true);
          setUpiList([]);
        }
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [paymentApp]);

  const handleConnect = async () => {
    if (!email || !password) return;
    setIsConnecting(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/payment-settings/mailbox`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          app_name: paymentApp,
          mailbox_email: email,
          mailbox_password: password
        })
      });
      setIsConnected(true);
      fetchSettings();
    } catch (e) {
      console.error(e);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/payment-settings/mailbox/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ app_name: paymentApp })
      });
      setIsConnected(false);
      setEmail('');
      setPassword('');
      fetchSettings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveDetails = async () => {
    setIsSavingDetails(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/payment-settings/master`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          app_name: paymentApp,
          master_upi_id: masterUpi,
          upi_number: upiNumber,
          payee_name: masterPayeeName
        })
      });
      setHasSavedDetails(true);
      fetchSettings();
      setTimeout(() => setHasSavedDetails(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingDetails(false);
    }
  };

  const saveRoutingToServer = async (newList: any[], routingEnabled: boolean) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/payment-settings/routing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          app_name: paymentApp,
          auto_routing_enabled: routingEnabled,
          routing_upi_list: newList
        })
      });
      fetchSettings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddUpi = () => {
    if (!newUpiId) return;
    if (upiList.length >= 10) return;
    const newList = [...upiList, { id: newUpiId, name: newPayeeName }];
    setUpiList(newList);
    saveRoutingToServer(newList, autoRouting);
    setNewUpiId('');
    setNewPayeeName('');
  };

  const handleRemoveUpi = (index: number) => {
    const newList = [...upiList];
    newList.splice(index, 1);
    setUpiList(newList);
    saveRoutingToServer(newList, autoRouting);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const apps = ['Google Pay', 'PhonePe', 'Paytm', 'FamPay', 'Personal UPI (Auto-Verify)'];

  const appData = {
    'Google Pay': {
      alertEmail: 'googlepay-noreply@google.com',
      upiPlaceholder: 'yourname@okhdfcbank',
      mailboxText: 'The inbox that receives your Google Pay payment alerts',
      icon: <img src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Pay_Logo_%282020%29.svg" alt="GPay" className="w-full h-full object-contain p-[2px] rounded-md" />
    },
    'PhonePe': {
      alertEmail: 'noreply@phonepe.com',
      upiPlaceholder: 'yourname@ybl',
      mailboxText: 'The inbox that receives your PhonePe payment alerts',
      icon: <img src="https://www.google.com/s2/favicons?domain=phonepe.com&sz=128" alt="PhonePe" className="w-full h-full object-contain rounded-md" />
    },
    'Paytm': {
      alertEmail: 'alerts@paytm.com',
      upiPlaceholder: 'yourname@paytm',
      mailboxText: 'The inbox that receives your Paytm payment alerts',
      icon: <img src="https://www.google.com/s2/favicons?domain=paytm.com&sz=128" alt="Paytm" className="w-full h-full object-contain p-0.5 rounded-md" />
    },
    'FamPay': {
      alertEmail: 'alerts@fampay.in',
      upiPlaceholder: 'yourname@fam',
      mailboxText: 'The inbox that receives your FamPay payment alerts',
      icon: <img src="https://www.google.com/s2/favicons?domain=famapp.in&sz=128" alt="FamPay" className="w-full h-full object-contain p-0.5 rounded-md" />
    },
    'Personal UPI (Auto-Verify)': {
      alertEmail: 'Any bank alert email (e.g., alerts@hdfcbank.net)',
      upiPlaceholder: 'yourname@upi',
      mailboxText: 'The inbox that receives your direct bank SMS/Email alerts',
      icon: <div className="w-full h-full flex items-center justify-center bg-[#D7F1E2] text-[#008945] rounded-md"><CheckCircle2 className="w-3 h-3" /></div>
    }
  };

  const currentApp = appData[paymentApp as keyof typeof appData] || appData['Google Pay'];

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans selection:bg-indigo-500/20">
      
      {/* Premium Success Popup */}
      {hasSavedDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-md transition-all duration-300">
          <style>{`
            @keyframes popBounce {
              0% { transform: scale(0.5); opacity: 0; }
              60% { transform: scale(1.1); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes textSlide {
              0% { transform: translateY(15px); opacity: 0; }
              100% { transform: translateY(0); opacity: 1; }
            }
            .animate-pop { animation: popBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
            .animate-text-slide { animation: textSlide 0.5s ease-out forwards; animation-delay: 0.1s; opacity: 0; }
          `}</style>
          
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.12)] flex flex-col items-center max-w-sm w-full mx-4 border border-gray-100 animate-pop">
            <div className="relative mb-6 mt-2">
              <div className="absolute inset-0 bg-[#008945] rounded-full animate-ping opacity-20" style={{ animationDuration: '2s' }}></div>
              <div className="absolute inset-0 bg-[#D7F1E2] rounded-full animate-pulse" style={{ animationDuration: '1.5s' }}></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-[#D7F1E2] to-[#b3e8cc] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,137,69,0.3)]">
                <CheckCircle2 className="w-12 h-12 text-[#008945]" strokeWidth={2.5} />
              </div>
            </div>
            
            <div className="animate-text-slide flex flex-col items-center">
              <h3 className="text-2xl font-black text-[#1C1D22] mb-3 text-center tracking-tight leading-tight">UPI ID Merged<br/>Successfully</h3>
              <p className="text-sm font-medium text-gray-500 text-center">Your payment details have been securely saved and linked to {paymentApp}.</p>
            </div>
          </div>
        </div>
      )}

      <PageBanner pageKey="connect" {...bannerConfigs.connect} />

      <div className="mb-10 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <h2 className="text-3xl font-black text-[#1C1D22] mb-2 tracking-tight">Connect Accounts</h2>
        <p className="text-gray-500 text-sm font-medium">Choose your payment app, save the UPI ID, then connect the mailbox that receives payment alerts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* Payment app & UPI ID Card */}
        <div className="bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
          
          <div className="flex items-start mb-8">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mr-4 shadow-sm border border-indigo-100/50">
              <Wallet className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-[#1C1D22] text-lg">Payment App & UPI ID</h3>
              <p className="text-xs font-medium text-gray-500">Money settles straight into this UPI ID</p>
            </div>
          </div>

          <div className="space-y-6 flex-1">
            <div className="relative z-20">
              <label className="block text-xs font-bold text-[#1C1D22] mb-2 uppercase tracking-wide">Payment app</label>
              
              {/* Premium Custom Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-[#F4F5F9] hover:bg-[#EDEEF2] border border-transparent rounded-xl px-4 py-3.5 text-sm text-[#1C1D22] font-bold flex items-center justify-between transition-all outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-white rounded-md shadow-sm border border-gray-100 flex items-center justify-center mr-3 text-[10px] text-gray-500 overflow-hidden">
                      {currentApp.icon}
                    </div>
                    {paymentApp}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white/80 backdrop-blur-xl border border-white rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] py-2 z-50 animate-fade-in ring-1 ring-black/5">
                    {apps.map(app => (
                      <button
                        key={app}
                        onClick={() => {
                          setPaymentApp(app);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-[#F4F5F9] hover:text-[#1C1D22] transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gray-50 rounded-md border border-gray-100 flex items-center justify-center mr-3 text-[10px] text-gray-400 group-hover:bg-white group-hover:shadow-sm transition-all overflow-hidden">
                            {appData[app as keyof typeof appData].icon}
                          </div>
                          {app}
                        </div>
                        {paymentApp === app && <Check className="w-4 h-4 text-indigo-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[11px] font-medium text-gray-400 mt-2 flex items-center">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2"></span>
                Business alerts from <span className="font-mono ml-1 text-gray-500">{currentApp.alertEmail}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1D22] mb-2 uppercase tracking-wide">
                {paymentApp} UPI ID <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={masterUpi}
                onChange={(e) => setMasterUpi(e.target.value)}
                placeholder={currentApp.upiPlaceholder}
                className="w-full bg-[#F4F5F9] border border-transparent rounded-xl px-4 py-3.5 text-sm text-[#1C1D22] font-bold focus:ring-2 focus:ring-indigo-500/30 focus:bg-white focus:border-indigo-100 transition-all outline-none font-mono tracking-wide"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1D22] mb-2 uppercase tracking-wide">
                Mobile Number / UPI Number <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={upiNumber}
                onChange={(e) => setUpiNumber(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full bg-[#F4F5F9] border border-transparent rounded-xl px-4 py-3.5 text-sm text-[#1C1D22] font-bold focus:ring-2 focus:ring-indigo-500/30 focus:bg-white focus:border-indigo-100 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1D22] mb-2 uppercase tracking-wide">
                Payee name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={masterPayeeName}
                onChange={(e) => setMasterPayeeName(e.target.value)}
                placeholder="Auto Upi Store"
                className="w-full bg-[#F4F5F9] border border-transparent rounded-xl px-4 py-3.5 text-sm text-[#1C1D22] font-bold focus:ring-2 focus:ring-indigo-500/30 focus:bg-white focus:border-indigo-100 transition-all outline-none"
              />
            </div>

            <div className="pt-2">
              <button 
                onClick={handleSaveDetails}
                disabled={!masterUpi || !upiNumber || !masterPayeeName || isSavingDetails}
                className={`w-full py-3.5 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center ${(!masterUpi || !upiNumber || !masterPayeeName) ? 'bg-gray-300 shadow-none cursor-not-allowed' : hasSavedDetails ? 'bg-green-500 hover:bg-green-600' : 'bg-[#6C3FE2] hover:bg-[#5a34bd]'}`}
              >
                {isSavingDetails ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : hasSavedDetails ? (
                  <><CheckCircle2 className="w-4 h-4 mr-2" /> Saved Successfully</>
                ) : (
                  "Save Details"
                )}
              </button>
            </div>
            
            {masterUpi && hasSavedDetails && (
              <div className="mt-6 p-6 bg-indigo-50/50 rounded-2xl flex flex-col items-center justify-center border border-indigo-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 blur-2xl rounded-full"></div>
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-4">Auto-Generated Secure QR</h4>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-indigo-100 mb-4">
                  <QRCodeSVG 
                    value={`upi://pay?pa=${masterUpi}&pn=${masterPayeeName || 'AutoPayX merchant'}&cu=INR`}
                    size={160}
                    level="Q"
                    includeMargin={false}
                    className="rounded-lg"
                  />
                </div>
                <p className="text-[11px] text-indigo-700/70 font-medium text-center max-w-[200px] leading-relaxed">
                  This QR is securely generated locally and cannot be hacked or tampered with.
                </p>
              </div>
            )}


          </div>

        </div>

        {/* Payment alert mailbox Card */}
        <div className="bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col relative overflow-hidden group">
          <div className="flex items-start mb-4">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mr-4 shadow-sm border border-gray-100">
              <Mail className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-bold text-[#1C1D22] text-lg">Alert Mailbox</h3>
              <p className="text-xs font-medium text-gray-500">{currentApp.mailboxText}</p>
            </div>
          </div>

          <div className="mb-8">
            {isConnected ? (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#D7F1E2] text-[#008945] uppercase tracking-wider border border-[#008945]/20">
                <div className="w-1.5 h-1.5 bg-[#008945] rounded-full mr-2 shadow-[0_0_8px_#008945]"></div> Connected
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#F4F5F9] text-gray-500 uppercase tracking-wider border border-gray-100">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div> Disconnected
              </span>
            )}
          </div>

          <div className="space-y-6 flex-1">
            <div>
              <label className="block text-xs font-bold text-[#1C1D22] mb-2 uppercase tracking-wide">Email address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isConnected || isConnecting}
                placeholder="you@gmail.com"
                className="w-full bg-[#F4F5F9] border border-transparent rounded-xl px-4 py-3.5 text-sm text-[#1C1D22] font-bold focus:ring-2 focus:ring-indigo-500/30 focus:bg-white focus:border-indigo-100 transition-all outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1D22] mb-2 uppercase tracking-wide">App password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isConnected || isConnecting}
                placeholder="•••• •••• •••• ••••"
                className="w-full bg-[#F4F5F9] border border-transparent rounded-xl px-4 py-3.5 text-sm text-[#1C1D22] font-bold focus:ring-2 focus:ring-indigo-500/30 focus:bg-white focus:border-indigo-100 transition-all outline-none font-mono tracking-widest disabled:opacity-50"
              />
              <p className="text-[11px] font-medium text-gray-400 mt-2 leading-relaxed">
                16-character app password from your mail account. <a href="#" className="text-indigo-500 hover:underline">Learn how to generate one</a>.
              </p>
            </div>
          </div>

          <div className="flex space-x-3 mt-8">
            {isConnected ? (
              <button onClick={handleDisconnect} className="flex-1 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center border border-red-100">
                <Check className="w-4 h-4 mr-2" /> Disconnect
              </button>
            ) : (
              <button 
                onClick={handleConnect}
                disabled={!email || !password || isConnecting}
                className={`flex-1 py-3.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center ${(!email || !password) ? 'bg-gray-300 text-white shadow-none cursor-not-allowed' : 'bg-[#6C3FE2] text-white hover:bg-[#5a34bd] shadow-[0_4px_12px_rgba(108,63,226,0.3)]'}`}
              >
                {isConnecting ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Connecting...</>
                ) : (
                  <><Plug className="w-5 h-5 mr-2" /> Connect mailbox</>
                )}
              </button>
            )}
            <button className="px-5 py-3.5 bg-white border-2 border-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-[#F4F5F9] hover:border-gray-200 transition-all flex items-center justify-center shadow-sm">
              <PlayCircle className="w-4 h-4 mr-2 text-gray-500" /> Watch Demo
            </button>
          </div>
        </div>

      </div>

      {/* UPI IDs & routing Card */}
      <div className="bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-[#1C1D22] text-lg">UPI IDs & Routing Engine</h3>
          <span className="px-3 py-1 bg-gray-50 border border-gray-100 text-[10px] font-bold text-gray-500 rounded-full uppercase tracking-wider">{upiList.length}/10 added</span>
        </div>

        <div className="flex items-center mb-8 bg-[#F4F5F9] p-4 rounded-xl border border-gray-100">
          <button 
            onClick={() => {
              const newValue = !autoRouting;
              setAutoRouting(newValue);
              saveRoutingToServer(upiList, newValue);
            }}
            className={`w-12 h-6 rounded-full p-1 transition-all mr-4 shadow-inner ${autoRouting ? 'bg-[#6C3FE2]' : 'bg-gray-300'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${autoRouting ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
          <div className="flex items-center text-sm font-bold text-[#1C1D22]">
            <Shuffle className={`w-4 h-4 mr-3 ${autoRouting ? 'text-indigo-500' : 'text-gray-400'}`} /> 
            Auto routing is <span className={`mx-1 ${autoRouting ? 'text-indigo-500' : 'text-gray-400'}`}>{autoRouting ? 'ON' : 'OFF'}</span> 
            <span className="text-gray-400 font-medium ml-1">— each QR uses a random UPI ID to distribute volume</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input 
            type="text" 
            value={newUpiId}
            onChange={(e) => setNewUpiId(e.target.value)}
            disabled={upiList.length >= 10}
            placeholder={`e.g. xyz@${currentApp.upiPlaceholder.split('@')[1] || 'ybl'}`}
            className="flex-1 bg-[#F4F5F9] border border-transparent rounded-xl px-4 py-3.5 text-sm text-[#1C1D22] font-bold focus:ring-2 focus:ring-indigo-500/30 focus:bg-white focus:border-indigo-100 transition-all outline-none font-mono disabled:opacity-50"
          />
          <input 
            type="text" 
            value={newPayeeName}
            onChange={(e) => setNewPayeeName(e.target.value)}
            disabled={upiList.length >= 10}
            placeholder="Payee name (optional)"
            className="flex-1 bg-[#F4F5F9] border border-transparent rounded-xl px-4 py-3.5 text-sm text-[#1C1D22] font-bold focus:ring-2 focus:ring-indigo-500/30 focus:bg-white focus:border-indigo-100 transition-all outline-none disabled:opacity-50"
          />
          <button 
            onClick={handleAddUpi}
            disabled={!newUpiId || upiList.length >= 10}
            className={`md:w-32 py-3.5 text-white text-sm font-bold rounded-xl transition-all shadow-sm ${(!newUpiId || upiList.length >= 10) ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#6C3FE2] hover:bg-[#5a34bd]'}`}
          >
            Add UPI
          </button>
        </div>

        {upiList.length > 0 ? (
          <div className="mt-6 space-y-3">
            {upiList.map((upi, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                <div>
                  <p className="text-sm font-bold font-mono text-gray-800">{upi.id}</p>
                  {upi.name && <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{upi.name}</p>}
                </div>
                <button 
                  onClick={() => handleRemoveUpi(idx)}
                  className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] font-medium text-gray-400 flex items-center mt-6">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span>
            No extra UPI IDs added yet. Your master {paymentApp} UPI ID is being used for all transactions.
          </p>
        )}
      </div>

      {/* Connection Status Section */}
      <div className="mt-6 bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-[#1C1D22] text-lg">Connection status</h3>
          <span className="text-[10px] font-bold text-gray-400">Updates live</span>
        </div>

        <div className="space-y-3">
          {apps.map(app => {
            const appSetting = allSettings.find((s: any) => s.app_name === app);
            const isAppConnected = appSetting?.is_connected || false;
            const appMasterUpi = appSetting?.master_upi_id || '';
            
            return (
              <div key={app} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                <div className="flex items-center space-x-3 w-1/3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isAppConnected ? 'border-green-500' : 'border-[#bdf32b]'}`}>
                    {isAppConnected && <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>}
                    {!isAppConnected && <div className="w-1.5 h-1.5 bg-[#bdf32b] rounded-full"></div>}
                  </div>
                  <span className="text-sm font-bold text-[#1C1D22]">{app}</span>
                </div>
                
                <div className="w-1/3 text-center md:text-left">
                  <span className="text-xs font-medium text-gray-500">{isAppConnected && appMasterUpi ? appMasterUpi : 'No UPI ID saved'}</span>
                </div>

                <div className="w-1/3 flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500 hidden md:block">{isAppConnected ? 'Connected' : 'Disconnected'}</span>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isAppConnected ? 'bg-[#D7F1E2] text-[#008945]' : 'bg-gray-100 text-gray-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full mr-2 ${isAppConnected ? 'bg-[#008945] shadow-[0_0_8px_#008945]' : 'bg-gray-400'}`}></div> 
                    {isAppConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
