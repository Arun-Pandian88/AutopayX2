'use client';

import { X, Zap, Shield, TrendingUp, Plug, Key, Activity, CreditCard, Gift, Settings, Code, Webhook, ArrowRight, CheckCircle2, Palette } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PageBannerProps {
  pageKey: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
  gradient?: string;
}

export default function PageBanner({ pageKey, icon, title, description, ctaText, ctaHref, gradient = 'from-[#6C3FE2] to-[#8B5CF6]' }: PageBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to prevent flash

  useEffect(() => {
    const dismissed = localStorage.getItem(`apx_banner_${pageKey}`);
    setIsDismissed(dismissed === 'true');
  }, [pageKey]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(`apx_banner_${pageKey}`, 'true');
  };

  if (isDismissed) return null;

  return (
    <div className={`relative bg-gradient-to-r ${gradient} rounded-[24px] p-6 md:p-8 mb-8 overflow-hidden shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6`}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
      <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 blur-xl"></div>
      
      <button 
        onClick={handleDismiss}
        className="absolute top-4 right-4 w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors z-20 backdrop-blur-md"
      >
        <X className="w-4 h-4 text-white" />
      </button>

      {/* Content */}
      <div className="flex flex-col gap-4 relative z-10 max-w-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/20 shadow-sm">
            {icon}
          </div>
          <h3 className="text-white font-black text-xl md:text-2xl leading-tight tracking-tight">{title}</h3>
        </div>
        <p className="text-white/90 text-sm md:text-base font-medium leading-relaxed max-w-md">{description}</p>
        
        {ctaText && (
          <div className="mt-2">
            <a 
              href={ctaHref || '#'} 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#1C1D22] text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              {ctaText} <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>

      {/* Transparent SVG/CSS Illustration Right Side */}
      <div className="hidden md:flex absolute right-0 top-0 bottom-0 w-1/3 max-w-[340px] pointer-events-none z-0 items-center justify-end pr-8">
        {/* Soft edge mask to blend smoothly into the gradient */}
        <div 
          className="absolute inset-0 z-10"
          style={{ maskImage: 'linear-gradient(to right, black 0%, transparent 50%)', WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 50%)' }}
        ></div>
        
        {/* Floating Elements (Pure CSS/React so it's perfectly transparent) */}
        <div className="relative w-48 h-48 animate-float">
          {/* Main Card */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-40 h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-4 rotate-[-6deg] flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="w-6 h-4 bg-white/20 rounded-sm"></div>
              <div className="w-4 h-4 rounded-full bg-white/30"></div>
            </div>
            <div className="space-y-1.5">
              <div className="w-full h-1.5 bg-white/20 rounded-full"></div>
              <div className="w-2/3 h-1.5 bg-white/20 rounded-full"></div>
            </div>
          </div>
          
          {/* Floating Pill 1 (Success) */}
          <div className="absolute right-28 top-8 px-3 py-1.5 bg-[#bdf32b]/90 backdrop-blur-sm shadow-xl rounded-full border border-[#bdf32b] flex items-center gap-1.5 rotate-[4deg] animate-pulse-slow">
            <CheckCircle2 className="w-3 h-3 text-[#1C1D22]" />
            <span className="text-[#1C1D22] text-[9px] font-bold">+ ₹500.00</span>
          </div>

          {/* Floating Pill 2 (Graph) */}
          <div className="absolute -right-2 bottom-6 px-3 py-2 bg-[#1C1D22]/80 backdrop-blur-sm shadow-xl rounded-xl border border-white/10 flex items-end gap-1 rotate-[-2deg]">
            <div className="w-1.5 h-3 bg-white/40 rounded-t-sm"></div>
            <div className="w-1.5 h-5 bg-white/60 rounded-t-sm"></div>
            <div className="w-1.5 h-4 bg-[#6C3FE2] rounded-t-sm"></div>
            <div className="w-1.5 h-7 bg-[#bdf32b] rounded-t-sm"></div>
          </div>

          {/* Background Glows */}
          <div className="absolute right-12 top-12 w-20 h-20 bg-[#bdf32b] rounded-full blur-3xl opacity-20"></div>
          <div className="absolute right-20 bottom-12 w-24 h-24 bg-white rounded-full blur-3xl opacity-20"></div>
        </div>
      </div>
    </div>
  );
}

// Pre-configured banners for each page
export const bannerConfigs: Record<string, Omit<PageBannerProps, 'pageKey'>> = {
  dashboard: {
    icon: <Zap className="w-5 h-5 text-white" />,
    title: 'Supercharge Your Payments',
    description: 'Connect your UPI accounts and start automating payment routing in under 2 minutes.',
    ctaText: 'Connect Now',
    ctaHref: '/dashboard/connect',
    gradient: 'from-[#6C3FE2] to-[#8B5CF6]'
  },
  transactions: {
    icon: <Activity className="w-5 h-5 text-white" />,
    title: 'Real-Time Transaction Monitoring',
    description: 'All your UPI payments are tracked instantly. Filter, search, and export reports with one click.',
    gradient: 'from-[#0ea5e9] to-[#6366f1]'
  },
  connect: {
    icon: <Plug className="w-5 h-5 text-white" />,
    title: 'Link Your Payment Apps',
    description: 'Save your UPI ID and connect the mailbox to start auto-verifying incoming payments.',
    gradient: 'from-[#6C3FE2] to-[#a855f7]'
  },
  'payment-links': {
    icon: <CreditCard className="w-5 h-5 text-white" />,
    title: 'Create & Share Payment Links',
    description: 'Generate branded payment links and share them with customers via any channel.',
    ctaText: 'Create Link',
    gradient: 'from-[#f59e0b] to-[#ef4444]'
  },
  plans: {
    icon: <TrendingUp className="w-5 h-5 text-white" />,
    title: 'Upgrade for More Power',
    description: 'Unlock unlimited UPI IDs, priority routing, and advanced analytics with a premium plan.',
    ctaText: 'View Plans',
    gradient: 'from-[#6C3FE2] to-[#ec4899]'
  },
  checkout: {
    icon: <Palette className="w-5 h-5 text-white" />,
    title: 'Design Your Payment Page',
    description: 'Customize the look and feel of your payment links to match your brand identity.',
    gradient: 'from-[#10b981] to-[#3b82f6]'
  },
  settings: {
    icon: <Settings className="w-5 h-5 text-white" />,
    title: 'Customize Your Experience',
    description: 'Update your profile, manage security settings, and configure notification preferences.',
    gradient: 'from-[#374151] to-[#6b7280]'
  },
  apikeys: {
    icon: <Key className="w-5 h-5 text-white" />,
    title: 'Secure API Access',
    description: 'Generate API keys to integrate AutoPayX with your website, app, or backend securely.',
    gradient: 'from-[#10b981] to-[#059669]'
  },
  webhooks: {
    icon: <Webhook className="w-5 h-5 text-white" />,
    title: 'Real-Time Event Webhooks',
    description: 'Get notified instantly when a payment is received, verified, or routed to your UPI ID.',
    gradient: 'from-[#8b5cf6] to-[#6366f1]'
  },
  integrations: {
    icon: <Code className="w-5 h-5 text-white" />,
    title: 'Powerful Integrations',
    description: 'Connect AutoPayX with Shopify, WooCommerce, Telegram bots, and more.',
    gradient: 'from-[#06b6d4] to-[#3b82f6]'
  },
  referrals: {
    icon: <Gift className="w-5 h-5 text-white" />,
    title: 'Refer & Earn Rewards',
    description: 'Invite other merchants and earn commission on every transaction they process.',
    ctaText: 'Share Link',
    gradient: 'from-[#f97316] to-[#ef4444]'
  },
  developer: {
    icon: <Code className="w-5 h-5 text-white" />,
    title: 'Developer Console',
    description: 'Access API docs, test endpoints, and debug your integration in real-time.',
    gradient: 'from-[#1e293b] to-[#475569]'
  },
  support: {
    icon: <Shield className="w-5 h-5 text-white" />,
    title: 'We\'re Here to Help',
    description: 'Browse FAQs, submit a ticket, or chat with our support team for quick resolutions.',
    gradient: 'from-[#6C3FE2] to-[#a78bfa]'
  },
  superadmin_dashboard: {
    icon: <Activity className="w-5 h-5 text-white" />,
    title: 'Superadmin Console',
    description: 'Overview of platform statistics, merchants, and system health in one unified view.',
    gradient: 'from-[#1e293b] to-[#0f172a]'
  },
  superadmin_merchants: {
    icon: <Key className="w-5 h-5 text-white" />,
    title: 'Merchant Management',
    description: 'View, edit, and manage all merchants using the AutoPayX platform.',
    gradient: 'from-[#2563eb] to-[#1e40af]'
  },
  superadmin_plans: {
    icon: <TrendingUp className="w-5 h-5 text-white" />,
    title: 'Subscription Plans',
    description: 'Manage platform pricing tiers, features, and billing cycles for your merchants.',
    gradient: 'from-[#059669] to-[#047857]'
  },
  superadmin_logs: {
    icon: <Code className="w-5 h-5 text-white" />,
    title: 'System Logs',
    description: 'Monitor system events, API errors, and audit trails for security and debugging.',
    gradient: 'from-[#dc2626] to-[#991b1b]'
  }
};
