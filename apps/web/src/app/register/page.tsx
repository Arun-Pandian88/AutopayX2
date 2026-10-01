'use client';

import { useState } from 'react';
import { Zap, Mail, Lock, User, Briefcase, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/dashboard/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, business_name: businessName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      // Save email/phone to local storage so settings page can show it
      localStorage.setItem('userEmail', email);

      router.push('/dashboard');
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0B] flex transition-colors">
      
      {/* Left Column - Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#6C3FE2] relative overflow-hidden flex-col justify-center items-center p-12 border-r border-indigo-400/20">
        {/* Abstract Background Shapes - More Premium Purple style */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full bg-gradient-to-br from-white/10 via-purple-300/5 to-transparent blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-indigo-900/30 to-transparent blur-[80px]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-xl">
          <div className="flex items-center justify-center mb-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.2)] overflow-hidden p-2 relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/autopayx-icon.png" alt="A" className="w-full h-full object-contain relative z-10" />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/autopayx-logo.png" alt="AutoPayX" className="h-12 object-contain ml-4 brightness-0 invert opacity-100" />
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] mb-6 tracking-tight">
            The smartest way to collect UPI payments instantly.
          </h1>
          <p className="text-white/80 text-lg font-medium max-w-md mx-auto mb-10 leading-relaxed">
            Zero setup fees, bank-grade security, and real-time webhook verification for modern Indian businesses.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 opacity-100 max-w-lg">
            <div className="flex items-center text-white bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md shadow-lg shadow-black/10">
              <CheckCircle2 className="w-4 h-4 text-green-300 mr-2 shrink-0" />
              <span className="font-medium text-sm">100% Secure Payment</span>
            </div>
            <div className="flex items-center text-white bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md shadow-lg shadow-black/10">
              <CheckCircle2 className="w-4 h-4 text-green-300 mr-2 shrink-0" />
              <span className="font-medium text-sm">All UPI Supported</span>
            </div>
            <div className="flex items-center text-white bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md shadow-lg shadow-black/10">
              <CheckCircle2 className="w-4 h-4 text-green-300 mr-2 shrink-0" />
              <span className="font-medium text-sm">Instant Onboarding</span>
            </div>
            <div className="flex items-center text-white bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md shadow-lg shadow-black/10">
              <CheckCircle2 className="w-4 h-4 text-green-300 mr-2 shrink-0" />
              <span className="font-medium text-sm">Automated Verification</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 w-full text-center z-10">
          <p className="text-white/60 text-sm font-medium">
            © {new Date().getFullYear()} AutoPayX Inc. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative bg-white dark:bg-[#0A0A0B]">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent pointer-events-none dark:from-indigo-500/10"></div>
        
        {/* Mobile Logo (Visible only on mobile) */}
        <div className="flex lg:hidden items-center justify-center mb-10 relative z-10">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(108,63,226,0.2)] border border-[#6C3FE2]/20 overflow-hidden p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/autopayx-icon.png" alt="A" className="w-full h-full object-contain" />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/autopayx-logo.png" alt="AutoPayX" className="h-10 object-contain ml-4 dark:brightness-0 dark:invert" />
        </div>

        <div className="mx-auto w-full max-w-sm lg:max-w-md relative z-10">
          
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl lg:text-4xl font-black text-[#1C1D22] dark:text-white tracking-tight">
              Create an account
            </h2>
            <p className="mt-3 text-base text-gray-500 dark:text-gray-400 font-medium">
              Start accepting payments with AutoPayX
            </p>
          </div>

          <div className="bg-white dark:bg-[#111113] p-8 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-white/5">
            <form className="space-y-6" onSubmit={handleRegister}>
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 flex items-center animate-fade-in shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mr-3 shrink-0">
                    <span className="text-red-600 dark:text-red-400 font-bold">!</span>
                  </div>
                  <span className="text-sm text-red-700 dark:text-red-300 font-semibold leading-tight">{error}</span>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Full name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#6C3FE2]">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#6C3FE2] transition-colors" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 dark:bg-[#0A0A0B] border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#6C3FE2]/10 focus:border-[#6C3FE2] transition-all shadow-sm placeholder:text-gray-400"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Business name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#6C3FE2]">
                      <Briefcase className="h-5 w-5 text-gray-400 group-focus-within:text-[#6C3FE2] transition-colors" />
                    </div>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 dark:bg-[#0A0A0B] border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#6C3FE2]/10 focus:border-[#6C3FE2] transition-all shadow-sm placeholder:text-gray-400"
                      placeholder="Acme Corp"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Email or Phone Number
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#6C3FE2]">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#6C3FE2] transition-colors" />
                    </div>
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 dark:bg-[#0A0A0B] border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#6C3FE2]/10 focus:border-[#6C3FE2] transition-all shadow-sm placeholder:text-gray-400"
                      placeholder="hello@arunpandian.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#6C3FE2]">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#6C3FE2] transition-colors" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 pr-12 py-3.5 bg-gray-50/50 dark:bg-[#0A0A0B] border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#6C3FE2]/10 focus:border-[#6C3FE2] transition-all shadow-sm placeholder:text-gray-400"
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#6C3FE2]">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#6C3FE2] transition-colors" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-11 pr-12 py-3.5 bg-gray-50/50 dark:bg-[#0A0A0B] border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#6C3FE2]/10 focus:border-[#6C3FE2] transition-all shadow-sm placeholder:text-gray-400"
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-[0_8px_20px_rgba(108,63,226,0.25)] text-sm font-black text-white bg-gradient-to-r from-[#6C3FE2] to-[#8B5CF6] hover:from-[#5b32c6] hover:to-[#7c3aed] focus:outline-none focus:ring-4 focus:ring-[#6C3FE2]/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Create workspace
                      <ArrowRight className="ml-2 w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 -mr-6 group-hover:mr-0" />
                    </>
                  )}
                </button>
              </div>
              
            </form>
            
            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5 text-center">
              <p className="text-sm text-gray-500 font-medium">
                Already have an account?{' '}
                <Link href="/login" className="font-bold text-[#6C3FE2] hover:text-[#5b32c6] transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
          
        </div>
      </div>
      
    </div>
  );
}
