import React, { useState, useEffect } from 'react';
import { X, Save, Calculator, User, Hash, Calendar, Loader2, IndianRupee, FileText, Car, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { TaxRecord } from '../types';

interface TaxFormProps {
  onClose: () => void;
  initialData?: TaxRecord | null;
}

export default function TaxForm({ onClose, initialData }: TaxFormProps) {
  const [loading, setLoading] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [formData, setFormData] = useState<Partial<TaxRecord>>({
    plateNumber: '',
    ownerName: '',
    phoneNumber: '',
    taxType: 'Quarter',
    taxAmount: '',
    gt: '',
    information: '',
    paidDate: new Date().toISOString().split('T')[0],
    inDate: '',
    taxExpiry: '',
    taxPeriod: ''
  });

  const selectedYear = new Date().getFullYear();

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const getQuarterName = (q: string) => {
    if (q === 'q1') return `01-04-${selectedYear} to 30-06-${selectedYear}`;
    if (q === 'q2') return `01-07-${selectedYear} to 30-09-${selectedYear}`;
    if (q === 'q3') return `01-10-${selectedYear} to 31-12-${selectedYear}`;
    if (q === 'q4') return `01-01-${selectedYear + 1} to 31-03-${selectedYear + 1}`;
    return q;
  };

  const getDerivedTaxTypeValue = (type?: string, period?: string) => {
    if (!type) return [];
    const p = (period || '').toLowerCase();
    
    if (type === 'Yearly' || p.includes(`01-04-${selectedYear} to 31-03-${selectedYear + 1}`)) return ['Yearly'];
    if (type === 'Life Time') return ['Life Time'];
    if (type === 'Half Yearly' || p.includes('04-year to 30-09-year')) return ['Half Yearly'];
    
    if (type === 'Quarter' || p.includes('01-04') || p.includes('01-07') || p.includes('01-10') || p.includes('01-01')) {
      const selections: string[] = [];
      
      if (p.includes(`01-04-${selectedYear}`)) selections.push('q1');
      if (p.includes(`01-07-${selectedYear}`)) selections.push('q2');
      if (p.includes(`01-10-${selectedYear}`)) selections.push('q3');
      if (p.includes(`01-01-${selectedYear + 1}`)) selections.push('q4');
      
      // Legacy name support
      if (p.includes('apr-jun')) selections.push('q1');
      if (p.includes('jul-sep')) selections.push('q2');
      if (p.includes('oct-dec')) selections.push('q3');
      if (p.includes('jan-mar')) selections.push('q4');

      return selections.length > 0 ? [...new Set(selections)] : ['q1'];
    }
    return [type];
  };

  const getPeriodForSelections = (selections: string[]) => {
    if (selections.includes('Yearly')) return `01-04-${selectedYear} to 31-03-${selectedYear + 1}`;
    if (selections.includes('Life Time')) return 'Life Time';
    if (selections.includes('Half Yearly')) return `01-04-${selectedYear} to 30-09-${selectedYear}`;
    
    const quarters = selections.filter(s => s.startsWith('q')).sort();
    if (quarters.length === 0) return '';
    
    return quarters.map(q => getQuarterName(q)).join(' ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        plateNumber: formData.plateNumber?.toUpperCase()
      };

      if (initialData?.id) {
        await api.updateTaxRecord(initialData.id, dataToSave);
      } else {
        await api.createTaxRecord(dataToSave);
      }
      onClose();
      window.location.reload(); 
    } catch (error) {
      console.error("Error saving tax record:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentSelections = getDerivedTaxTypeValue(formData.taxType, formData.taxPeriod);
  const isAll4Selected = currentSelections.length === 4 && currentSelections.every(s => s.startsWith('q'));

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
              <Calculator className="w-6 h-6 text-modern-blue" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-modern-text">{initialData ? 'Update Tax' : 'New Tax Entry'}</h2>
              <p className="text-modern-muted text-[10px] font-black uppercase tracking-[0.2em] mt-1">Compliance Ledger</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-modern-muted hover:bg-slate-50 rounded-xl transition-all"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-12 space-y-8 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">Plate Number</label>
              <div className="modern-input flex items-center gap-4 p-0 px-6 focus-within:ring-4 focus-within:ring-modern-blue/10 focus-within:border-modern-blue">
                <Car className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input 
                  type="text" value={formData.plateNumber} placeholder="TN..." 
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                  className="bg-transparent border-none outline-none py-4 w-full font-bold text-modern-text placeholder:text-slate-300" 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">Owner Name</label>
              <div className="modern-input flex items-center gap-4 p-0 px-6 focus-within:ring-4 focus-within:ring-modern-blue/10 focus-within:border-modern-blue">
                <User className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input 
                  type="text" value={formData.ownerName} 
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="bg-transparent border-none outline-none py-4 w-full font-bold text-modern-text placeholder:text-slate-300" 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2 relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">Tax Type</label>
              <div 
                className="modern-input flex items-center justify-between gap-4 p-0 px-6 focus-within:ring-4 focus-within:ring-modern-blue/10 focus-within:border-modern-blue cursor-pointer"
                onClick={() => setShowSelector(!showSelector)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <Calculator className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <span className="font-bold py-4 text-modern-text truncate max-w-[200px]">
                    {formData.taxType === 'Quarter' ? currentSelections.map(q => q.toUpperCase()).join(', ') : formData.taxType || 'Select'}
                  </span>
                </div>
                <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${showSelector ? 'rotate-90' : ''}`} />
              </div>

              <AnimatePresence>
                {showSelector && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 top-full mt-2 w-64 bg-white border border-slate-200 shadow-2xl rounded-2xl z-[250] py-4 overflow-hidden"
                  >
                    {[
                      { id: 'Yearly', label: `Yearly (01-04-${selectedYear} to 31-03-${selectedYear+1})` },
                      { id: 'Half Yearly', label: `Half Yearly (01-04-${selectedYear} to 30-09-${selectedYear})` },
                      { id: 'all_q', label: 'All 4 Quarters' },
                      { id: 'q1', label: `Q1: 01-04-${selectedYear} to 30-06-${selectedYear}` },
                      { id: 'q2', label: `Q2: 01-07-${selectedYear} to 30-09-${selectedYear}` },
                      { id: 'q3', label: `Q3: 01-10-${selectedYear} to 31-12-${selectedYear}` },
                      { id: 'q4', label: `Q4: 01-01-${selectedYear+1} to 31-03-${selectedYear+1}` },
                      { id: 'Life Time', label: 'Life Time' }
                    ].map((opt) => {
                      const isSelected = opt.id === 'Yearly' || opt.id === 'Life Time' || opt.id === 'Half Yearly'
                        ? formData.taxType === opt.id 
                        : opt.id === 'all_q' ? isAll4Selected : currentSelections.includes(opt.id);

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          className={`w-full text-left px-6 py-3 text-xs font-bold flex items-center justify-between hover:bg-slate-50 transition-colors ${isSelected ? 'text-modern-blue bg-modern-blue/5' : 'text-slate-600'}`}
                          onClick={() => {
                            let nextType = formData.taxType;
                            let nextSelections = [...currentSelections];

                            if (opt.id === 'Yearly' || opt.id === 'Life Time' || opt.id === 'Half Yearly') {
                              nextType = opt.id;
                              nextSelections = [opt.id];
                              setShowSelector(false);
                            } else if (opt.id === 'all_q') {
                              nextType = 'Quarter';
                              nextSelections = ['q1', 'q2', 'q3', 'q4'];
                              setShowSelector(false);
                            } else {
                              // If it's a specific quarter selection, we set both type and period
                              if (nextSelections.includes('Yearly') || nextSelections.includes('Life Time')) nextSelections = [];
                              if (nextSelections.includes(opt.id)) {
                                nextSelections = nextSelections.filter(s => s !== opt.id);
                              } else {
                                nextSelections.push(opt.id);
                              }
                              
                              const nextPeriod = getPeriodForSelections(nextSelections);
                              // User wants these dates to appear in tax type also
                              nextType = nextPeriod; 
                            }

                            const nextPeriod = getPeriodForSelections(nextSelections);
                            setFormData({ ...formData, taxType: nextType, taxPeriod: nextPeriod });
                          }}
                        >
                          {opt.label}
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-modern-blue" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">Tax Period</label>
              <div className="modern-input flex items-center gap-4 p-0 px-6 bg-slate-50/50">
                <Calendar className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input 
                  type="text" 
                  readOnly 
                  value={formData.taxPeriod} 
                  placeholder="Auto-calculated period..."
                  className="bg-transparent border-none outline-none py-4 w-full font-bold text-modern-text placeholder:text-slate-300 pointer-events-none" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">Tax Amount</label>
              <div className="modern-input flex items-center gap-4 p-0 px-6 focus-within:ring-4 focus-within:ring-modern-blue/10 focus-within:border-modern-blue">
                <IndianRupee className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input 
                  type="text" value={formData.taxAmount} 
                  onChange={(e) => setFormData({ ...formData, taxAmount: e.target.value })}
                  className="bg-transparent border-none outline-none py-4 w-full font-bold text-modern-text placeholder:text-slate-300" 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">In Date</label>
              <div className="modern-input flex items-center gap-4 p-0 px-6 focus-within:ring-4 focus-within:ring-modern-blue/10 focus-within:border-modern-blue">
                <Calendar className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input 
                  type="date" value={formData.inDate} 
                  onChange={(e) => setFormData({ ...formData, inDate: e.target.value })}
                  className="bg-transparent border-none outline-none py-4 w-full font-bold text-modern-text cursor-pointer" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">Paid Date</label>
              <div className="modern-input flex items-center gap-4 p-0 px-6 focus-within:ring-4 focus-within:ring-modern-blue/10 focus-within:border-modern-blue">
                <Calendar className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input 
                  type="date" value={formData.paidDate} 
                  onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                  className="bg-transparent border-none outline-none py-4 w-full font-bold text-modern-text cursor-pointer" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">Tax Expiry</label>
              <div className="modern-input flex items-center gap-4 p-0 px-6 focus-within:ring-4 focus-within:ring-modern-blue/10 focus-within:border-modern-blue">
                <Calendar className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input 
                  type="date" value={formData.taxExpiry} 
                  onChange={(e) => setFormData({ ...formData, taxExpiry: e.target.value })}
                  className="bg-transparent border-none outline-none py-4 w-full font-bold text-modern-text cursor-pointer" 
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">Additional Information</label>
            <textarea 
              value={formData.information} 
              onChange={(e) => setFormData({ ...formData, information: e.target.value })}
              className="modern-input w-full h-32 resize-none p-6" placeholder="..."
            />
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
                <span className="text-[11px] font-black uppercase tracking-widest">Generate Record</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
