'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';

interface SignOutButtonProps {
  variant?: 'sidebar' | 'header';
}

export default function SignOutButton({ variant = 'sidebar' }: SignOutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await fetch(`/api/dashboard/logout`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });
    } catch (e) {
      // Proceed even if network request fails
    }

    // Clear client-accessible cookies
    document.cookie = 'user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    // Determine correct login URL
    const isSuperadmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/superadmin');
    const loginUrl = isSuperadmin ? '/superadmin/login' : '/login';

    // Force hard redirect to prevent Next.js client-cache loops
    window.location.replace(loginUrl);
  };

  if (variant === 'header') {
    return (
      <button
        onClick={handleSignOut}
        disabled={loading}
        title="Sign Out"
        aria-label="Sign Out"
        className="w-10 h-10 bg-white dark:bg-[#1C1D22] rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-red-500" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="w-full flex items-center p-3 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all mt-2 cursor-pointer disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-6 h-6 shrink-0 animate-spin" />
      ) : (
        <LogOut className="w-6 h-6 shrink-0" />
      )}
      <span className="ml-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        {loading ? 'Signing out...' : 'Sign Out'}
      </span>
    </button>
  );
}
