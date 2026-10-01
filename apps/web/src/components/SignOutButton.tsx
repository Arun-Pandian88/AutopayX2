'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/dashboard/logout`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });
    } catch (e) {
      // Even if API fails, still clear local state and redirect
    }

    // Clear role cookie on client side
    document.cookie = 'user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    // Redirect to the correct login page
    const isSuperadmin = window.location.pathname.startsWith('/superadmin');
    const loginUrl = isSuperadmin ? '/superadmin/login' : '/login';
    
    router.replace(loginUrl);
    window.location.href = loginUrl;
  };

  return (
    <button
      onClick={handleSignOut}
      className="w-full flex items-center p-3 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all mt-2"
    >
      <LogOut className="w-6 h-6 shrink-0" />
      <span className="ml-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Sign Out</span>
    </button>
  );
}
