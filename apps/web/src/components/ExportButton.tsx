'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileJson, FileText, FileSpreadsheet } from 'lucide-react';

export default function ExportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async (format: string) => {
    setIsOpen(false);
    setIsExporting(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/transactions`, {
        credentials: 'include'
      });
      const data = await res.json();
      
      let transactions = [];
      if (data && data.success && data.data && data.data.length > 0) {
        transactions = data.data;
      } else {
        // Fallback to sample data for demonstration if no real transactions exist
        transactions = [
          { id: 'tx_1', amount: '150.00', status: 'success', payment_method: 'UPI', date: new Date().toISOString() },
          { id: 'tx_2', amount: '299.00', status: 'processing', payment_method: 'Card', date: new Date().toISOString() },
          { id: 'tx_3', amount: '99.00', status: 'success', payment_method: 'Netbanking', date: new Date().toISOString() }
        ];
      }

      let content = '';
      let mimeType = '';
      let filename = `autopayx_export_${new Date().toISOString().split('T')[0]}`;

      if (format === 'json') {
        content = JSON.stringify(transactions, null, 2);
        mimeType = 'application/json';
        filename += '.json';
      } else if (format === 'csv') {
        if (transactions.length > 0) {
          const headers = Object.keys(transactions[0]).join(',');
          const rows = transactions.map((t: any) => Object.values(t).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
          content = [headers, ...rows].join('\n');
        } else {
          content = 'No data available';
        }
        mimeType = 'text/csv';
        filename += '.csv';
      } else if (format === 'docs') {
        content = 'AutoPayX Data Export\n=====================\n\n';
        content += `Generated on: ${new Date().toLocaleString()}\n\n`;
        transactions.forEach((t: any, i: number) => {
          content += `Record ${i + 1}:\n`;
          Object.entries(t).forEach(([key, value]) => {
            content += `  ${key}: ${value}\n`;
          });
          content += '\n';
        });
        mimeType = 'text/plain';
        filename += '.txt';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed', error);
      alert('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-[#6C3FE2] dark:text-indigo-300 font-bold text-sm rounded-full shadow-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-100 dark:border-indigo-800/30 flex items-center gap-1 disabled:opacity-70 disabled:cursor-wait"
      >
        <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} /> {isExporting ? 'Exporting...' : 'Export data'}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1A1B20] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-800 py-2 z-50 animate-fade-in origin-top-right">
          <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Choose format</div>
          
          <button 
            onClick={() => handleExport('csv')}
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#25262B] transition-colors flex items-center group"
          >
            <FileSpreadsheet className="w-4 h-4 mr-3 text-gray-400 group-hover:text-green-500 transition-colors" />
            CSV (Excel)
          </button>
          
          <button 
            onClick={() => handleExport('json')}
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#25262B] transition-colors flex items-center group"
          >
            <FileJson className="w-4 h-4 mr-3 text-gray-400 group-hover:text-amber-500 transition-colors" />
            JSON Data
          </button>
          
          <button 
            onClick={() => handleExport('docs')}
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#25262B] transition-colors flex items-center group"
          >
            <FileText className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
            Document (Docs)
          </button>
        </div>
      )}
    </div>
  );
}
