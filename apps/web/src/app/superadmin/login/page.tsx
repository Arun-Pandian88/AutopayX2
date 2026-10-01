'use client';

import { useState } from 'react';
import { ShieldAlert, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SuperadminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/dashboard/superadmin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Access denied.');
      }

      router.push('/superadmin/dashboard'); 
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#111111] p-10 rounded-[2rem] border border-[#6C3FE2]/30 shadow-[0_0_50px_rgba(108,63,226,0.15)]">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-[#6C3FE2]/10 rounded-2xl flex items-center justify-center border border-[#6C3FE2]/20 mb-6">
            <ShieldAlert className="w-8 h-8 text-[#6C3FE2]" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Superadmin Access
          </h2>
          <p className="mt-2 text-sm text-[#6C3FE2] font-medium">
            Restricted area. Authorized personnel only.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-900/20 border border-red-900/50 rounded-xl p-4 flex items-center">
              <span className="text-sm text-red-400 font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Admin Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#6C3FE2]/50 focus:border-[#6C3FE2] transition-all placeholder:text-gray-600"
                  placeholder="admin@autopayx.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Security Key</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#6C3FE2]/50 focus:border-[#6C3FE2] transition-all placeholder:text-gray-600"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#6C3FE2] hover:bg-[#5b32c6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C3FE2] focus:ring-offset-black transition-all disabled:opacity-70 group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Authenticate
                <ArrowRight className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 -mr-6 group-hover:mr-0" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
