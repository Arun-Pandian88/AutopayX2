'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Zap, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/dashboard/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Request failed');
      }

      setSuccess(true);
      // For demo purposes, we capture the token to show a link
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#111111] flex relative">
      
      {/* Left Column - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-[#6C3FE2] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-black opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex items-center">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-[#6C3FE2]" />
          </div>
          <span className="ml-4 text-white font-bold text-2xl tracking-tight">AutoPayX</span>
        </div>

        <div className="relative z-10 space-y-8">
          <h1 className="text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
            Reset Your<br/>Password
          </h1>
          <p className="text-lg text-white/80 font-medium max-w-md">
            Don't worry, it happens to the best of us. We'll help you get back into your account.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-white/60 text-sm font-medium">
            © {new Date().getFullYear()} AutoPayX Inc. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative">
        
        <Link href="/login" className="absolute top-8 left-8 lg:left-12 flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Link>

        {/* Mobile Logo (Visible only on mobile) */}
        <div className="flex lg:hidden items-center justify-center mb-10 mt-8">
          <div className="w-12 h-12 bg-[#6C3FE2] rounded-2xl flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="ml-4 text-[#1C1D22] dark:text-white font-bold text-2xl tracking-tight">AutoPayX</span>
        </div>

        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          
          <div>
            <h2 className="text-3xl font-extrabold text-[#1C1D22] dark:text-white tracking-tight">
              Forgot Password
            </h2>
            <p className="mt-2 text-sm text-gray-500 font-medium">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          <div className="mt-8">
            {success ? (
               <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-2xl p-8 text-center animate-fade-in">
                 <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-500" />
                 </div>
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Check your email</h3>
                 <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                   We sent a password reset link to <br/><span className="font-bold text-gray-900 dark:text-gray-300">{email}</span>
                 </p>
                 
                 {/* For DEMO purposes only - simulating email receipt */}
                 {resetToken && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-bold">Demo Mode Only</p>
                      <Link href={`/reset-password?token=${resetToken}`} className="block w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-[#6C3FE2] font-bold text-sm transition-colors text-center border border-gray-200 dark:border-gray-700">
                         Simulate clicking email link
                      </Link>
                    </div>
                 )}
               </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl p-4 flex items-center animate-fade-in">
                    <span className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#1C1D22] border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3FE2]/30 focus:border-[#6C3FE2]/50 transition-all shadow-sm placeholder:text-gray-400"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#6C3FE2] hover:bg-[#5b32c6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C3FE2] transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
