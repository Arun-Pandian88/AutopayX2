'use client';

import { useState, useEffect } from 'react';

export default function ModeToggle() {
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Load from local storage on mount
    const savedMode = localStorage.getItem('autopayx_mode');
    if (savedMode === 'live') {
      setIsLive(true);
    } else {
      setIsLive(false);
    }
  }, []);

  const toggleMode = () => {
    const newMode = !isLive;
    setIsLive(newMode);
    localStorage.setItem('autopayx_mode', newMode ? 'live' : 'test');
    
    // Optionally trigger a custom event so other components can react
    window.dispatchEvent(new Event('modeChange'));
  };

  return (
    <button 
      onClick={toggleMode}
      className={`relative flex items-center justify-between w-[90px] h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out border shadow-sm ${
        isLive 
          ? 'bg-[#E2F7E4] dark:bg-[#1E5632]/20 border-[#1E5632]/30' 
          : 'bg-[#FFF4E5] dark:bg-[#7A4005]/20 border-[#7A4005]/30'
      }`}
    >
      <div 
        className={`absolute top-1 left-1 bottom-1 w-[40px] rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
          isLive ? 'translate-x-[42px]' : 'translate-x-0'
        }`}
      />
      
      <span className={`text-[10px] font-black uppercase tracking-wider z-10 w-1/2 text-center transition-colors duration-300 ${isLive ? 'text-gray-400' : 'text-[#B86008]'}`}>
        Test
      </span>
      <span className={`text-[10px] font-black uppercase tracking-wider z-10 w-1/2 text-center transition-colors duration-300 ${isLive ? 'text-[#1E5632]' : 'text-gray-400'}`}>
        Live
      </span>
    </button>
  );
}
