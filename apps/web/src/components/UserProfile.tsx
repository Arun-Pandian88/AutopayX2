'use client';

import { useUser } from '@/context/UserContext';
import { UserCircle } from 'lucide-react';

export default function UserProfile() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center p-2 animate-pulse mt-4 mb-4">
        <div className="w-8 h-8 bg-white/20 rounded-full shrink-0"></div>
        <div className="ml-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity w-32">
          <div className="h-3 bg-white/20 rounded w-full"></div>
          <div className="h-2 bg-white/20 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center p-2 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 cursor-pointer mt-4 mb-4">
      <div className="w-8 h-8 bg-indigo-500 rounded-full shrink-0 flex items-center justify-center text-white font-bold shadow-inner text-sm">
        {user?.name?.charAt(0)?.toUpperCase() || <UserCircle className="w-5 h-5" />}
      </div>
      <div className="ml-4 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
        <span className="text-white font-bold text-sm truncate">{user?.name || 'Guest'}</span>
        <span className="text-white/50 text-xs truncate">{user?.email || 'Not logged in'}</span>
      </div>
    </div>
  );
}
