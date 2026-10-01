'use client';

import { Bell, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const DEFAULT_NOTIFICATIONS = [
  { id: 1, title: 'UPI ID Connected', message: 'Your Google Pay UPI ID was successfully linked to the routing engine.', time: '2m ago', read: false, type: 'success' },
  { id: 2, title: 'New Payment Received', message: 'Received ₹500.00 from rohit@okhdfcbank.', time: '1h ago', read: false, type: 'info' },
  { id: 3, title: 'Welcome to AutoPayX', message: 'Complete your profile and add your first payment link to get started.', time: '1d ago', read: false, type: 'alert' }
];

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [hydrated, setHydrated] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load persisted state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('apx_notifications');
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Save to localStorage whenever notifications change (after hydration)
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('apx_notifications', JSON.stringify(notifications));
    }
  }, [notifications, hydrated]);

  const unreadNotifications = notifications.filter(n => !n.read);
  const unreadCount = unreadNotifications.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-[#008945]" />;
      case 'alert': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors relative ${isOpen ? 'bg-[#F4F5F9] dark:bg-gray-800 text-[#6C3FE2]' : 'bg-white dark:bg-[#1C1D22] text-gray-600 dark:text-gray-400 hover:text-[#6C3FE2] dark:hover:text-white'}`}
      >
        <Bell className="w-4 h-4" />
        {hydrated && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black text-white px-1 ring-2 ring-white dark:ring-[#1C1D22] animate-in zoom-in">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[340px] bg-white dark:bg-[#1C1D22] rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-gray-100 dark:border-gray-800 z-[100] overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-800/50 bg-[#FAFAFC] dark:bg-gray-900/50">
            <h3 className="font-black text-[#1C1D22] dark:text-white flex items-center tracking-tight">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-[#6C3FE2] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount} New</span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-[11px] font-bold text-gray-500 hover:text-[#6C3FE2] transition-colors uppercase tracking-wider">
                Mark Read
              </button>
            )}
          </div>
          
          <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
            {unreadNotifications.length > 0 ? (
              unreadNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  onClick={() => markAsRead(notification.id)}
                  className="px-6 py-4 border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 transition-colors cursor-pointer flex gap-4 bg-indigo-50/20 dark:bg-indigo-500/5"
                >
                  <div className="mt-0.5 shrink-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-[#D7F1E2]' : notification.type === 'alert' ? 'bg-orange-50' : 'bg-blue-50'}`}>
                      {getIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-[#1C1D22] dark:text-white">
                        {notification.title}
                      </h4>
                      <div className="w-1.5 h-1.5 bg-[#6C3FE2] rounded-full mt-1.5 shrink-0 shadow-[0_0_6px_rgba(108,63,226,0.6)]"></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{notification.message}</p>
                    <span className="text-[10px] font-bold text-gray-400 mt-2 block">{notification.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                  <Bell className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                </div>
                <h4 className="text-sm font-bold text-[#1C1D22] dark:text-white mb-1">All caught up!</h4>
                <p className="text-xs font-medium text-gray-500">You don&apos;t have any new notifications.</p>
              </div>
            )}
          </div>
          <div className="p-2 bg-[#FAFAFC] dark:bg-gray-900/50 border-t border-gray-50 dark:border-gray-800/50">
             <button className="w-full py-2.5 text-xs font-bold text-[#6C3FE2] hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-colors">
               View Notification History
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
