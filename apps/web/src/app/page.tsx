'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowRight, Shield, Zap, Terminal, Link as LinkIcon, RefreshCw, Palette, Webhook, BarChart, Mail, Gift, Lock, CheckCircle2, CreditCard, ChevronRight, FileCheck, Code2, Cpu, Globe2, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/dashboard/plans`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setPlans(data.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingPlans(false));
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-[#6C3FE2]/30 font-sans selection:text-[#6C3FE2]">

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#6C3FE2]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center group hover:opacity-90 transition-opacity">
            <div className="bg-white rounded-xl p-1.5 mr-3 shadow-md flex items-center justify-center">
              <img src="/autopayx-icon.png" alt="AutoPayX Icon" className="h-8 w-8 object-contain" />
            </div>
            <img src="/autopayx-logo.png" alt="AutoPayX" className="h-20 object-contain mt-0.5 brightness-0 invert" />
          </Link>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-white/80">
            <a href="#product" className="hover:text-white transition-colors">Product</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Workflow</a>
            <a href="#developers" className="hover:text-white transition-colors">Developers</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="/docs" className="hover:text-white transition-colors">API Docs</a>
          </div>

          <div className="flex items-center space-x-5">
            <Link href="/login" className="text-sm font-medium text-white/90 hover:text-white transition-colors hidden md:block">Sign in</Link>
            <Link href="/register" className="px-5 py-2.5 bg-white text-[#6C3FE2] text-sm font-bold rounded-xl hover:bg-gray-100 transition-all shadow-[0_5px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
              Create account
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-48 px-6 relative bg-[#0D0518] min-h-[95vh] flex items-center border-b border-[#6C3FE2]/20 overflow-hidden">
        {/* Dark Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        {/* Subtle Purple Glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#6C3FE2]/20 rounded-full blur-[140px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Content */}
          <div className="text-left pt-10 lg:pt-0">
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-[#6C3FE2]/30 bg-[#6C3FE2]/10 text-xs font-bold text-[#D0BFFF] mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#00F0FF] mr-2 animate-pulse shadow-[0_0_10px_rgba(0,240,255,0.6)]"></span>
              AutoPayX V1 is now live
            </div>

            <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1] text-white">
              Payments that move at the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A880FF] to-[#6C3FE2]">speed of your business.</span>
            </h1>

            <p className="text-lg text-purple-100/70 mb-10 max-w-lg font-medium leading-relaxed">
              Create secure UPI checkout links, connect merchant accounts, verify transactions and automate payment updates—all from one focused platform.
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-purple-200/80 mb-10">
              <div className="flex items-center"><ShieldCheck className="w-4 h-4 text-[#00F0FF] mr-2" /> Secure checkout</div>
              <div className="flex items-center"><Webhook className="w-4 h-4 text-[#00F0FF] mr-2" /> Real-time webhooks</div>
              <div className="flex items-center"><Code2 className="w-4 h-4 text-[#00F0FF] mr-2" /> Developer-ready API</div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#6C3FE2] to-[#5028c6] text-white text-base font-bold rounded-xl hover:scale-105 transition-all flex items-center justify-center shadow-[0_10px_30px_rgba(108,63,226,0.4)]">
                Start accepting payments <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white text-base font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center backdrop-blur-sm">
                View payment demo
              </a>
            </div>
          </div>

          {/* Right Content - Visual Mockup */}
          <div className="relative hidden lg:block perspective-1000 w-full h-[500px] flex items-center justify-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-[#6C3FE2]/20 to-[#00F0FF]/10 rounded-full blur-[100px] opacity-70 -z-10"></div>
            
            {/* Main Dashboard Mockup */}
            <div className="absolute top-10 right-0 w-full max-w-[500px] bg-white rounded-[24px] shadow-[0_40px_80px_rgba(0,0,0,0.4)] border border-gray-200 overflow-visible transform rotate-y-[-10deg] rotate-x-[5deg] transition-transform hover:rotate-0 duration-700 p-6 z-10">
              
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-[10px] shadow-sm border border-gray-100 flex items-center justify-center p-1.5">
                    <img src="/autopayx-icon.png" alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-black text-xl text-gray-900 tracking-tight">AutoPayX</span>
                </div>
                <div className="px-3 py-1 bg-[#6C3FE2]/10 text-[#6C3FE2] text-[10px] font-bold rounded-full flex items-center border border-[#6C3FE2]/20">
                  <span className="w-1.5 h-1.5 bg-[#6C3FE2] rounded-full mr-1.5 animate-pulse"></span> LIVE
                </div>
              </div>

              {/* Body */}
              <div className="flex gap-4 h-[220px]">
                {/* Chart Section */}
                <div className="flex-1 bg-gray-50/50 rounded-2xl border border-gray-100 p-5 flex flex-col relative overflow-hidden">
                  <h4 className="text-[10px] font-black text-gray-400 tracking-widest mb-auto relative z-10">REVENUE OVERVIEW</h4>
                  
                  <div className="flex items-end gap-3 h-32 mt-4 relative z-10 w-full justify-between">
                    <div className="w-full bg-[#6C3FE2] rounded-t-md h-[10%] hover:opacity-80 transition-opacity"></div>
                    <div className="w-full bg-[#6C3FE2] rounded-t-md h-[40%] hover:opacity-80 transition-opacity"></div>
                    <div className="w-full bg-[#6C3FE2] rounded-t-md h-[30%] hover:opacity-80 transition-opacity"></div>
                    <div className="w-full bg-[#6C3FE2] rounded-t-md h-[65%] hover:opacity-80 transition-opacity"></div>
                    <div className="w-full bg-[#6C3FE2] rounded-t-md h-[90%] hover:opacity-80 transition-opacity shadow-[0_0_15px_rgba(108,63,226,0.4)]"></div>
                  </div>
                </div>

                {/* QR Section */}
                <div className="w-[150px] bg-white rounded-2xl border border-gray-100 p-3 shadow-sm flex flex-col items-center justify-between">
                  <div className="w-full aspect-square bg-white rounded-xl p-2 shadow-[0_5px_15px_rgba(0,0,0,0.05)] border border-gray-50 mb-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR" className="w-full h-full opacity-90" />
                  </div>
                  <div className="w-full py-2 bg-[#6C3FE2]/10 text-[#6C3FE2] text-[10px] leading-tight font-bold text-center rounded-xl border border-[#6C3FE2]/20">
                    Waiting for<br/>confirmation...
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Notification - Payment Received (Top Right) */}
            <div className="absolute top-2 -right-12 bg-white p-3 pr-6 rounded-[16px] shadow-[0_20px_40px_rgba(0,0,0,0.2)] border border-gray-100 z-30 flex items-center gap-3 animate-[bounce_5s_infinite]">
              <div className="w-10 h-10 rounded-[12px] bg-[#6C3FE2]/10 flex items-center justify-center shrink-0 border border-[#6C3FE2]/20">
                <CheckCircle2 className="w-5 h-5 text-[#6C3FE2]" />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900 mb-0.5 tracking-tight">Payment received</p>
                <p className="text-[11px] font-bold text-gray-400">₹1,499.00 <span className="font-medium font-sans">· just now</span></p>
              </div>
            </div>

            {/* Floating Notification - Webhook (Bottom Left) */}
            <div className="absolute bottom-16 -left-12 bg-white p-3 pr-6 rounded-[16px] shadow-[0_20px_40px_rgba(0,0,0,0.2)] border border-gray-100 z-30 flex items-center gap-3 animate-[bounce_6s_infinite_reverse]">
              <div className="w-10 h-10 rounded-[12px] bg-[#6C3FE2]/10 flex items-center justify-center shrink-0 border border-[#6C3FE2]/20">
                <Webhook className="w-5 h-5 text-[#6C3FE2]" />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900 mb-0.5 tracking-tight">Webhook delivered</p>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">HTTP 200 OK</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Floating Stats Bar */}
      <div className="max-w-6xl mx-auto px-6 relative z-20 -mt-16 mb-24">
        <div className="bg-white rounded-[24px] shadow-[0_20px_50px_rgba(108,63,226,0.15)] border border-gray-100 p-8 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="text-center pt-4 md:pt-0 px-4">
            <h4 className="text-2xl font-black text-[#6C3FE2] mb-1">UPI</h4>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">QR & app intents</p>
          </div>
          <div className="text-center pt-8 md:pt-0 px-4">
            <h4 className="text-2xl font-black text-[#6C3FE2] mb-1">24×7</h4>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment collection</p>
          </div>
          <div className="text-center pt-8 md:pt-0 px-4">
            <h4 className="text-2xl font-black text-[#6C3FE2] mb-1">REST</h4>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Simple JSON APIs</p>
          </div>
          <div className="text-center pt-8 md:pt-0 px-4">
            <h4 className="text-2xl font-black text-[#6C3FE2] mb-1">Live</h4>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status notifications</p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section id="product" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight text-gray-900">Everything required to collect, verify and manage payments.</h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto font-medium">V1 brings the complete workflow together with clearer operations, stronger controls and a checkout that merchants can brand.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {[
              { icon: LinkIcon, title: 'Connect payment accounts', desc: 'Add Manual UPI, Paytm or supported merchant accounts and manage active connections from one place.' },
              { icon: Zap, title: 'Instant payment links', desc: 'Create single-use or reusable links with customer, amount, order reference, callback and expiry controls.' },
              { icon: FileCheck, title: 'UTR review workflow', desc: 'Customers submit UTR references for Manual UPI. Review and approve before success is confirmed.' },
              { icon: Palette, title: 'Custom checkout themes', desc: 'Upload your business logo and select from five professional, responsive payment-page themes.' },
              { icon: Webhook, title: 'Signed status webhooks', desc: 'Notify connected systems when payments change state, with delivery history for debugging.' },
              { icon: BarChart, title: 'Reports and customers', desc: 'Understand transactions, revenue, customer activity and payment performance from one dashboard.' },
              { icon: Mail, title: 'Email notifications', desc: 'Send welcome messages and instant merchant payment-success alerts.' },
              { icon: Gift, title: 'Referral rewards', desc: 'Invite merchants with a unique referral link and track registered, qualified and paid rewards.' },
              { icon: Lock, title: 'Operational security', desc: 'Strong protection, rate limiting, audit activity and controlled payment finalization.' },
            ].map((feature, i) => (
              <div key={i} className="bg-[#FAFAFA] border border-gray-100 rounded-3xl p-8 hover:shadow-[0_15px_40px_rgba(108,63,226,0.1)] hover:-translate-y-1 hover:border-[#6C3FE2]/30 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-6 group-hover:border-[#6C3FE2] group-hover:shadow-[0_0_20px_rgba(108,63,226,0.2)] transition-all">
                  <feature.icon className="w-6 h-6 text-gray-900 group-hover:text-[#6C3FE2] transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-base font-medium text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security Section (New) */}
      <section className="py-24 px-6 border-t border-[#6C3FE2]/10 bg-[#6C3FE2]/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-[#6C3FE2]/10 shadow-[0_4px_20px_rgba(108,63,226,0.05)]">
                <Shield className="w-8 h-8 text-[#6C3FE2] mb-4" />
                <h4 className="font-bold text-gray-900 mb-1">Bank-Grade Security</h4>
                <p className="text-sm text-gray-500">256-bit encryption for all data</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-[#6C3FE2]/10 shadow-[0_4px_20px_rgba(108,63,226,0.05)]">
                <Lock className="w-8 h-8 text-[#6C3FE2] mb-4" />
                <h4 className="font-bold text-gray-900 mb-1">Data Privacy</h4>
                <p className="text-sm text-gray-500">Compliant with Indian guidelines</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-[#6C3FE2]/10 shadow-[0_4px_20px_rgba(108,63,226,0.05)]">
                <RefreshCw className="w-8 h-8 text-[#6C3FE2] mb-4" />
                <h4 className="font-bold text-gray-900 mb-1">99.9% Uptime</h4>
                <p className="text-sm text-gray-500">Reliable infrastructure</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-[#6C3FE2]/10 shadow-[0_4px_20px_rgba(108,63,226,0.05)]">
                <Cpu className="w-8 h-8 text-[#6C3FE2] mb-4" />
                <h4 className="font-bold text-gray-900 mb-1">Rate Limiting</h4>
                <p className="text-sm text-gray-500">Protection against abuse</p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight text-gray-900">Built on a foundation of trust and reliability.</h2>
            <p className="text-gray-500 text-xl font-medium mb-8">Security isn't an afterthought. From encrypted API keys to stringent rate limiting, AutoPayX is engineered to protect your business and your customers.</p>
            <ul className="space-y-4">
              <li className="flex items-center text-gray-700 font-bold"><CheckCircle2 className="w-5 h-5 text-[#6C3FE2] mr-3" /> Fraud prevention monitoring</li>
              <li className="flex items-center text-gray-700 font-bold"><CheckCircle2 className="w-5 h-5 text-[#6C3FE2] mr-3" /> Secure webhook signatures</li>
              <li className="flex items-center text-gray-700 font-bold"><CheckCircle2 className="w-5 h-5 text-[#6C3FE2] mr-3" /> Detailed audit logs</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-gray-100 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-20 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight text-gray-900">From account setup to verified payment in four steps.</h2>
            <p className="text-gray-500 text-xl font-medium">A focused workflow keeps merchants in control while customers get a fast, mobile-ready UPI checkout.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-10 w-[calc(100%-80px)] h-px bg-gray-200"></div>
            {[
              { step: '01', title: 'Connect an account', desc: 'Add the business name, mobile number and merchant UPI details.' },
              { step: '02', title: 'Create an order', desc: 'Use the dashboard or REST API with amount, customer and callback data.' },
              { step: '03', title: 'Customer pays', desc: 'Share the hosted checkout with QR, UPI intent and reference submission.' },
              { step: '04', title: 'Verify & automate', desc: 'Update the transaction, notify the merchant and dispatch the configured webhook.' },
            ].map((step, i) => (
              <div key={i} className="relative bg-white pt-4 group">
                <div className="w-16 h-16 bg-[#FAFAFA] group-hover:bg-[#6C3FE2] border border-gray-200 group-hover:border-[#6C3FE2] rounded-2xl flex items-center justify-center text-xl font-black text-gray-900 group-hover:text-white mb-6 mx-auto shadow-sm transition-colors relative z-10">{step.step}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 text-center">{step.title}</h3>
                <p className="text-base font-medium text-gray-500 text-center">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developers Section */}
      <section id="developers" className="py-32 px-6 bg-[#0D0518] text-white relative overflow-hidden border-t border-[#6C3FE2]/20">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#6C3FE2]/50 to-transparent"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6C3FE2]/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-[#6C3FE2]/30 bg-[#6C3FE2]/10 text-xs font-bold text-[#A880FF] mb-8">
              <Terminal className="w-4 h-4 mr-2 text-[#00F0FF]" /> Developer First
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white leading-tight">A clean API, without the integration maze.</h2>
            <p className="text-purple-200/60 mb-10 text-xl font-medium leading-relaxed">Create an order with JSON, redirect the customer to hosted checkout and verify the result through status APIs or webhooks.</p>
            <div className="flex gap-4">
              <Link href="/docs" className="inline-flex items-center px-6 py-3 bg-[#6C3FE2] text-white font-bold rounded-xl hover:bg-[#5028c6] transition-colors shadow-[0_0_20px_rgba(108,63,226,0.3)]">
                Read API Docs <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/register" className="inline-flex items-center px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
                Get API Keys
              </Link>
            </div>
          </div>
          <div className="bg-[#130B24] border border-[#6C3FE2]/30 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
            <div className="px-6 py-4 border-b border-[#6C3FE2]/20 flex items-center justify-between bg-[#1C1236]">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="text-xs font-mono font-medium text-[#A880FF]">create_order.sh</div>
            </div>
            <div className="p-8 overflow-x-auto">
              <pre className="text-sm font-mono text-purple-200/80 leading-relaxed">
                <span className="text-pink-400">curl</span> -X POST https://autopayx.in/api/create-order \
                <br />  -H <span className="text-[#00F0FF]">"X-API-Key: pi_live_your_key"</span> \
                <br />  -H <span className="text-[#00F0FF]">"X-API-Secret: sk_live_your_secret"</span> \
                <br />  -H <span className="text-[#00F0FF]">"Content-Type: application/json"</span> \
                <br />  -d <span className="text-yellow-300">'{'{'}
                  <br />    "amount": "1499.00",
                  <br />    "order_id": "ORD_2026_V1",
                  <br />    "customer_name": "Customer Name",
                  <br />    "callback_url": "https://shop.example/success"
                  <br />  {'}'}'</span>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 relative bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-gray-900">Start focused. Upgrade when ready.</h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto font-medium">Simple plans for every stage of your payment journey.</p>
          </div>

          {loadingPlans ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#6C3FE2] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-8 items-center max-w-6xl mx-auto">

              {/* Free Plan Fallback/Static Removed */}

              {/* Dynamic Plans from DB */}
              {[...plans].sort((a: any, b: any) => {
                const getWeight = (name: string) => {
                  const lower = name.toLowerCase();
                  if (lower.includes('free')) return 0;
                  if (lower.includes('pro')) return 1;
                  return 2;
                };
                const weightA = getWeight(a.name);
                const weightB = getWeight(b.name);
                if (weightA !== weightB) return weightA - weightB;
                return parseFloat(a.price) - parseFloat(b.price);
              }).map((plan: any, i: number) => {
                const isPopular = i === 1;
                return (
                <div key={plan.id} className={`${isPopular ? 'bg-[#130B24] border-[#6C3FE2]/30 shadow-[0_20px_50px_rgba(108,63,226,0.3)] transform md:-translate-y-6 z-20' : 'bg-white border-gray-200 hover:border-[#6C3FE2]/30 shadow-sm hover:shadow-[0_20px_40px_rgba(108,63,226,0.1)] group'} border transition-all rounded-[32px] p-10 flex flex-col h-full relative overflow-hidden`}>
                  
                  {isPopular && (
                    <>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#6C3FE2]/30 rounded-full blur-3xl pointer-events-none"></div>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-[#A880FF] to-[#6C3FE2] text-white text-xs font-black rounded-b-xl uppercase tracking-widest shadow-md">Most Popular</div>
                    </>
                  )}

                  <h3 className={`text-3xl font-black mb-2 mt-4 relative z-10 ${isPopular ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                  <p className={`font-medium text-base mb-8 relative z-10 ${isPopular ? 'text-[#A880FF]' : 'text-gray-500'}`}>For growing businesses.</p>

                  <div className="flex items-end gap-2 mb-8 relative z-10">
                    <div className={`text-5xl font-black ${isPopular ? 'text-white' : 'text-gray-900'}`}>₹{plan.price}</div>
                    <div className={`text-lg font-bold pb-1 ${isPopular ? 'text-purple-200/50' : 'text-gray-400'} uppercase`}>/ {plan.interval}</div>
                  </div>

                  <ul className="space-y-5 mb-10 flex-1 relative z-10">
                    {plan.features?.map((feature: string, idx: number) => (
                      <li key={idx} className={`flex items-start text-base font-medium ${isPopular ? 'text-purple-100' : 'text-gray-700'}`}>
                        <CheckCircle2 className={`w-5 h-5 mr-4 shrink-0 mt-0.5 ${isPopular ? 'text-[#00F0FF]' : 'text-gray-400 group-hover:text-[#6C3FE2] transition-colors'}`} /> 
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link href={`/register?plan=${plan.id}`} className={`w-full py-4 text-center font-bold text-lg rounded-xl transition-all shadow-sm flex items-center justify-center group relative z-10 ${isPopular ? 'bg-white hover:bg-gray-200 text-[#6C3FE2]' : 'bg-gray-50 hover:bg-[#6C3FE2] border border-gray-200 hover:border-[#6C3FE2] text-gray-900 hover:text-white'}`}>
                    Purchase Plan <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                );
              })}

              {/* Custom Plan Removed */}

            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-[#6C3FE2] text-center relative overflow-hidden border-t border-[#6C3FE2]/20">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/10 rounded-full blur-[120px] pointer-events-none -z-0"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white leading-tight">Turn every payment into a<br />clear, trackable workflow.</h2>
          <p className="text-[#D0BFFF] font-medium mb-12 text-xl max-w-2xl mx-auto">Set up your merchant workspace and create your first payment link in minutes. No credit card required.</p>
          <Link href="/register" className="px-10 py-5 bg-white text-[#6C3FE2] text-lg font-black rounded-xl hover:bg-gray-100 hover:scale-105 transition-all inline-flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
            Create free account <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#6C3FE2]/20 py-16 px-6 bg-[#130B24]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="bg-white rounded-xl p-1.5 mr-3 shadow-md flex items-center justify-center">
                <img src="/autopayx-icon.png" alt="AutoPayX Icon" className="h-8 w-8 object-contain" />
              </div>
              <img src="/autopayx-logo.png" alt="AutoPayX" className="h-20 object-contain mt-0.5 brightness-0 invert" />
              <span className="hidden md:inline text-[#A880FF] font-medium text-sm ml-5 border-l border-[#6C3FE2]/30 pl-5">Payment infrastructure built for ambitious Indian businesses.</span>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-purple-200/80">
              <a href="#product" className="hover:text-white transition-colors">Product</a>
              <a href="#developers" className="hover:text-white transition-colors">Developers</a>
              <a href="/docs" className="hover:text-white transition-colors">API Docs</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</a>
              <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
            </div>
          </div>

          <div className="border-t border-[#6C3FE2]/20 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm font-medium text-purple-200/60 text-center sm:text-left">
              © {new Date().getFullYear()} AutoPayX Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-purple-200/60">Developed by</span>
              <a href="https://zeenox.in" target="_blank" rel="noopener noreferrer" className="flex items-center hover:opacity-100 transition-opacity">
                <img src="/zeenox-logo.png" alt="Zeenox" className="h-4 object-contain brightness-0 invert opacity-60 hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
