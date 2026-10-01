'use client';

import { Mail, MessageCircle, HelpCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import PageBanner, { bannerConfigs } from '@/components/PageBanner';

export default function SupportPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in p-6">
      <PageBanner pageKey="support" {...bannerConfigs.support} />
      <div>
        <h1 className="text-3xl font-extrabold text-[#1C1D22] dark:text-white tracking-tight">Support</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
          Need help? Our team usually replies within a few hours.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Email Card */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col items-start shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4 mb-4">
            <Mail className="w-6 h-6 text-[#6C3FE2]" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Email us</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">support@autopayx.in</p>
            </div>
          </div>
          <a
            href="mailto:support@autopayx.in"
            className="mt-auto px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm font-bold rounded-xl transition-colors"
          >
            Send email
          </a>
        </div>

        {/* WhatsApp Card */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col items-start shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-[#25D366]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">WhatsApp</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">+91 7603917369</p>
            </div>
          </div>
          <a
            href="https://wa.me/917603917369"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto flex items-center px-4 py-2 bg-[#8bc34a] hover:bg-[#7cb342] text-white text-sm font-bold rounded-xl transition-colors"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat on WhatsApp
          </a>
        </div>

        {/* Help Centre Card */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col items-start shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4 mb-4">
            <HelpCircle className="w-6 h-6 text-[#6C3FE2]" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Help centre</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Guides for setup, links and payouts</p>
            </div>
          </div>
          <Link
            href="/docs"
            className="mt-auto flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm font-bold rounded-xl transition-colors"
          >
            Open docs
          </Link>
        </div>

      </div>
    </div>
  );
}
