import Link from 'next/link';
import { LayoutDashboard, Users, Activity, Settings, LogOut, ShieldAlert, CreditCard } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import SignOutButton from '@/components/SignOutButton';
import UserProfile from '@/components/UserProfile';
import { UserProvider } from '@/context/UserContext';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0B] p-4 md:p-6 font-sans flex text-gray-900 dark:text-gray-100 transition-colors">
        
        {/* App Container */}
        <div className="flex w-full bg-white dark:bg-[#111111] rounded-[32px] md:rounded-[40px] overflow-hidden border border-red-500/20 dark:border-red-500/20 relative min-h-[90vh] shadow-[0_20px_50px_rgba(239,68,68,0.1)] dark:shadow-[0_0_50px_rgba(239,68,68,0.05)]">
          
          {/* The Purple Floating Sidebar (Expandable on Hover) */}
          <aside className="w-[88px] hover:w-[260px] transition-all duration-300 ease-in-out bg-[#6C3FE2] flex flex-col py-8 z-50 rounded-r-[40px] group absolute h-full md:relative md:h-auto overflow-hidden shadow-2xl">
            
            <div className="px-5 mb-12 flex items-center justify-center w-full">
              {/* Expanded state logo */}
              <div className="w-full h-20 hidden group-hover:flex flex-col items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/autopayx-logo.png" alt="AutoPayX" className="h-[100%] w-[100%] object-contain object-center scale-100 -ml-2" />
                <span className="text-[9px] font-black text-white/50 bg-white/10 px-2 py-0.5 rounded-full uppercase tracking-[0.2em] -ml-2 mt-0">SuperAdmin</span>
              </div>
              {/* Collapsed state logo */}
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-md border-2 border-white group-hover:hidden overflow-hidden p-1.5">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src="/autopayx-icon.png" alt="A" className="w-[100%] h-[100%] object-contain" />
              </div>
            </div>
            
            <div className="px-5">
              <UserProfile />
            </div>

            <div className="flex-1 flex flex-col space-y-4 w-full px-5 mt-4">
              <Link href="/superadmin/dashboard" className="flex items-center p-3 rounded-2xl bg-white/20 text-white shadow-lg transition-transform hover:scale-105">
                <LayoutDashboard className="w-6 h-6 shrink-0" />
                <span className="ml-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Overview</span>
              </Link>

              <Link href="/superadmin/dashboard/merchants" className="flex items-center p-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all">
                <Users className="w-6 h-6 shrink-0" />
                <span className="ml-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Merchants</span>
              </Link>
              
              <Link href="/superadmin/dashboard/plans" className="flex items-center p-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all overflow-hidden">
                <CreditCard className="w-6 h-6 shrink-0" />
                <span className="ml-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden text-ellipsis">Subscriptions & Plans</span>
              </Link>

              <Link href="/superadmin/dashboard/logs" className="flex items-center p-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all">
                <Activity className="w-6 h-6 shrink-0" />
                <span className="ml-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">System Logs</span>
              </Link>

              <div className="mt-auto pt-4 border-t border-white/20">
                <SignOutButton />
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-black pl-[88px] md:pl-0">
            <header className="h-24 px-10 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-8">
                <span className="text-gray-900 dark:text-white font-bold text-lg flex items-center">
                  <ShieldAlert className="w-5 h-5 mr-2 text-[#6C3FE2]" />
                  SaaS Control Panel
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
              {children}
            </div>
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
