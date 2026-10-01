'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Palette, Upload, CheckCircle2, Image as ImageIcon, Sparkles, MonitorSmartphone, X, QrCode, Loader2, ShieldCheck, Tag } from 'lucide-react';
import PageBanner, { bannerConfigs } from '@/components/PageBanner';

export default function CheckoutThemePage() {
  const [activeTheme, setActiveTheme] = useState('winter_wonder');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('payment'); // 'payment', 'processing', 'success'

  // Dynamic Theme Settings State
  const [brandName, setBrandName] = useState('AutoPayX');
  const [brandColor, setBrandColor] = useState('#244531');
  const [brandLogo, setBrandLogo] = useState('A');
  const [logoType, setLogoType] = useState('text');
  const [bgImage, setBgImage] = useState('festive_pattern_bg.jpg');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/checkout`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setBrandName(data.data.business_name || 'AutoPayX');
          setBrandColor(data.data.brand_color || '#244531');
          setBrandLogo(data.data.brand_logo || 'A');
          setLogoType(data.data.logo_type || 'text');
          setBgImage(data.data.background_image || 'festive_pattern_bg.jpg');
          setActiveTheme(data.data.theme_id || 'winter_wonder');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/checkout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          business_name: brandName,
          brand_color: brandColor,
          brand_logo: brandLogo,
          logo_type: logoType,
          background_image: bgImage,
          theme_id: activeTheme
        })
      });
      showToast('Theme Settings Saved!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const themes = [
    { id: 'winter_wonder', name: 'Winter Wonder', desc: 'Dark sleek sidebar with a festive green success screen and snow.', premium: true },
  ];

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = 'hidden';
      setCheckoutStep('payment');
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isPreviewOpen]);

  const handleDemoPay = () => {
    setCheckoutStep('processing');
    setTimeout(() => {
      setCheckoutStep('success');
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 mt-8 animate-fade-in relative">
      <PageBanner pageKey="checkout" {...bannerConfigs.checkout} />
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[200] animate-fade-in flex items-center bg-[#1C1D22] text-white px-5 py-3.5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
          <CheckCircle2 className="w-5 h-5 text-green-400 mr-3" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">Checkout Themes</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Customize your payment pages with ultra-premium, high-converting layouts.</p>
        </div>
        <button 
          onClick={() => setIsPreviewOpen(true)}
          className="flex items-center px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg"
        >
          <MonitorSmartphone className="w-5 h-5 mr-2" />
          Interactive Demo
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left Col: Comprehensive Theme Builder */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 dark:border-gray-800">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6 flex items-center">
              <Palette className="w-5 h-5 mr-2 text-[#6C3FE2]" />
              Theme Settings
            </h3>
            
            {/* Business Info */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Business Display Name</label>
              <input 
                type="text" 
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6C3FE2]/50 text-gray-900 dark:text-white transition-all"
              />
            </div>

            {/* Brand Colors */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Primary Brand Color</label>
              <div className="flex items-center space-x-3 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
                <input 
                  type="color" 
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-8 h-8 rounded-full border-0 cursor-pointer p-0 bg-transparent"
                />
                <input 
                  type="text" 
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="flex-1 bg-transparent border-0 text-sm font-medium text-gray-900 dark:text-white focus:outline-none uppercase"
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Brand Logo</label>
                <div className="flex bg-gray-100 dark:bg-[#2A2A2A] rounded-lg p-0.5">
                  <button 
                    onClick={() => setLogoType('text')}
                    className={`px-3 py-1 text-xs font-bold rounded-md ${logoType === 'text' ? 'bg-white dark:bg-black shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}
                  >Text</button>
                  <button 
                    onClick={() => setLogoType('image')}
                    className={`px-3 py-1 text-xs font-bold rounded-md ${logoType === 'image' ? 'bg-white dark:bg-black shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}
                  >Image</button>
                </div>
              </div>
              
              {logoType === 'text' ? (
                <div className="border-2 border-dashed border-[#6C3FE2]/30 bg-[#6C3FE2]/5 dark:bg-[#6C3FE2]/10 rounded-2xl p-4 flex items-center cursor-pointer hover:bg-[#6C3FE2]/10 transition-colors">
                  <div className="w-12 h-12 bg-white dark:bg-[#2A2A2A] rounded-xl flex items-center justify-center mr-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <input 
                      type="text" 
                      maxLength={2} 
                      value={brandLogo} 
                      onChange={(e) => setBrandLogo(e.target.value)} 
                      className="w-full text-center bg-transparent border-none font-extrabold text-xl focus:outline-none" 
                      style={{ color: brandColor }} 
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Type 1-2 letters</p>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">Will be used as your brand logo</p>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-[#222] transition-colors relative overflow-hidden">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) setBrandLogo(ev.target.result.toString());
                      };
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }} />
                  {brandLogo && brandLogo.length > 5 ? (
                    <img src={brandLogo} alt="Logo" className="max-h-16 mb-2 rounded-md object-contain" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                  )}
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Click to upload logo</p>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                </div>
              )}
            </div>

            {/* Background Image Upload */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Custom Background</label>
              <div className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#222] rounded-2xl p-2 pl-3 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-colors">
                <div className="flex items-center truncate mr-2">
                  <ImageIcon className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">festive_pattern_bg.jpg</span>
                </div>
                <button className="bg-white dark:bg-[#333] border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-200 shadow-sm shrink-0">
                  Change
                </button>
              </div>
            </div>
            
            <button onClick={handleSave} disabled={saving} className="w-full mt-2 py-4 bg-[#6C3FE2] text-white text-sm font-bold rounded-2xl hover:bg-[#5b32c6] transition-colors shadow-lg shadow-[#6C3FE2]/20 flex items-center justify-center">
              {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Save & Apply Changes
            </button>
          </div>
        </div>

        {/* Right Col: Theme Selector */}
        <div className="xl:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {themes.map((theme) => (
              <div 
                key={theme.id}
                onClick={() => setActiveTheme(theme.id)}
                className={`border-2 rounded-3xl p-5 cursor-pointer transition-all transform hover:-translate-y-1 ${
                  activeTheme === theme.id 
                    ? 'border-[#6C3FE2] bg-[#6C3FE2]/5 ring-4 ring-[#6C3FE2]/10 shadow-xl' 
                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1A1A] hover:border-[#6C3FE2]/30'
                }`}
              >
                {/* Advanced Mini Checkout Previews */}
                <div className="w-full aspect-video rounded-2xl mb-5 relative overflow-hidden shadow-inner border border-gray-200/50 dark:border-gray-800/50 bg-gray-100 flex">
                  
                  {/* --- FESTIVE GOLD THEME --- */}
                  {theme.id === 'festive_gold' && (
                    <div className="w-full h-full flex bg-[#F6F8FA]">
                      <div className="w-5/12 h-full bg-gradient-to-br from-[#FFB703] to-[#FB8500] p-3 flex flex-col relative overflow-hidden">
                        <div className="w-16 h-4 bg-black/20 rounded mb-4"></div>
                        <div className="w-full bg-white/90 rounded-lg p-2 mb-2 shadow-sm">
                          <div className="w-12 h-2 bg-gray-300 rounded mb-2"></div>
                          <div className="w-10 h-4 bg-gray-900 rounded"></div>
                        </div>
                        <div className="w-full h-6 bg-white/90 rounded-lg mb-2"></div>
                        <div className="w-full h-6 bg-green-50 rounded-lg border border-green-100"></div>
                        <div className="absolute -bottom-2 -left-2 w-20 h-20 bg-black/10 rounded-full blur-xl"></div>
                        <div className="absolute bottom-2 left-4 w-10 h-14 bg-white/80 rounded shadow-md transform -rotate-6"></div>
                        <div className="absolute bottom-1 left-10 w-12 h-10 bg-red-500 rounded shadow-lg flex items-center justify-center">
                          <div className="w-2 h-full bg-yellow-400"></div>
                        </div>
                      </div>
                      <div className="w-7/12 h-full bg-white p-3 flex flex-col relative">
                        <div className="w-24 h-3 bg-gray-200 rounded mb-4"></div>
                        <div className="flex-1 overflow-hidden">
                          <div className="w-full h-6 bg-yellow-50 rounded-md mb-3 border border-yellow-100"></div>
                          <div className="flex justify-between items-center mb-3">
                            <div>
                              <div className="w-16 h-3 bg-gray-800 rounded mb-1"></div>
                              <div className="w-12 h-2 bg-green-100 rounded"></div>
                            </div>
                            <div className="flex space-x-1">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            </div>
                          </div>
                          <div className="w-full h-px bg-gray-100 mb-3"></div>
                          <div className="w-16 h-3 bg-gray-800 rounded mb-3"></div>
                          <div className="w-20 h-3 bg-gray-800 rounded"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- WINTER WONDER THEME --- */}
                  {theme.id === 'winter_wonder' && (
                    <div className="w-full h-full flex bg-[#F6F8FA]">
                      <div className="w-4/12 h-full bg-[#204933] p-3 flex flex-col relative overflow-hidden text-white">
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 bg-white/20 rounded mr-2"></div>
                          <div className="w-16 h-2 bg-white rounded"></div>
                        </div>
                        <div className="w-20 h-2 bg-green-400 rounded mb-4"></div>
                        
                        <div className="w-full bg-white text-gray-900 rounded-lg p-2 mb-2 shadow-sm">
                          <div className="w-12 h-2 bg-gray-400 rounded mb-1"></div>
                          <div className="w-8 h-3 bg-gray-900 rounded"></div>
                        </div>
                        <div className="w-full h-5 bg-white/90 rounded-lg mb-2"></div>
                        <div className="w-full h-5 bg-green-100 rounded-lg"></div>
                        
                        {/* Snow flakes */}
                        <div className="absolute top-4 left-4 w-1 h-1 bg-white rounded-full opacity-50"></div>
                        <div className="absolute top-10 right-4 w-1 h-1 bg-white rounded-full opacity-40"></div>
                        <div className="absolute bottom-12 left-2 w-1.5 h-1.5 bg-white rounded-full opacity-60"></div>
                        
                        {/* Gifts Mock */}
                        <div className="absolute bottom-2 left-2 flex space-x-1 items-end opacity-90">
                          <div className="w-6 h-10 bg-green-100 rounded-sm"></div>
                          <div className="w-8 h-8 bg-red-500 rounded-sm"></div>
                        </div>
                      </div>
                      
                      <div className="w-8/12 h-full bg-white p-3 flex flex-col">
                        <div className="w-24 h-2 bg-gray-300 rounded mb-4"></div>
                        
                        <div className="flex-1 flex gap-2">
                          <div className="w-1/3 bg-gray-50 rounded-lg p-2 flex flex-col gap-2">
                            <div className="w-full h-6 bg-green-50 border border-green-100 rounded"></div>
                            <div className="w-full h-4 bg-white rounded"></div>
                            <div className="w-full h-4 bg-white rounded"></div>
                          </div>
                          
                          <div className="w-2/3 flex flex-col">
                            <div className="w-full h-6 bg-gray-100 rounded-md mb-2"></div>
                            <div className="w-full h-px bg-gray-100 mb-2"></div>
                            <div className="flex-1 bg-gray-50 rounded-lg flex items-center justify-center p-2">
                              <div className="w-16 h-16 bg-white border border-gray-200 rounded"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- AUTOPAYX PRO THEME --- */}
                  {theme.id === 'autopayx_pro' && (
                    <div className="w-full h-full flex bg-gradient-to-br from-[#0F0C29] via-[#302B63] to-[#24243E] relative">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                      <div className="w-full h-full p-4 flex items-center justify-center">
                        <div className="w-10/12 h-5/6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex flex-col p-3">
                           <div className="flex justify-between items-center mb-4">
                             <div className="w-16 h-4 bg-white/80 rounded"></div>
                             <div className="w-12 h-4 bg-fuchsia-400/80 rounded"></div>
                           </div>
                           <div className="w-full flex-1 bg-black/20 rounded-xl mb-3 p-2">
                             <div className="w-full h-1/2 flex items-center justify-center">
                                <div className="w-16 h-16 bg-white/10 rounded-xl border border-white/10 flex items-center justify-center">
                                  <div className="w-10 h-10 bg-white/20 rounded-md"></div>
                                </div>
                             </div>
                           </div>
                           <div className="w-full h-6 bg-[#6C3FE2] rounded-lg"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className={`font-extrabold text-lg flex items-center ${activeTheme === theme.id ? 'text-[#6C3FE2]' : 'text-gray-900 dark:text-white'}`}>
                      {theme.name}
                      {theme.premium && <Sparkles className="w-3.5 h-3.5 ml-1.5 text-amber-500 fill-amber-500" />}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{theme.desc}</p>
                  </div>
                  {activeTheme === theme.id && (
                    <div className="bg-[#6C3FE2] rounded-full p-1 shadow-md animate-scale-in shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- LIVE PREVIEW MODAL --- */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-5xl h-[80vh] flex flex-col bg-white dark:bg-[#1A1A1A] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 animate-slide-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#111]">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="ml-4 font-mono text-sm text-gray-500 dark:text-gray-400">Interactive Demo: {themes.find(t => t.id === activeTheme)?.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                {checkoutStep === 'success' && (
                  <button onClick={() => setCheckoutStep('payment')} className="text-sm font-bold text-[#6C3FE2] hover:underline">
                    Restart Demo
                  </button>
                )}
                <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content - High Fidelity Mockup */}
            <div className="flex-1 bg-gray-100/50 dark:bg-[#0D0D0E] p-8 flex items-start justify-center overflow-y-auto custom-scrollbar">
              
              {/* BIG WINTER WONDER MOCKUP (RAZORPAY EXACT CLONE) */}
              {activeTheme === 'winter_wonder' && (
                <div className="w-full max-w-5xl bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex overflow-hidden min-h-[550px] border border-gray-200">
                  
                  {/* Left Sidebar - Dynamic Brand Color */}
                  <div className="w-[38%] p-8 flex flex-col justify-between text-white relative overflow-hidden transition-colors duration-500" style={{ backgroundColor: brandColor }}>
                    <div className="relative z-10 space-y-4">
                      {/* Logo and Trusted Badge */}
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-black/20 rounded flex items-center justify-center mr-3 border border-white/10 shadow-inner overflow-hidden">
                          {logoType === 'text' || brandLogo.length <= 5 ? (
                            <span className="font-bold text-xl">{brandLogo || 'A'}</span>
                          ) : (
                            <img src={brandLogo} alt="Logo" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-lg block leading-tight">{brandName || 'AutoPayX'}</span>
                          <span className="text-[10px] font-bold bg-black/20 text-white/90 px-1.5 py-0.5 rounded flex items-center mt-1 border border-white/10">
                            <ShieldCheck className="w-3 h-3 mr-1" /> {brandName || 'AutoPayX'} Trusted Business
                          </span>
                        </div>
                      </div>

                      {/* Price Summary */}
                      <div className="bg-white rounded-xl p-5 shadow-sm text-gray-900">
                        <p className="text-gray-500 font-medium text-xs mb-1">Price Summary</p>
                        <h2 className="text-[28px] font-extrabold tracking-tight">₹1</h2>
                      </div>
                      
                      {/* Phone Number */}
                      <div className="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between text-[13px] text-gray-700 cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center font-medium">
                          <div className="w-5 h-5 rounded bg-gray-100 border border-gray-200 flex items-center justify-center mr-3">
                            <div className="w-2.5 h-2.5 bg-gray-400 rounded-full"></div>
                          </div>
                          Using as +91 99999 99999
                        </div>
                        <span className="text-gray-400">›</span>
                      </div>

                      {/* Offers */}
                      <div className="bg-[#D7F1E2] rounded-xl p-3 shadow-sm flex items-center justify-between text-[13px] text-[#008945] font-bold cursor-pointer">
                        <span className="flex items-center">
                          <Tag className="w-4 h-4 mr-2" />
                          Offers on UPI
                        </span>
                        <span>›</span>
                      </div>
                    </div>

                    {/* Snow Flakes Background Elements */}
                    <div className="absolute top-12 right-12 w-2 h-2 bg-white/30 rounded-full"></div>
                    <div className="absolute top-32 left-8 w-3 h-3 bg-white/20 rounded-full blur-[1px]"></div>
                    <div className="absolute top-[45%] right-8 w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                    <div className="absolute bottom-48 left-12 w-2.5 h-2.5 bg-white/30 rounded-full blur-[1px]"></div>
                    <div className="absolute bottom-32 right-16 w-2 h-2 bg-white/20 rounded-full"></div>

                    {/* Perspective Floor */}
                    <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#162D1F] to-transparent opacity-80"></div>

                    {/* Premium Gift Bags Illustration (Moved to Right Side) */}
                    <div className="absolute bottom-16 right-6 flex items-end transform scale-[1.15] origin-bottom-right">
                      {/* Realistic Shadow Base */}
                      <div className="absolute -bottom-3 -left-2 w-48 h-8 bg-black/60 blur-[12px] rounded-[100%] transform -skew-x-12 z-0"></div>
                      
                      {/* Elegant Tall Green Bag */}
                      <div className="relative z-10 w-16 h-[95px] bg-gradient-to-br from-[#193B26] to-[#0F2417] border-l-[14px] border-[#224E33] rounded-t-sm rounded-b-xl transform -rotate-2 flex flex-col justify-end pb-3 items-center shadow-2xl">
                        {/* Premium Gold Handle */}
                        <div className="absolute -top-7 left-2 w-8 h-9 border-[3px] border-[#D4AF37] rounded-t-xl border-b-0 shadow-sm opacity-90"></div>
                        {/* Gold Foil Logo Mock */}
                        <div className="w-5 h-7 bg-gradient-to-b from-[#D4AF37] to-[#AA8822] rounded shadow-inner flex items-end justify-center pb-1"><div className="w-1.5 h-1.5 bg-[#0F2417] rounded-full"></div></div>
                      </div>
                      
                      {/* Premium Frost White Bag */}
                      <div className="relative z-20 w-[60px] h-[75px] bg-gradient-to-br from-white to-gray-200 border-l-[12px] border-gray-100 rounded-t-sm rounded-b-xl -ml-5 transform rotate-2 flex flex-col justify-end pb-2 items-center shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
                        {/* Silver Handle */}
                        <div className="absolute -top-6 left-1.5 w-7 h-8 border-[3px] border-gray-300 rounded-t-xl border-b-0 shadow-sm opacity-90"></div>
                        {/* Silver Logo Mock */}
                        <div className="w-4 h-5 bg-gradient-to-b from-gray-300 to-gray-400 rounded-sm shadow-inner"></div>
                      </div>

                      {/* Luxurious Red Gift Box with Gold Ribbon */}
                      <div className="relative z-30 w-[70px] h-14 bg-gradient-to-br from-[#E53935] to-[#B71C1C] rounded-md -ml-6 mb-1 shadow-[0_15px_30px_rgba(229,57,53,0.5)] border-t-4 border-[#FFCDD2] transform -rotate-2">
                        {/* Gold Ribbon Vertical */}
                        <div className="absolute inset-y-0 left-7 w-3.5 bg-gradient-to-b from-[#F2C94C] to-[#F2994A] shadow-sm"></div>
                        {/* Gold Ribbon Horizontal */}
                        <div className="absolute top-0 inset-x-0 h-3.5 bg-gradient-to-r from-[#F2C94C] to-[#F2994A] shadow-sm"></div>
                        
                        {/* Premium Candy Cane */}
                        <div className="absolute -top-12 left-1.5 w-4.5 h-[65px] bg-gradient-to-b from-white to-gray-100 rounded-t-full border border-gray-200 shadow-xl overflow-hidden transform rotate-12 z-0">
                          <div className="w-full h-2.5 bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] mt-2 transform -skew-y-12 shadow-sm"></div>
                          <div className="w-full h-2.5 bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] mt-3 transform -skew-y-12 shadow-sm"></div>
                          <div className="w-full h-2.5 bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] mt-3 transform -skew-y-12 shadow-sm"></div>
                        </div>
                        
                        {/* Elegant Gold Bow */}
                        <div className="absolute -top-5 left-3 w-5 h-7 border-[3px] border-[#F2C94C] rounded-full border-r-0 rounded-r-none transform rotate-[25deg] shadow-sm"></div>
                        <div className="absolute -top-5 left-8 w-5 h-7 border-[3px] border-[#F2C94C] rounded-full border-l-0 rounded-l-none transform -rotate-[25deg] shadow-sm"></div>
                      </div>
                      
                      {/* Glowing Magic Sparkles */}
                      <div className="absolute -top-8 left-6 w-1.5 h-1.5 bg-yellow-300 rounded-full blur-[1px] animate-pulse"></div>
                      <div className="absolute top-6 -right-3 w-1 h-1 bg-white rounded-full blur-[1px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                      <div className="absolute -top-2 right-8 w-2 h-2 bg-yellow-200 rounded-full blur-[2px] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                    
                    <div className="relative z-10 flex items-center justify-between w-full mix-blend-screen">
                      <div className="flex items-center justify-center gap-2 transition-opacity hover:opacity-100 opacity-90">
                        <span className="text-[12px] font-medium text-white/80">Secured by</span>
                        <img 
                          src="/autopayx.png" 
                          alt="AutoPayX" 
                          className="h-12 object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Content - White Checkout Area */}
                  <div className="w-[62%] bg-white flex flex-col relative text-gray-900 font-sans">
                    
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center text-[13px]">
                      <h3 className="font-bold text-gray-800">Payment Options</h3>
                      <div className="flex space-x-4 text-gray-400">
                        <span className="cursor-pointer font-bold tracking-widest leading-none">...</span>
                        <X className="w-4 h-4 cursor-pointer" />
                      </div>
                    </div>

                    <div className="flex-1 flex bg-white">
                      {/* Tabs */}
                      <div className="w-[35%] bg-gray-50/80 pt-6 pb-6 pr-6 pl-0 border-r border-gray-100 space-y-1 relative">
                        <p className="text-[11px] font-bold text-gray-500 mb-4 pl-6">Recommended</p>
                        
                        <div className="bg-[#E5F5EB] py-3 pr-3 pl-5 rounded-r-xl cursor-pointer flex flex-col relative group">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00A859] rounded-r-sm"></div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-gray-900 text-sm">UPI</span>
                            <div className="flex opacity-80 h-4">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-full object-contain" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="w-[65%] p-6 bg-white">
                        {checkoutStep === 'payment' && (
                          <div className="animate-fade-in h-full flex flex-col">

                            <div className="flex justify-between items-center mb-4">
                              <p className="font-bold text-gray-800 text-sm">UPI QR</p>
                              <span className="text-[11px] font-medium text-gray-500 flex items-center">
                                <span className="mr-1">⏱</span> 11:46
                              </span>
                            </div>

                            <div className="bg-[#F8F9FA] rounded-3xl p-8 flex flex-col items-center text-center border border-gray-100/50 relative overflow-hidden">
                              <div className="w-[180px] h-[180px] shrink-0 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center p-3 mb-8 relative z-10">
                                <QRCodeSVG 
                                  value={`upi://pay?pa=demo@ybl&pn=${encodeURIComponent(brandName || 'AutoPayX')}&am=1`}
                                  size={160}
                                  style={{ width: "100%", height: "100%" }}
                                  fgColor="#1B2733"
                                  bgColor="transparent"
                                  level="L"
                                />
                              </div>
                              <div className="flex flex-col items-center relative z-10 w-full">
                                <div className="flex items-center justify-center space-x-4 w-full mb-6 relative">
                                  <div className="h-[1px] bg-gray-200 flex-1"></div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">Scan with any app</p>
                                  <div className="h-[1px] bg-gray-200 flex-1"></div>
                                </div>
                                <div className="flex space-x-4 mb-6 items-center justify-center">
                                  {/* GPay */}
                                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100 p-1.5 overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/gpay-logo.png" alt="GPay" className="w-[90%] h-[90%] object-contain" />
                                  </div>
                                  {/* PhonePe */}
                                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
                                    <img src="/phonepe-logo.png" alt="PhonePe" className="w-[70%] h-[70%] object-contain" />
                                  </div>
                                  {/* Paytm */}
                                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="w-[70%] h-[70%] object-contain" />
                                  </div>
                                  {/* BHIM */}
                                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100">
                                    <span className="text-[14px] font-black text-[#F26522] tracking-tighter mt-0.5">BHI<span className="text-[#008945]">M</span></span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-center gap-1.5 mt-2">
                                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">100% Secure Payment Gateway</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {checkoutStep === 'processing' && (
                          <div className="h-full flex flex-col items-center justify-center animate-fade-in text-gray-900">
                            <style>{`
                              @keyframes spin-coin {
                                0% { transform: rotateY(0deg); }
                                100% { transform: rotateY(360deg); }
                              }
                              @keyframes float-coin {
                                0%, 100% { transform: translateY(0px); }
                                50% { transform: translateY(-15px); }
                              }
                              @keyframes pulse-shadow {
                                0%, 100% { transform: scale(1) translateX(-50%); opacity: 0.2; }
                                50% { transform: scale(1.3) translateX(-38%); opacity: 0.1; }
                              }
                            `}</style>
                            
                            <div className="relative mb-6" style={{ perspective: '800px' }}>
                              {/* Floating container */}
                              <div style={{ animation: 'float-coin 3s ease-in-out infinite' }}>
                                {/* Spinning container */}
                                <div 
                                  className="relative w-16 h-16"
                                  style={{ 
                                    transformStyle: 'preserve-3d',
                                    animation: 'spin-coin 2.5s linear infinite'
                                  }}
                                >
                                  {/* Front Face */}
                                  <div 
                                    className="absolute inset-0 rounded-full flex items-center justify-center border-[4px] border-[#F2C94C] shadow-[inset_0_0_15px_rgba(242,201,76,0.8)] bg-gradient-to-br from-[#F2C94C] to-[#F2994A]"
                                    style={{ 
                                      backfaceVisibility: 'hidden',
                                      transform: 'translateZ(4px)'
                                    }}
                                  >
                                    <span className="text-2xl font-extrabold text-[#B87C21]" style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.5)' }}>₹</span>
                                  </div>
                                  
                                  {/* Edge / Center thickness */}
                                  <div 
                                    className="absolute inset-0 rounded-full bg-[#D48C21]"
                                    style={{ 
                                      transform: 'translateZ(0px)',
                                      boxShadow: '0 0 10px rgba(0,0,0,0.3)'
                                    }}
                                  ></div>

                                  {/* Back Face */}
                                  <div 
                                    className="absolute inset-0 rounded-full flex items-center justify-center border-[4px] border-[#F2C94C] shadow-[inset_0_0_15px_rgba(242,201,76,0.8)] bg-gradient-to-br from-[#F2C94C] to-[#F2994A]"
                                    style={{ 
                                      backfaceVisibility: 'hidden',
                                      transform: 'rotateY(180deg) translateZ(4px)'
                                    }}
                                  >
                                    <span className="text-2xl font-extrabold text-[#B87C21]" style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.5)' }}>₹</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Floor Shadow */}
                              <div 
                                className="absolute -bottom-4 left-1/2 w-12 h-2 bg-black rounded-full blur-[4px]"
                                style={{ animation: 'pulse-shadow 3s ease-in-out infinite' }}
                              ></div>
                            </div>
                            
                            <h3 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-500 to-gray-900 animate-pulse mt-4">
                              Processing Payment...
                            </h3>
                            <p className="text-[13px] text-gray-500 mt-2 font-medium">Please do not close this window</p>
                          </div>
                        )}

                        {checkoutStep === 'success' && (
                          <div className="h-full flex flex-col items-center justify-center animate-fade-in text-gray-900 relative">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border-4 border-green-100">
                              <CheckCircle2 className="w-12 h-12 text-[#00A859]" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2 text-center">Payment Successful!</h2>
                            <p className="text-gray-500 font-medium text-sm text-center mb-8">You will be redirected automatically.</p>
                            
                            <div className="w-full bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-bold text-gray-700">Amount Paid</span>
                                <span className="font-extrabold text-lg text-gray-900">₹1</span>
                              </div>
                              <div className="w-full h-px bg-gray-200 mb-3"></div>
                              <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
                                <span>Ref: pay_WinterWon123</span>
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Success</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BIG AUTOPAYX PRO MOCKUP */}
              {activeTheme === 'autopayx_pro' && (
                <div className="w-full max-w-4xl h-[550px] bg-gradient-to-br from-[#0F0C29] via-[#302B63] to-[#24243E] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div className="w-full max-w-2xl bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 p-8 shadow-2xl relative z-10">
                    
                    {checkoutStep === 'payment' && (
                      <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/10">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4"><span className="font-bold text-2xl text-white">A</span></div>
                            <span className="font-bold text-2xl text-white">Acme Electronics</span>
                          </div>
                          <div className="text-right">
                            <p className="text-white/60 text-sm">Amount to pay</p>
                            <p className="text-2xl font-bold text-white">₹ 14,999</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 mb-8">
                          <div className="bg-white/10 border border-[#6C3FE2] rounded-2xl p-6 flex flex-col items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-all shadow-[0_0_15px_rgba(108,63,226,0.3)]">
                            <QrCode className="w-8 h-8 mb-3 text-purple-300" />
                            <span className="font-bold">Pay with UPI</span>
                          </div>
                          <div className="bg-black/20 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-white/70 cursor-pointer hover:bg-white/10 transition-colors">
                            <MonitorSmartphone className="w-8 h-8 mb-3" />
                            <span className="font-bold">Cards & Netbanking</span>
                          </div>
                        </div>

                        <button onClick={handleDemoPay} className="w-full py-4 bg-[#6C3FE2] hover:bg-[#7e56eb] text-white font-bold rounded-xl text-lg shadow-[0_0_20px_rgba(108,63,226,0.4)] transition-all">
                          Proceed to Pay
                        </button>
                      </div>
                    )}

                    {checkoutStep === 'processing' && (
                      <div className="h-[300px] flex flex-col items-center justify-center text-white animate-fade-in">
                        <Loader2 className="w-16 h-16 text-[#6C3FE2] animate-spin mb-6" />
                        <h2 className="text-2xl font-bold mb-2">Processing Transaction</h2>
                        <p className="text-white/60">Contacting bank...</p>
                      </div>
                    )}

                    {checkoutStep === 'success' && (
                      <div className="h-[300px] flex flex-col items-center justify-center text-white animate-fade-in">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/50">
                          <CheckCircle2 className="w-10 h-10 text-green-400 animate-scale-in" />
                        </div>
                        <h2 className="text-3xl font-extrabold mb-2">Payment Successful!</h2>
                        <p className="text-white/60 mb-6 font-medium">Receipt has been sent to your registered email.</p>
                      </div>
                    )}

                  </div>
                  
                  {/* Secured by footer for AutoPayX Pro */}
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10 mix-blend-screen">
                    <div className="flex items-center justify-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
                      <span className="text-[12px] font-medium text-white/80">Secured by</span>
                      <img 
                        src="/autopayx.png" 
                        alt="AutoPayX" 
                        className="h-12 object-contain"
                      />
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
