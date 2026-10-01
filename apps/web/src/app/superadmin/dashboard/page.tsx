'use client';

import { useEffect, useState } from 'react';
import { Users, Activity, Building, ShieldAlert, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import PageBanner, { bannerConfigs } from '@/components/PageBanner';

export default function SuperAdminDashboard() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // If finished loading user and user is NOT a superadmin, kick them out!
    if (!userLoading) {
      if (!user || user.role !== 'superadmin') {
        router.replace('/dashboard');
        return;
      }
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/superadmin/stats`, {
          credentials: 'include',
        });
        
        if (!res.ok) throw new Error('Failed to fetch stats');
        
        const json = await res.json();
        setStats(json.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'superadmin') {
      fetchStats();
    }
  }, [user]);

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 animate-spin text-[#6C3FE2]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 rounded-2xl text-red-600 dark:text-red-400">
        <ShieldAlert className="w-6 h-6 inline mr-2" />
        Error loading dashboard data: {error}
      </div>
    );
  }

  return (
    <div className="mt-8 max-w-6xl mx-auto space-y-8 animate-fade-in relative">
      <PageBanner pageKey="superadmin_dashboard" {...bannerConfigs.superadmin_dashboard} />
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">SaaS Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Real-time metrics across all tenants.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white dark:bg-[#1A1A1A] border border-[#6C3FE2]/20 rounded-3xl p-6 relative overflow-hidden group hover:border-[#6C3FE2]/40 transition-colors shadow-sm">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#6C3FE2]/10 rounded-full blur-2xl group-hover:bg-[#6C3FE2]/20 transition-all"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-gray-600 dark:text-gray-400 font-bold">Total Merchants</h3>
            <div className="w-10 h-10 bg-gray-50 dark:bg-black rounded-xl flex items-center justify-center border border-gray-100 dark:border-gray-800">
              <Users className="w-5 h-5 text-gray-500 dark:text-gray-300" />
            </div>
          </div>
          <p className="text-5xl font-extrabold text-gray-900 dark:text-white relative z-10">{stats?.totalMerchants || 0}</p>
        </div>

        <div className="bg-white dark:bg-[#1A1A1A] border border-green-200 dark:border-green-500/20 rounded-3xl p-6 relative overflow-hidden group hover:border-green-300 dark:hover:border-green-500/50 transition-colors shadow-sm">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-100 dark:bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-200 dark:group-hover:bg-green-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-gray-600 dark:text-gray-400 font-bold">Active Subscriptions</h3>
            <div className="w-10 h-10 bg-gray-50 dark:bg-black rounded-xl flex items-center justify-center border border-gray-100 dark:border-gray-800">
              <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
            </div>
          </div>
          <p className="text-5xl font-extrabold text-gray-900 dark:text-white relative z-10">{stats?.activeMerchants || 0}</p>
        </div>

        <div className="bg-white dark:bg-[#1A1A1A] border border-orange-200 dark:border-orange-500/20 rounded-3xl p-6 relative overflow-hidden group hover:border-orange-300 dark:hover:border-orange-500/50 transition-colors shadow-sm">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-100 dark:bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-200 dark:group-hover:bg-orange-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-gray-600 dark:text-gray-400 font-bold">Suspended Accounts</h3>
            <div className="w-10 h-10 bg-gray-50 dark:bg-black rounded-xl flex items-center justify-center border border-gray-100 dark:border-gray-800">
              <XCircle className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-5xl font-extrabold text-gray-900 dark:text-white relative z-10">{stats?.suspendedMerchants || 0}</p>
        </div>

      </div>

      {/* Latest Signups Table */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Building className="w-6 h-6 mr-3 text-[#6C3FE2]" />
            Recent Registrations
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 text-sm uppercase tracking-wider">
                <th className="pb-4 font-bold">Merchant Name</th>
                <th className="pb-4 font-bold">Business Name</th>
                <th className="pb-4 font-bold">Email</th>
                <th className="pb-4 font-bold">Status</th>
                <th className="pb-4 font-bold text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              {stats?.latestMerchants?.map((merchant: any) => (
                <tr key={merchant.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="py-4 font-bold text-gray-900 dark:text-white">{merchant.name}</td>
                  <td className="py-4 text-gray-500 dark:text-gray-400 font-medium">{merchant.business_name || 'N/A'}</td>
                  <td className="py-4 text-gray-500 dark:text-gray-400">{merchant.email}</td>
                  <td className="py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                      {merchant.status}
                    </span>
                  </td>
                  <td className="py-4 text-right text-gray-400 dark:text-gray-500 text-sm font-medium">
                    {new Date(merchant.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!stats?.latestMerchants || stats.latestMerchants.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 dark:text-gray-500 font-medium">
                    No merchants have registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
