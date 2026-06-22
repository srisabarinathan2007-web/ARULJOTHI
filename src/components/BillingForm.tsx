import React, { useState, useEffect } from 'react';
import { X, Save, Receipt, User, Phone, Calendar, Loader2, IndianRupee, FileText, CreditCard, Car, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { BillingRecord } from '../types';

interface BillingFormProps {
  onClose: () => void;
  initialData?: BillingRecord | null;
}

export default function BillingForm({ onClose, initialData }: BillingFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<BillingRecord>>({
    customerName: '',
    phoneNumber: '',
    vehicleNumber: '',
    serviceDescription: '',
    amount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    paymentStatus: 'Pending',
    paymentMode: 'Cash',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    const amount = Number(formData.amount) || 0;
    const paid = Number(formData.paidAmount) || 0;
    const pending = amount - paid;
    const status = pending <= 0 ? 'Paid' : (paid > 0 ? 'Partial' : 'Pending');
    
    setFormData(prev => ({ 
      ...prev, 
      pendingAmount: pending > 0 ? pending : 0,
      paymentStatus: status as any
    }));
  }, [formData.amount, formData.paidAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        vehicleNumber: formData.vehicleNumber?.toUpperCase()
      };

      if (initialData?.id) {
        await api.updateBillingRecord(initialData.id, dataToSave);
      } else {
        await api.createBillingRecord(dataToSave);
      }
      onClose();
      window.location.reload(); 
    } catch (error) {
      console.error("Error saving bill:", error);
    } finally {
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
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-10 border-b border-modern-border flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <div className="bg-modern-blue/5 p-3 rounded-2xl border border-modern-blue/10">
              <Receipt className="w-6 h-6 text-modern-blue" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-modern-text">{initialData ? 'Adjust Invoice' : 'Generate Invoice'}</h2>
              <p className="text-modern-muted text-[10px] font-black uppercase tracking-[0.2em] mt-1">Cash Flow Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-modern-muted hover:bg-slate-50 rounded-xl transition-all"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-12 space-y-8 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">Customer Name</label>
              <div className="modern-input flex items-center gap-4 p-0 px-6 focus-within:ring-4 focus-within:ring-modern-blue/10 focus-within:border-modern-blue">
                <User className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input 
                  type="text" value={formData.customerName} 
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="bg-transparent border-none outline-none py-4 w-full font-bold text-modern-text placeholder:text-slate-300" 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">Vehicle Number</label>
              <div className="modern-input flex items-center gap-4 p-0 px-6 focus-within:ring-4 focus-within:ring-modern-blue/10 focus-within:border-modern-blue">
                <Car className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input 
                  type="text" value={formData.vehicleNumber} placeholder="TN..." 
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  className="bg-transparent border-none outline-none py-4 w-full font-bold text-modern-text placeholder:text-slate-300" 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">Total Amount</label>
              <div className="modern-input flex items-center gap-4 p-0 px-6 focus-within:ring-4 focus-within:ring-modern-blue/10 focus-within:border-modern-blue">
                <IndianRupee className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input 
                  type="number" value={formData.amount} 
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="bg-transparent border-none outline-none py-4 w-full font-bold text-modern-text placeholder:text-slate-300" 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">Paid Amount</label>
              <div className="modern-input flex items-center gap-4 p-0 px-6 focus-within:ring-4 focus-within:ring-modern-blue/10 focus-within:border-modern-blue">
                <CreditCard className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input 
                  type="number" value={formData.paidAmount} 
                  onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
                  className="bg-transparent border-none outline-none py-4 w-full font-bold text-modern-text placeholder:text-slate-300" 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">Payment Mode</label>
              <div className="modern-input flex items-center gap-4 p-0 px-6 focus-within:ring-4 focus-within:ring-modern-blue/10 focus-within:border-modern-blue">
                <Calculator className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <select 
                  value={formData.paymentMode} 
                  onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as any })}
                  className="bg-transparent border-none outline-none py-4 w-full font-bold text-modern-text appearance-none cursor-pointer"
                >
                  {['Cash', 'UPI', 'Bank Transfer', 'Cheque'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">Billing Date</label>
              <div className="modern-input flex items-center gap-4 p-0 px-6 focus-within:ring-4 focus-within:ring-modern-blue/10 focus-within:border-modern-blue">
                <Calendar className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input 
                  type="date" value={formData.date} 
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-transparent border-none outline-none py-4 w-full font-bold text-modern-text cursor-pointer" 
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">Service Description</label>
            <textarea 
              value={formData.serviceDescription} 
              onChange={(e) => setFormData({ ...formData, serviceDescription: e.target.value })}
              className="modern-input w-full h-32 resize-none" placeholder="Details of service provided..."
            />
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-modern-border flex justify-between items-center">
             <p className="text-[10px] font-black uppercase tracking-widest text-modern-muted">Outstanding Balance</p>
             <p className={`text-xl font-bold ${formData.pendingAmount && formData.pendingAmount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
               ₹{formData.pendingAmount}
             </p>
          </div>
        </form>

        <div className="p-10 border-t border-modern-border bg-white sticky bottom-0 z-10">
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="modern-button-primary w-full flex items-center justify-center gap-4 py-5"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                <FileText className="w-5 h-5" />
                <span className="text-[11px] font-black uppercase tracking-widest">Finalize Invoice</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
