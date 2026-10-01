import Link from 'next/link';
import { LayoutDashboard, Key, Activity, Settings, Webhook, Zap, Repeat, Landmark, Users, Search, Bell, Link as LinkIcon, RefreshCw, Palette, Gift, FileText, Terminal, Settings2, LifeBuoy } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationBell from '@/components/NotificationBell';
import SignOutButton from '@/components/SignOutButton';
import UserProfile from '@/components/UserProfile';
import { UserProvider } from '@/context/UserContext';
import ExportButton from '@/components/ExportButton';
import PlanStatusWidget from '@/components/PlanStatusWidget';
import ModeToggle from '@/components/ModeToggle';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className="min-h-screen bg-[#F4F5F9] dark:bg-black p-4 md:p-6 font-sans flex text-[#1C1D22] dark:text-gray-100 transition-colors">
      
      {/* App Container */}
      <div className="flex w-full bg-[#FAFAFC] dark:bg-[#0A0A0B] rounded-[32px] md:rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white dark:border-[#2d2e33] relative min-h-[90vh] transition-colors">
        
        {/* The Purple Floating Sidebar (Expandable on Hover) */}
        <aside className="w-[88px] hover:w-[260px] transition-all duration-300 ease-in-out bg-[#6C3FE2] flex flex-col py-8 z-50 rounded-r-[40px] group absolute h-full md:relative md:h-auto overflow-hidden shadow-2xl md:shadow-none">
          
          <div className="px-5 mb-12 flex items-center justify-center w-full">
            {/* Expanded state logo (hidden when collapsed, shown on hover) */}
            <div className="w-full h-20 hidden group-hover:flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/autopayx-logo.png" alt="AutoPayX" className="h-[120%] w-[120%] object-contain object-center scale-110 -ml-3" />
            </div>
            {/* Collapsed state logo (shown when collapsed, hidden on hover) */}
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-md border-2 border-white group-hover:hidden overflow-hidden p-1.5">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src="/autopayx-icon.png" alt="A" className="w-[100%] h-[100%] object-contain" />
            </div>
          </div>
          
          <div className="px-5">
            <UserProfile />
          </div>

          <div className="flex-1 flex flex-col space-y-4 w-full px-5">
            <Link href="/dashboard" className="flex items-center p-3 rounded-2xl bg-white text-[#6C3FE2] shadow-lg transition-transform hover:scale-105">
              <LayoutDashboard className="w-6 h-6 shrink-0" />
              <span className="ml-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Dashboard</span>
            </Link>

            <Link href="/dashboard/payment-links" className="flex items-center p-3 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <LinkIcon className="w-6 h-6 shrink-0" />
              <span className="ml-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Payment Links</span>
            </Link>

            <Link href="/dashboard/plans" className="flex items-center p-3 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <Landmark className="w-6 h-6 shrink-0" />
              <span className="ml-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Plans & Billing</span>
            </Link>
            
            <Link href="/dashboard/transactions" className="flex items-center p-3 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <Activity className="w-6 h-6 shrink-0" />
              <span className="ml-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Transactions</span>
            </Link>
            


            <Link href="/dashboard/connect" className="flex items-center p-3 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <Users className="w-6 h-6 shrink-0" />
              <span className="ml-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Connect Account</span>
            </Link>
            
            <Link href="/dashboard/checkout" className="flex items-center p-3 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <Palette className="w-6 h-6 shrink-0" />
              <span className="ml-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Checkout Theme</span>
            </Link>

            <Link href="/dashboard/apikeys" className="flex items-center p-3 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <Key className="w-6 h-6 shrink-0" />
              <span className="ml-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">API Keys</span>
            </Link>
            
            <Link href="/dashboard/webhooks" className="flex items-center p-3 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <Webhook className="w-6 h-6 shrink-0" />
              <span className="ml-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Webhooks</span>
            </Link>

            <Link href="/docs" target="_blank" className="flex items-center p-3 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <FileText className="w-6 h-6 shrink-0" />
              <span className="ml-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">API Docs</span>
            </Link>

            <Link href="/dashboard/config" className="flex items-center p-3 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <Settings2 className="w-6 h-6 shrink-0" />
              <span className="ml-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">App Config</span>
            </Link>

            <Link href="/dashboard/developer" className="flex items-center p-3 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <Terminal className="w-6 h-6 shrink-0" />
              <span className="ml-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Developer</span>
            </Link>

            <Link href="/dashboard/support" className="flex items-center p-3 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <LifeBuoy className="w-6 h-6 shrink-0" />
              <span className="ml-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Support</span>
            </Link>

            <div className="mt-auto flex flex-col w-full">
              <div className="hidden group-hover:block mb-4 w-full">
                <PlanStatusWidget />
              </div>
              <Link href="/dashboard/settings" className="flex items-center p-3 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
                <Settings className="w-6 h-6 shrink-0" />
                <span className="ml-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Settings</span>
              </Link>
              <SignOutButton />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-br from-[#FAFAFC] to-[#F0F2F8] dark:from-[#0A0A0B] dark:to-[#1C1D22] pl-[88px] md:pl-0 transition-colors">
          
          {/* Top Navigation Bar */}
          <header className="h-24 px-10 flex items-center justify-between">
            {/* Nav Links */}
            <div className="flex items-center space-x-8">
              <Link href="#" className="flex items-center text-[#1C1D22] dark:text-white font-bold">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  className="w-full bg-white dark:bg-[#1C1D22] border-0 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-full pl-11 pr-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6C3FE2]/20 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                  placeholder="Search or type command"
                />
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-4">
              {/* Live / Test Mode Toggle */}
              <ModeToggle />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notification Bell */}
              <NotificationBell />

              {/* Settings */}
              <Link href="/dashboard/settings" className="w-10 h-10 bg-white dark:bg-[#1C1D22] rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-gray-600 dark:text-gray-400 hover:text-[#6C3FE2] dark:hover:text-white transition-colors">
                <Settings className="w-4 h-4" />
              </Link>

              <ExportButton />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
            {children}
          </div>

        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(108, 63, 226, 0.2); 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(108, 63, 226, 0.4); 
        }
      `}} />
    </div>
    </UserProvider>
  );
}
