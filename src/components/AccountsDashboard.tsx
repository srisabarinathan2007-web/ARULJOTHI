import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, IndianRupee, FileText, Calendar, Car, User, Settings2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import HighlightText from './HighlightText';

interface AccountEntry {
  id: string;
  date: string;
  vehicleNo: string;
  customerName: string;
  service: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export default function AccountsDashboard() {
  const [entries, setEntries] = useState<AccountEntry[]>(() => {
    const saved = localStorage.getItem('arul_jothi_accounts_entries');
    return saved ? JSON.parse(saved) : [];
  });

  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AccountEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const [formData, setFormData] = useState<Omit<AccountEntry, 'id'>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    vehicleNo: '',
    customerName: '',
    service: '',
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0
  });

  useEffect(() => {
    localStorage.setItem('arul_jothi_accounts_entries', JSON.stringify(entries));
  }, [entries]);

  // Handle pending amount calculation automatically
  useEffect(() => {
    const total = Number(formData.totalAmount) || 0;
    const paid = Number(formData.paidAmount) || 0;
    setFormData(prev => ({ ...prev, pendingAmount: total - paid }));
  }, [formData.totalAmount, formData.paidAmount]);

  useEffect(() => {
    if (editingEntry) {
      setFormData({
        date: editingEntry.date,
        vehicleNo: editingEntry.vehicleNo,
        customerName: editingEntry.customerName,
        service: editingEntry.service,
        totalAmount: editingEntry.totalAmount,
        paidAmount: editingEntry.paidAmount,
        pendingAmount: editingEntry.pendingAmount
      });
      setShowModal(true);
    }
  }, [editingEntry]);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEntry) {
      setEntries(entries.map(ent => ent.id === editingEntry.id ? { ...formData, id: ent.id } : ent));
      setEditingEntry(null);
    } else {
      const newEntry: AccountEntry = {
        ...formData,
        id: Date.now().toString()
      };
      setEntries([newEntry, ...entries]);
    }
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      vehicleNo: '',
      customerName: '',
      service: '',
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0
    });
  };

  const deleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this ledger entry?')) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const filteredEntries = entries.filter(e => {
    const cn = e.customerName || '';
    const vn = e.vehicleNo || '';
    const sv = e.service || '';
    const query = searchQuery.toLowerCase();
    return cn.toLowerCase().includes(query) ||
           vn.toLowerCase().includes(query) ||
           sv.toLowerCase().includes(query);
  });

  const totalOutstanding = entries.reduce((sum, e) => sum + e.pendingAmount, 0);

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div>
          <h2 className="text-4xl font-display font-bold text-modern-text tracking-tight">Accounts Ledger</h2>
          <p className="text-modern-muted text-sm font-medium mt-1">Financial entry terminal since 2009</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
              type="text"
              placeholder="Search Ledger..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(e.target.value.length > 0);
              }}
              className="bg-white border-2 border-modern-border pl-12 pr-6 py-3 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-modern-blue/10 focus:border-modern-blue outline-none transition-all w-64"
             />
             
             {/* Quick Search Dropdown */}
             <AnimatePresence>
               {showSearchResults && filteredEntries.length > 0 && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 10 }}
                   className="absolute left-0 top-full mt-2 w-[400px] bg-white rounded-2xl shadow-2xl border border-modern-border z-[100] overflow-hidden p-2"
                 >
                   <div className="px-4 py-2 border-b border-modern-border mb-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-modern-muted">Quick Results</span>
                   </div>
                   <div className="max-h-64 overflow-y-auto no-scrollbar space-y-1">
                     {filteredEntries.slice(0, 5).map(entry => (
                       <div 
                         key={entry.id}
                         onClick={() => {
                           setEditingEntry(entry);
                           setShowSearchResults(false);
                         }}
                         className="p-4 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-slate-100"
                       >
                         <div className="flex justify-between items-start">
                           <div>
                             <span className="text-xs font-black text-modern-blue mb-1 block">{entry.vehicleNo}</span>
                             <p className="text-sm font-bold text-modern-text">{entry.customerName}</p>
                             <p className="text-[10px] text-modern-muted">{entry.service}</p>
                           </div>
                           <div className="text-right">
                             <p className="text-xs font-black">₹{entry.totalAmount}</p>
                             <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${entry.pendingAmount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                               {entry.pendingAmount > 0 ? 'Pending' : 'Paid'}
                             </span>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
          <button 
            onClick={() => {
              setEditingEntry(null);
              resetForm();
              setShowModal(true);
            }}
            className="modern-button-primary flex items-center gap-3 py-4"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[11px] font-black uppercase tracking-widest">Create New Entry</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="modern-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-modern-border">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-modern-muted">Date</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-modern-muted">Vehicle Detail</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-modern-muted">Customer</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-modern-muted">Service Rendered</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-modern-muted text-right">Total</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-modern-muted text-right">Paid</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-modern-muted text-right">Pending</th>
                <th className="px-8 py-6 text-right no-print"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-modern-border">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6 text-sm font-bold text-modern-text">{format(new Date(entry.date), 'dd/MM/yyyy')}</td>
                  <td 
                    className="px-8 py-6 font-mono text-xs font-black text-modern-blue uppercase tracking-widest cursor-pointer hover:underline"
                    onClick={() => setEditingEntry(entry)}
                  >
                    <HighlightText text={entry.vehicleNo || 'N/A'} highlight={searchQuery} />
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-modern-text">
                    <HighlightText text={entry.customerName} highlight={searchQuery} />
                  </td>
                  <td className="px-8 py-6 text-sm text-modern-muted">
                    <HighlightText text={entry.service} highlight={searchQuery} />
                  </td>
                  <td className="px-8 py-6 text-sm font-black text-right text-modern-text">₹{entry.totalAmount.toLocaleString()}</td>
                  <td className="px-8 py-6 text-sm font-black text-right text-emerald-600 bg-emerald-50/20">₹{entry.paidAmount.toLocaleString()}</td>
                  <td className={`px-8 py-6 text-sm font-black text-right ${entry.pendingAmount > 0 ? 'text-rose-600 bg-rose-50/20' : 'text-slate-400'}`}>
                    ₹{entry.pendingAmount.toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right no-print">
                    <button 
                      onClick={() => deleteEntry(entry.id)}
                      className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-6 bg-slate-50 rounded-full">
                        <FileText className="w-10 h-10 text-slate-300" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-modern-text">No ledger entries found</p>
                        <p className="text-xs text-modern-muted mt-1">Start by creating your first entry</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Entry Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-10 border-b border-modern-border bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-display font-bold text-modern-text tracking-tight">
                    {editingEntry ? 'Edit Ledger Entry' : 'Create Ledger Entry'}
                  </h3>
                  <p className="text-xs text-modern-muted font-black uppercase tracking-widest mt-1">Account Terminal Entry Form</p>
                </div>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setEditingEntry(null);
                  }}
                  className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-modern-text"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleAddEntry} className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  {/* Date Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">Entry Date</label>
                    <div className="modern-input flex items-center gap-3 py-3 px-6">
                      <Calendar className="w-4 h-4 text-modern-blue" />
                      <input 
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="bg-transparent border-none outline-none w-full font-bold text-modern-text uppercase"
                      />
                    </div>
                  </div>

                  {/* Vehicle No */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">Vehicle Number</label>
                    <div className="modern-input flex items-center gap-3 py-3 px-6">
                      <Car className="w-4 h-4 text-modern-blue" />
                      <input 
                        type="text"
                        required
                        placeholder="TN 00 XX 0000"
                        value={formData.vehicleNo}
                        onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value.toUpperCase() })}
                        className="bg-transparent border-none outline-none w-full font-bold text-modern-text"
                      />
                    </div>
                  </div>

                  {/* Customer Name */}
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">Customer Full Name</label>
                    <div className="modern-input flex items-center gap-3 py-3 px-6">
                      <User className="w-4 h-4 text-modern-blue" />
                      <input 
                        type="text"
                        required
                        placeholder="Enter legal name"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        className="bg-transparent border-none outline-none w-full font-bold text-modern-text"
                      />
                    </div>
                  </div>

                  {/* Service */}
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">Service Description</label>
                    <div className="modern-input flex items-center gap-3 py-3 px-6">
                      <Settings2 className="w-4 h-4 text-modern-blue" />
                      <input 
                        type="text"
                        required
                        placeholder="e.g., Insurance Renewal, FC Support"
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="bg-transparent border-none outline-none w-full font-bold text-modern-text"
                      />
                    </div>
                  </div>

                  {/* Amount Grid */}
                  <div className="col-span-2 grid grid-cols-3 gap-6 bg-slate-50 p-8 rounded-[24px]">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted text-center block">Total Amount</label>
                      <div className="bg-white border-2 border-modern-border rounded-xl px-4 py-3 flex items-center justify-center gap-2">
                        <span className="text-slate-400 font-bold">₹</span>
                        <input 
                          type="number"
                          required
                          value={formData.totalAmount}
                          onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
                          className="bg-transparent border-none outline-none w-full font-black text-center text-lg [appearance:textfield]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 text-center block">Paid Amount</label>
                      <div className="bg-emerald-50/50 border-2 border-emerald-100 rounded-xl px-4 py-3 flex items-center justify-center gap-2">
                        <span className="text-emerald-400 font-bold">₹</span>
                        <input 
                          type="number"
                          required
                          value={formData.paidAmount}
                          onChange={(e) => setFormData({ ...formData, paidAmount: parseFloat(e.target.value) || 0 })}
                          className="bg-transparent border-none outline-none w-full font-black text-center text-lg text-emerald-700 [appearance:textfield]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-rose-600 text-center block">Pending Balance</label>
                      <div className="bg-rose-50/50 border-2 border-rose-100 rounded-xl px-4 py-3 flex items-center justify-center gap-2">
                         <span className="text-rose-400 font-bold">₹</span>
                         <input 
                          type="number"
                          readOnly
                          value={formData.pendingAmount}
                          className="bg-transparent border-none outline-none w-full font-black text-center text-lg text-rose-700 [appearance:textfield]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                   <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-[24px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                   >
                     Cancel
                   </button>
                   <button 
                    type="submit" 
                    className="flex-3 bg-modern-blue text-white py-5 rounded-[24px] font-black uppercase tracking-widest hover:shadow-xl hover:shadow-modern-blue/20 transition-all flex items-center justify-center gap-4"
                   >
                     Record Entry
                     <Plus className="w-5 h-5" />
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
