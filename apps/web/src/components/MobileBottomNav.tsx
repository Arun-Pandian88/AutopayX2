'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Link as LinkIcon, Landmark, Activity, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Links', href: '/dashboard/payment-links', icon: LinkIcon },
    { name: 'Plans', href: '/dashboard/plans', icon: Landmark },
    { name: 'Activity', href: '/dashboard/transactions', icon: Activity },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white/80 dark:bg-[#1C1D22]/80 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 dark:border-white/10 p-2 flex justify-between items-center relative overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="relative flex flex-col items-center justify-center w-14 h-14 z-10 transition-transform active:scale-90"
            >
              <div className={`flex flex-col items-center justify-center w-full h-full rounded-2xl transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#A880FF] to-[#6C3FE2] rounded-2xl shadow-lg -z-10 animate-in zoom-in duration-300"></div>
                )}
                <Icon className={`w-5 h-5 mb-1 transition-all duration-300 ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-[9px] font-bold transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 absolute'}`}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
