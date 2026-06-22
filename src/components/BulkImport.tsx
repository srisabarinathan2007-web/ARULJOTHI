import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { api } from '../services/api';

interface BulkImportProps {
  onClose: () => void;
  type: 'vehicles' | 'tax' | 'billing';
}

export default function BulkImport({ onClose, type }: BulkImportProps) {
  const [data, setData] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processRows = async (rows: any[]) => {
    try {
      const res = await api.bulkImport(type, rows);
      if (res.success) {
        setStatus({ type: 'success', message: `${res.count} records imported successfully.` });
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 2000);
      } else {
        throw new Error('Import failed');
      }
    } catch (error) {
      console.error("Bulk import failed:", error);
      setStatus({ type: 'error', message: 'Failed to process bulk import.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const bstr = event.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows = XLSX.utils.sheet_to_json(ws);
        await processRows(rows);
      } catch (error) {
        setStatus({ type: 'error', message: 'Invalid Excel file format.' });
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (!data.trim()) return;
    setLoading(true);
    try {
      const rows = data.trim().split('\n').map(r => {
        const fields = r.split(',').map(f => f.trim());
        if (type === 'vehicles') return { plateNumber: fields[0], ownerName: fields[1], phoneNumber: fields[2], fcExpiry: fields[3] };
        if (type === 'tax') return { plateNumber: fields[0], ownerName: fields[1], taxType: fields[2], taxAmount: fields[3] };
        return { date: fields[0], customerName: fields[1], vehicleNumber: fields[2], amount: fields[3] };
      });
      await processRows(rows);
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to import data.' });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-modern-text/40 backdrop-blur-md" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-10 border-b border-modern-border flex items-center justify-between bg-white">
          <div className="flex items-center gap-6">
            <div className="bg-modern-blue/5 p-3 rounded-2xl border border-modern-blue/10">
              <Upload className="w-6 h-6 text-modern-blue" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-modern-text">Bulk Import</h2>
              <p className="text-modern-muted text-[10px] font-black uppercase tracking-[0.2em] mt-1">Direct CSV/Text Injection</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-modern-muted hover:bg-slate-50 rounded-xl transition-all"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-12 space-y-8 overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="p-10 border-2 border-dashed border-modern-border rounded-2xl hover:border-modern-blue/40 hover:bg-modern-blue/5 transition-all text-center cursor-pointer group"
            >
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.xls,.csv" className="hidden" />
              <div className="bg-modern-blue/10 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-8 h-8 text-modern-blue" />
              </div>
              <h3 className="text-sm font-bold text-modern-text mb-2">Upload Excel / CSV</h3>
              <p className="text-[10px] text-modern-muted uppercase font-black tracking-widest leading-relaxed">Recommended for large datasets</p>
            </div>

            <div className="p-10 border border-modern-border rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-200/50 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-modern-text mb-2">Manual Entry</h3>
              <p className="text-[10px] text-modern-muted uppercase font-black tracking-widest leading-relaxed">Paste your raw data lines below</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">Text Input Buffer</label>
            <textarea
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder={
                type === 'vehicles' ? "TN01AB1234, John Doe, 9876543210, 2025-12-31" :
                type === 'tax' ? "TN01AB1234, John Doe, Quarterly, 1500" :
                "2023-11-01, John Doe, TN01AB1234, 500"
              }
              className="w-full h-48 p-6 modern-input font-mono text-xs resize-none placeholder:opacity-30"
            />
          </div>

          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`p-6 rounded-2xl border flex items-center gap-4 ${
                  status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
                }`}
              >
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span className="text-xs font-bold uppercase tracking-widest">{status.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleImport}
            disabled={loading || !data.trim()}
            className="modern-button-primary w-full flex items-center justify-center gap-4 py-5"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-[11px] font-black uppercase tracking-widest">Execute Import</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
