'use client';

import { useEffect, useState, useRef } from 'react';
import { Users, Loader2, Search, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import PageBanner, { bannerConfigs } from '@/components/PageBanner';

function StatusDropdown({ status, onChange }: { status: string, onChange: (newStatus: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { value: 'active', label: 'Active', color: 'text-green-600 dark:text-green-400' },
    { value: 'inactive', label: 'Inactive', color: 'text-gray-600 dark:text-gray-400' },
    { value: 'suspended', label: 'Suspended', color: 'text-red-600 dark:text-red-400' }
  ];

  const currentOption = options.find(o => o.value === status) || options[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-32 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6C3FE2]/50 hover:border-[#6C3FE2]/50 transition-colors shadow-sm"
      >
        <span className={currentOption.color}>{currentOption.label}</span>
        <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 origin-top-right bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${option.value === status ? 'bg-[#6C3FE2]/10 text-[#6C3FE2]' : option.color}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MerchantsManagement() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, merchantId: string, newStatus: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!userLoading && (!user || user.role !== 'superadmin')) {
      router.replace('/dashboard');
    }
  }, [user, userLoading, router]);

  const fetchMerchants = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/superadmin/merchants`, {
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        setMerchants(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'superadmin') {
      fetchMerchants();
    }
  }, [user]);

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setConfirmModal({ isOpen: true, merchantId: id, newStatus });
  };

  const confirmUpdate = async () => {
    if (!confirmModal) return;
    setIsUpdating(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/superadmin/merchants/${confirmModal.merchantId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: confirmModal.newStatus }),
      });
      if (res.ok) {
        fetchMerchants();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
      setConfirmModal(null);
    }
  };

  const filteredMerchants = merchants.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.business_name && m.business_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (userLoading || loading) {
    return <div className="flex justify-center mt-20"><Loader2 className="w-10 h-10 animate-spin text-[#6C3FE2]" /></div>;
  }

  return (
    <>
      <div className="mt-8 max-w-6xl mx-auto space-y-8 animate-fade-in relative">
        <PageBanner pageKey="superadmin_merchants" {...bannerConfigs.superadmin_merchants} />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Merchants</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage and monitor all tenant accounts.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email or business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3FE2]/50 shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 text-sm uppercase tracking-wider">
                  <th className="pb-4 font-bold">Merchant Name</th>
                  <th className="pb-4 font-bold">Business Name</th>
                  <th className="pb-4 font-bold">Email</th>
                  <th className="pb-4 font-bold">Status</th>
                  <th className="pb-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300">
                {filteredMerchants.map((merchant: any) => (
                  <tr key={merchant.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 font-bold text-gray-900 dark:text-white">{merchant.name}</td>
                    <td className="py-4 text-gray-500 dark:text-gray-400 font-medium">{merchant.business_name || 'N/A'}</td>
                    <td className="py-4 text-gray-500 dark:text-gray-400">{merchant.email}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        merchant.status === 'active' 
                          ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20' 
                          : merchant.status === 'suspended'
                            ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                            : 'bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20'
                      }`}>
                        {merchant.status === 'active' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {merchant.status === 'suspended' && <XCircle className="w-3 h-3 mr-1" />}
                        {merchant.status.charAt(0).toUpperCase() + merchant.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <StatusDropdown 
                        status={merchant.status} 
                        onChange={(newStatus) => handleUpdateStatus(merchant.id, newStatus)} 
                      />
                    </td>
                  </tr>
                ))}
                {filteredMerchants.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400 dark:text-gray-500 font-medium">
                      <Users className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                      No merchants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {confirmModal?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#1C1D22] rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-gray-800 transform scale-100 animate-fade-in">
            <div className="w-16 h-16 bg-[#6C3FE2]/10 text-[#6C3FE2] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 8v4"></path>
                <path d="M12 16h.01"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">Change Status?</h3>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">
              Are you sure you want to change this merchant's status to <span className="font-bold text-gray-900 dark:text-white">{confirmModal.newStatus}</span>?
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setConfirmModal(null)}
                disabled={isUpdating}
                className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmUpdate}
                disabled={isUpdating}
                className="flex-1 bg-[#6C3FE2] hover:bg-[#5b32c6] text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
