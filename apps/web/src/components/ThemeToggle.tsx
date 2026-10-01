'use client';

import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center bg-[#EAEAF1] dark:bg-[#2d2e33] rounded-full p-1 border border-white dark:border-transparent opacity-50">
        <button className="flex items-center px-3 py-1.5 rounded-full text-xs font-bold text-gray-500">
          <Sun className="w-3 h-3 mr-1.5" /> Light
        </button>
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className="flex items-center bg-[#EAEAF1] dark:bg-[#1C1D22] rounded-full p-1 border border-white dark:border-[#2d2e33] transition-colors">
      <button 
        onClick={() => setTheme('light')}
        className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${!isDark ? 'bg-[#6C3FE2] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
      >
        <Sun className="w-3 h-3 mr-1.5" /> Light
      </button>
      <button 
        onClick={() => setTheme('dark')}
        className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${isDark ? 'bg-[#6C3FE2] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
      >
        <Moon className="w-3 h-3 mr-1.5" /> Dark
      </button>
    </div>
  );
}
