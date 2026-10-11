const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/dashboard/transactions/page.tsx';
let data = fs.readFileSync(file, 'utf8');

// 1. Add state for delete modal
data = data.replace(
  "const [selectedTxn, setSelectedTxn] = useState<any>(null);",
  "const [selectedTxn, setSelectedTxn] = useState<any>(null);\n  const [txnToDelete, setTxnToDelete] = useState<string | null>(null);\n  const [isDeleting, setIsDeleting] = useState(false);"
);

// 2. Modify handleDeleteTransaction
const oldHandleDelete = `  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(\`/api/transactions/\${id}\`, {
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
    }
  };`;

const newHandleDelete = `  const handleDeleteTransaction = async () => {
    if (!txnToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(\`/api/transactions/\${txnToDelete}\`, {
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
  };`;

data = data.replace(oldHandleDelete, newHandleDelete);

// 3. Change onClick handlers to use setTxnToDelete
data = data.replace(
  /onClick=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*handleDeleteTransaction\(t\.id\);\s*\}\}/g,
  "onClick={(e) => { e.stopPropagation(); setTxnToDelete(t.id); }}"
);

data = data.replace(
  /onClick=\{\(\) => handleDeleteTransaction\(selectedTxn\.id\)\}/g,
  "onClick={() => setTxnToDelete(selectedTxn.id)}"
);

// 4. Add the Custom Delete Modal before the final </div>
const deleteModal = `
        {/* Delete Confirmation Modal */}
        {txnToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
            <div 
              className="bg-white dark:bg-[#1C1D22] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform scale-100 animate-slide-up"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Transaction?</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                  Are you sure you want to delete this transaction? This action cannot be undone and will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setTxnToDelete(null)}
                    disabled={isDeleting}
                    className="flex-1 py-3 px-4 bg-gray-100 dark:bg-[#2d2e33] text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteTransaction}
                    disabled={isDeleting}
                    className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
`;

data = data.replace(
  "      </div>\n    </div>\n  );\n}\n",
  deleteModal + "      </div>\n    </div>\n  );\n}\n"
);

fs.writeFileSync(file, data);
