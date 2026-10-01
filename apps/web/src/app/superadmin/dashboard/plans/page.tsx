'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Plus, Loader2, CheckCircle2, Trash2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import PageBanner, { bannerConfigs } from '@/components/PageBanner';

export default function PlansManagement() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '', interval: 'monthly', features: '', status: 'active' });
  
  // Delete Modal State
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!userLoading && (!user || user.role !== 'superadmin')) {
      router.replace('/dashboard');
    }
  }, [user, userLoading, router]);

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/superadmin/plans`, {
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        setPlans(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'superadmin') {
      fetchPlans();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        ...formData,
        features: typeof formData.features === 'string' ? formData.features.split(',').map(f => f.trim()).filter(Boolean) : formData.features
      };

      let res;
      if (editingId) {
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/superadmin/plans/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/superadmin/plans`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', price: '', interval: 'monthly', features: '', status: 'active' });
        fetchPlans(); // Refresh the list
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (plan: any) => {
    setEditingId(plan.id);
    setFormData({
      name: plan.name,
      price: plan.price,
      interval: plan.interval,
      features: plan.features.join(', '),
      status: plan.status || 'active'
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    setDeleteModalId(id);
  };

  const confirmDelete = async () => {
    if (!deleteModalId) return;
    setIsDeleting(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/superadmin/plans/${deleteModalId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setDeleteModalId(null);
        fetchPlans();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (userLoading || loading) {
    return <div className="flex justify-center mt-20"><Loader2 className="w-10 h-10 animate-spin text-[#6C3FE2]" /></div>;
  }

  return (
    <>
      <div className="mt-8 max-w-6xl mx-auto space-y-8 animate-fade-in relative">
        <PageBanner pageKey="superadmin_plans" {...bannerConfigs.superadmin_plans} />
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Subscription Plans</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Create and manage SaaS pricing tiers.</p>
          </div>
          <button 
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ name: '', price: '', interval: 'monthly', features: '', status: 'active' });
            }}
            className="flex items-center px-4 py-2 bg-[#6C3FE2] text-white rounded-xl font-bold hover:bg-[#5b32c6] transition-colors shadow-lg shadow-[#6C3FE2]/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            {showForm ? 'Cancel' : 'Add New Plan'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingId ? 'Edit Plan' : 'Create New Plan'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Plan Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Pro, Enterprise" className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#6C3FE2]/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Price (INR)</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="999.00" className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#6C3FE2]/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Billing Interval</label>
                  <select value={formData.interval} onChange={e => setFormData({...formData, interval: e.target.value})} className="w-full bg-white dark:bg-black border-2 border-[#A880FF] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-4 focus:ring-[#6C3FE2]/20 focus:border-[#6C3FE2] outline-none shadow-sm transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236C3FE2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-no-repeat bg-[position:right_1rem_center]">
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="forever">Forever (Lifetime)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Features (Comma separated)</label>
                  <input required value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} placeholder="Unlimited UPI, Analytics, Priority Support" className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#6C3FE2]/50 outline-none" />
                </div>
              </div>
              <button type="submit" disabled={formLoading} className="w-full bg-[#6C3FE2] text-white font-bold py-3 rounded-xl hover:bg-[#5b32c6] transition-colors flex justify-center mt-4">
                {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : editingId ? 'Update Plan' : 'Save Plan'}
              </button>
            </form>
          </div>
        )}

        {/* Plans List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...plans].sort((a: any, b: any) => {
            const getWeight = (name: string) => {
              const lower = name.toLowerCase();
              if (lower.includes('free')) return 0;
              if (lower.includes('pro')) return 1;
              return 2;
            };
            const weightA = getWeight(a.name);
            const weightB = getWeight(b.name);
            if (weightA !== weightB) return weightA - weightB;
            return parseFloat(a.price) - parseFloat(b.price);
          }).map((plan) => (
            <div key={plan.id} className="group relative bg-white dark:bg-[#1A1A1A] rounded-[32px] p-[1px] hover:shadow-[0_20px_60px_rgba(108,63,226,0.15)] transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-[#6C3FE2]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#6C3FE2]/5 to-[#6C3FE2]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative h-full bg-white dark:bg-[#1A1A1A] rounded-[31px] p-8 flex flex-col border border-gray-100 dark:border-[#2d2e33] group-hover:border-transparent transition-colors">
                <div className="flex-1">
                  <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 mb-2">{plan.name}</h3>
                  <div className="flex items-end mb-8 mt-4">
                    <span className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#6C3FE2] to-[#9D76F6]">₹{plan.price}</span>
                    <span className="text-gray-400 ml-2 font-bold text-sm tracking-wide uppercase mb-1">/ {plan.interval}</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features?.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start text-gray-600 dark:text-gray-300 font-medium text-sm leading-relaxed">
                        <div className="mt-0.5 mr-3 w-5 h-5 rounded-full bg-[#6C3FE2]/10 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#6C3FE2]" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex space-x-3 mt-4 pt-6 border-t border-gray-100 dark:border-white/5">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(plan); }} className="flex-1 bg-gradient-to-r from-[#6C3FE2]/10 to-[#6C3FE2]/5 hover:from-[#6C3FE2]/20 hover:to-[#6C3FE2]/10 text-[#6C3FE2] font-extrabold py-3.5 rounded-2xl transition-all duration-300 text-sm border border-[#6C3FE2]/20 hover:border-[#6C3FE2]/40 shadow-sm">
                    Edit Plan
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(plan.id); }} className="px-4 bg-gray-50 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 dark:text-gray-400 hover:text-red-500 font-bold rounded-2xl transition-all duration-300 border border-gray-200 dark:border-white/10 hover:border-red-200 flex items-center justify-center">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {plans.length === 0 && !showForm && (
            <div className="col-span-3 py-20 text-center border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-3xl">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">No plans created yet</h3>
              <p className="text-gray-500 mt-2">Click the Add New Plan button to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Delete Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#1C1D22] rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-gray-800 transform scale-100 animate-fade-in">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">Delete Plan?</h3>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">
              Are you sure you want to delete this plan? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setDeleteModalId(null)}
                disabled={isDeleting}
                className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
