'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, ArrowUpRight, ArrowDownRight, CreditCard, Activity, Trash2, Loader2 } from 'lucide-react';
import PageBanner, { bannerConfigs } from '@/components/PageBanner';

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [allTxns, setAllTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [txnToDelete, setTxnToDelete] = useState<string | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`/api/transactions`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setAllTxns(data.data || []);
      } else {
        setAllTxns([]);
      }
    } catch (err) {
      console.error(err);
      setAllTxns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDeleteTransaction = async () => {
    if (!txnToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/transactions/${txnToDelete}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        showToast('Transaction deleted successfully');
        setSelectedTxn(null);
        fetchTransactions();
      } else {
        showToast('Failed to delete transaction');
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting transaction');
    } finally {
      setIsDeleting(false);
      setTxnToDelete(null);
    }
  };

  const handleDeleteAllTransactions = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/transactions`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        showToast('All transactions deleted successfully');
        fetchTransactions();
      } else {
        showToast('Failed to delete transactions');
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting transactions');
    } finally {
      setIsDeleting(false);
      setShowDeleteAllModal(false);
    }
  };

  const filteredTxns = allTxns.filter(t => {
    const matchesSearch = (t.txn_id && t.txn_id.includes(search)) || 
                          (t.utr && t.utr.includes(search)) || 
                          (t.customer_email && t.customer_email.toLowerCase().includes(search.toLowerCase()));
    
    // Hide unpaid/processing transactions from the main view to prevent spam
    const isCompleted = t.status === 'success' || t.status === 'failed';
    
    return matchesSearch; // Changed: Show processing transactions too
  });

  return (
    <div>
      <PageBanner pageKey="transactions" {...bannerConfigs.transactions} />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Transactions</h2>
          <p className="text-gray-500 text-sm">View and manage all your payments across UPI intents and QR codes.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowDeleteAllModal(true)}
            className="px-4 py-2 bg-red-50 border border-red-100 text-sm font-medium rounded-lg text-red-600 hover:bg-red-100 transition-colors flex items-center shadow-sm active:scale-95"
            disabled={allTxns.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete All
          </button>
          <button 
            onClick={() => showToast("Exporting CSV...")}
            className="px-4 py-2 bg-white border border-gray-200 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Filters and Search */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
              placeholder="Search by Order ID, UTR, or Customer Email..."
            />
          </div>
          <button onClick={() => showToast("Filters coming soon")} className="px-4 py-2 bg-white border border-gray-200 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center shadow-sm active:scale-95">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px] relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
              <span className="text-sm font-medium text-gray-500">Loading transactions...</span>
            </div>
          )}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-100">
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Gateway App</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-4 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTxns.map((t, idx) => (
                <tr key={t.id} onClick={() => setSelectedTxn(t)} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${t.status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {t.status === 'failed' ? <Activity className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{t.txn_id}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{t.utr || 'Awaiting UTR'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-[#1C1D22]">{t.gateway_app || 'UPI Gateway'}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t.upi_id || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{t.customer_email || 'No email'}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t.customer_name || 'Anonymous'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {t.status === 'failed' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                        Failed
                      </span>
                    ) : t.status === 'processing' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                        Processing
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                        Success
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(t.createdAt).toLocaleDateString()}<br/>
                    <span className="text-xs">{new Date(t.createdAt).toLocaleTimeString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-gray-900">₹{t.amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-0.5">INR</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setTxnToDelete(t.id); }}
                      className="w-9 h-9 bg-red-50/80 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors shadow-sm ml-auto"
                      title="Delete Transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTxns.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No transactions found for "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <p className="text-sm text-gray-500">Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredTxns.length}</span> of <span className="font-medium">{filteredTxns.length}</span> results</p>
          <div className="flex space-x-2">
            <button className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-400 cursor-not-allowed">Previous</button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-400 cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {txnToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#1C1D22] mb-2">Delete Transaction</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete this transaction? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setTxnToDelete(null)}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteTransaction}
                className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center"
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0">
              <h3 className="text-xl font-bold text-[#1C1D22]">Transaction Details</h3>
              <button onClick={() => setSelectedTxn(null)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-colors">
                ✕
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              <div className="text-center mb-10">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm ${selectedTxn.status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-[#008945]'}`}>
                  {selectedTxn.status === 'failed' ? <ArrowDownRight className="w-8 h-8" /> : <ArrowUpRight className="w-8 h-8" />}
                </div>
                <p className="text-sm text-gray-500 font-medium mb-1">Amount {selectedTxn.status === 'failed' ? 'Failed' : 'Received'}</p>
                <h2 className="text-4xl font-black text-[#1C1D22] mb-3">₹{parseFloat(selectedTxn.amount).toLocaleString()}</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  selectedTxn.status === 'success' ? 'bg-green-100 text-[#008945]' : 
                  selectedTxn.status === 'failed' ? 'bg-red-100 text-red-700' : 
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedTxn.status.charAt(0).toUpperCase() + selectedTxn.status.slice(1)}
                </span>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Payment Info</h4>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Transaction ID</span>
                      <span className="text-sm font-mono font-medium text-gray-900">{selectedTxn.txn_id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Order ID</span>
                      <span className="text-sm font-mono font-medium text-gray-900">{selectedTxn.order_id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Bank UTR</span>
                      <span className="text-sm font-mono font-bold text-[#1C1D22]">{selectedTxn.utr || 'Pending'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Gateway App</span>
                      <span className="text-sm font-medium text-gray-900">{selectedTxn.gateway_app || 'UPI Gateway'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Receiving UPI ID</span>
                      <span className="text-sm font-medium text-gray-900">{selectedTxn.upi_id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Payment Method</span>
                      <span className="text-sm font-medium text-gray-900">{selectedTxn.payment_method || 'UPI'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Date</span>
                      <span className="text-sm font-medium text-gray-900">{new Date(selectedTxn.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Customer Info</h4>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Email</span>
                      <span className="text-sm font-medium text-gray-900">{selectedTxn.customer_email || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Name</span>
                      <span className="text-sm font-medium text-gray-900">{selectedTxn.customer_name || 'Walk-in customer'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-4">
              <button 
                onClick={() => setTxnToDelete(selectedTxn.id)}
                className="py-3 px-6 bg-red-50 border border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center flex-shrink-0 shadow-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </button>
              <button 
                onClick={() => setSelectedTxn(null)}
                className="flex-1 py-3 px-4 bg-[#1C1D22] text-white font-bold rounded-xl hover:bg-black transition-colors shadow-sm"
              >
                Close details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#1C1D22] mb-2">Delete All Transactions</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete ALL transactions? This action is permanent and cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteAllModal(false)}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAllTransactions}
                className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center"
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1C1D22] text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm flex items-center z-[200] animate-in slide-in-from-bottom-5">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
