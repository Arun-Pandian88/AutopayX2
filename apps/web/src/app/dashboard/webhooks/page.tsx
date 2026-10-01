'use client';

import { useState, useEffect } from 'react';
import { Plus, Webhook, CheckCircle2, XCircle, Clock, X, Edit2, Trash2, Loader2, Save } from 'lucide-react';
import PageBanner, { bannerConfigs } from '@/components/PageBanner';

export default function WebhooksPage() {
  const [showModal, setShowModal] = useState(false);
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ id: '', url: '', events: 'all', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const fetchEndpoints = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/webhooks`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setEndpoints(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/webhooks/${formData.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/webhooks`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        fetchEndpoints();
        setShowModal(false);
      } else {
        alert('Failed to save webhook');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook endpoint?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/webhooks/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchEndpoints();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setFormData({ id: '', url: '', events: 'all', description: '' });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (ep: any) => {
    setFormData({ id: ep.id, url: ep.url, events: ep.events, description: ep.description || '' });
    setIsEditing(true);
    setShowModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans relative">
      <PageBanner pageKey="webhooks" {...bannerConfigs.webhooks} />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-[#1C1D22] mb-1">Webhooks</h2>
          <p className="text-gray-500 text-sm font-medium">Configure endpoints to receive real-time HTTP notifications for payment events.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#6C3FE2] text-white text-sm font-bold rounded-xl hover:bg-[#5a34bd] transition-all shadow-[0_4px_12px_rgba(108,63,226,0.3)] flex items-center active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Endpoint
        </button>
      </div>

      {/* Endpoints List */}
      <div className="space-y-4 mb-10">
        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-[#6C3FE2] animate-spin" /></div>
        ) : endpoints.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-[24px] p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-[#F4F5F9] rounded-full flex items-center justify-center mx-auto mb-4">
              <Webhook className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-[#1C1D22] mb-2">No webhooks configured</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">You haven't set up any webhook endpoints yet. Add one to start receiving real-time payment events.</p>
            <button onClick={openAddModal} className="px-5 py-2.5 bg-[#F4F5F9] text-[#1C1D22] text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors inline-flex items-center">
              <Plus className="w-4 h-4 mr-2" /> Create Endpoint
            </button>
          </div>
        ) : (
          endpoints.map((ep) => (
            <div key={ep.id} className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm flex items-center justify-between group transition-all hover:shadow-md">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f0eaff] flex items-center justify-center border border-[#6C3FE2]/10">
                  <Webhook className="w-6 h-6 text-[#6C3FE2]" />
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="font-bold text-[#1C1D22]">{ep.description || 'Webhook Endpoint'}</h3>
                    <span className="px-2 py-0.5 bg-[#D7F1E2] text-[#008945] text-[10px] font-bold rounded-md uppercase tracking-wider">Live</span>
                  </div>
                  <p className="text-sm text-gray-500 font-mono mt-1">{ep.url}</p>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Events</p>
                  <p className="text-sm font-bold text-[#1C1D22]">{ep.events}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => openEditModal(ep)}
                    className="p-2 border border-gray-100 rounded-xl text-gray-500 hover:bg-[#F4F5F9] hover:text-[#1C1D22] transition-colors"
                    title="Edit Endpoint"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(ep.id)}
                    className="p-2 border border-gray-100 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors"
                    title="Delete Endpoint"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Endpoint Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-50">
              <h3 className="text-xl font-bold text-[#1C1D22]">{isEditing ? 'Edit Endpoint' : 'Add Webhook Endpoint'}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEndpoint} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-[#1C1D22] mb-1.5">Description (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="e.g. Production Main Server" 
                    className="w-full bg-[#F4F5F9] border border-transparent rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FE2]/30 focus:bg-white focus:border-[#6C3FE2]/30 transition-all outline-none font-medium text-[#1C1D22]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1C1D22] mb-1.5">Endpoint URL</label>
                  <input 
                    type="url" 
                    required 
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://your-server.com/webhook" 
                    className="w-full bg-[#F4F5F9] border border-transparent rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FE2]/30 focus:bg-white focus:border-[#6C3FE2]/30 transition-all outline-none font-mono text-[#1C1D22]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1C1D22] mb-1.5">Events to send</label>
                  <select 
                    value={formData.events}
                    onChange={(e) => setFormData({...formData, events: e.target.value})}
                    className="w-full bg-[#F4F5F9] border border-transparent rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C3FE2]/30 focus:bg-white focus:border-[#6C3FE2]/30 transition-all outline-none font-medium text-[#1C1D22]"
                  >
                    <option value="all">All events</option>
                    <option value="payment.success">payment.success only</option>
                    <option value="payment.failed">payment.failed only</option>
                  </select>
                </div>
              </div>
              <div className="mt-8">
                <button type="submit" disabled={saving} className="w-full py-3.5 text-sm font-bold text-white bg-[#6C3FE2] hover:bg-[#5a34bd] rounded-xl shadow-[0_4px_12px_rgba(108,63,226,0.3)] transition-all flex items-center justify-center">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> {isEditing ? 'Save Changes' : 'Create Endpoint'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
