import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Printer, Download, Plus, Trash2, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import Logo from './Logo';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ManualRecord {
  id: string;
  customerName: string;
  vehicleNo: string;
  taxAmount: string;
  gt: string;
  sc: string;
}

export default function TaxReport() {
  const [globalName, setGlobalName] = useState(() => localStorage.getItem('manual_tax_report_customer_name') || '');
  const [showSC, setShowSC] = useState(() => localStorage.getItem('manual_tax_report_show_sc') === 'true');
  const [rows, setRows] = useState<ManualRecord[]>(() => {
    const saved = localStorage.getItem('manual_tax_report_data_v3');
    if (saved) return JSON.parse(saved);
    return [{ id: '1', customerName: '', vehicleNo: '', taxAmount: '', gt: '', sc: '' }];
  });

  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    localStorage.setItem('manual_tax_report_data_v3', JSON.stringify(rows));
  }, [rows]);

  useEffect(() => {
    localStorage.setItem('manual_tax_report_customer_name', globalName);
  }, [globalName]);

  useEffect(() => {
    localStorage.setItem('manual_tax_report_show_sc', showSC.toString());
  }, [showSC]);

  const addRow = () => {
    setRows(prev => [...prev, { 
      id: Math.random().toString(36).substr(2, 9), 
      customerName: '', 
      vehicleNo: '', 
      taxAmount: '', 
      gt: '' ,
      sc: ''
    }]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(prev => prev.filter(r => r.id !== id));
    } else {
      setRows([{ id: '1', customerName: '', vehicleNo: '', taxAmount: '', gt: '', sc: '' }]);
    }
  };

  const updateRow = (id: string, field: keyof ManualRecord, value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const stats = useMemo(() => {
    return rows.reduce((acc, r) => {
      const tax = Number(r.taxAmount) || 0;
      const gt = Number(r.gt) || 0;
      const sc = showSC ? (Number(r.sc) || 0) : 0;
      return {
        totalTax: acc.totalTax + tax,
        totalGT: acc.totalGT + gt,
        totalSC: acc.totalSC + sc,
        totalAmount: acc.totalAmount + (tax + gt + sc)
      };
    }, { totalTax: 0, totalGT: 0, totalSC: 0, totalAmount: 0 });
  }, [rows, showSC]);

  const handlePrint = () => {
    window.print();
  };

  const exportExcel = () => {
    const data = rows.map(r => ({
      'Customer Name': globalName,
      'Vehicle Number': r.vehicleNo,
      'Tax Amount': r.taxAmount,
      'GT': r.gt,
      ...(showSC ? { 'SC': r.sc } : {}),
      'Total Amount': (Number(r.taxAmount) || 0) + (Number(r.gt) || 0) + (showSC ? (Number(r.sc) || 0) : 0)
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tax Report');
    XLSX.writeFile(wb, `Manual_Tax_Report_${dateRange.start}.xlsx`);
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 no-print p-4">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-modern-text">Manual Tax Billing</h2>
          <p className="text-modern-muted text-sm font-medium mt-1">Create and print custom tax reports manually</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={addRow}
            className="modern-button-primary flex items-center gap-3 bg-modern-blue text-white"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[11px] font-black uppercase tracking-widest">Add Row</span>
          </button>
          <button onClick={exportExcel} className="modern-button-secondary flex items-center gap-3 border-emerald-100 text-emerald-600">
            <FileSpreadsheet className="w-5 h-5" />
            <span className="text-[11px] font-black uppercase tracking-widest">Excel</span>
          </button>
          <button onClick={handlePrint} className="modern-button-secondary flex items-center gap-3">
            <Printer className="w-5 h-5" />
            <span className="text-[11px] font-black uppercase tracking-widest">Print</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-10 no-print bg-white p-8 rounded-2xl border border-modern-border shadow-sm mx-4">
         <div className="flex-1 space-y-1">
           <label className="text-[9px] font-black uppercase tracking-widest text-modern-muted text-center block">Invoice Date Range</label>
           <div className="flex items-center gap-4">
             <input 
               type="date" 
               value={dateRange.start} 
               onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
               className="flex-1 bg-slate-50 border-none rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-modern-blue/10 cursor-pointer"
             />
             <span className="text-slate-400 font-bold">to</span>
             <input 
               type="date" 
               value={dateRange.end} 
               onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
               className="flex-1 bg-slate-50 border-none rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-modern-blue/10 cursor-pointer"
             />
           </div>
         </div>
         
         <div className="h-12 w-[1px] bg-slate-200" />

         <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-modern-muted text-center block">Show S C Row</label>
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
               <button 
                 onClick={() => setShowSC(true)}
                 className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${showSC ? 'bg-white shadow-sm text-modern-blue' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 Yes
               </button>
               <button 
                 onClick={() => setShowSC(false)}
                 className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!showSC ? 'bg-white shadow-sm text-modern-blue' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 No
               </button>
            </div>
         </div>
      </div>

      <div className="flex justify-center p-4 bg-slate-50/50 rounded-3xl mx-4 print:p-0 print:m-0 print:bg-transparent">
        <div className="bg-white shadow-2xl w-full max-w-[210mm] min-h-[297mm] flex flex-col border border-modern-border overflow-hidden relative print:shadow-none print:border-none print:w-[210mm] print:h-[297mm] print:overflow-visible">
          {/* Edge-to-Edge Geometric Accents */}
          <div className="bg-[#0097a7] w-96 h-96 absolute top-0 right-0 print-accent block z-0" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />
          <div className="bg-[#f48fb1] w-64 h-64 absolute top-0 right-0 print-accent opacity-80 block z-0" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />
          
          <div className="bg-[#0097a7] w-96 h-96 absolute bottom-0 left-0 print-accent block z-0" style={{ clipPath: 'polygon(0 100%, 100% 100%, 0 0)' }} />
          <div className="bg-[#f48fb1] w-64 h-64 absolute bottom-0 left-0 print-accent opacity-80 block z-0" style={{ clipPath: 'polygon(0 100%, 100% 100%, 0 0)' }} />

          <div className="p-20 text-center space-y-12 relative z-10 print:pt-24 print:pb-16">
              <div className="flex items-center justify-center gap-8">
                <Logo className="w-32 h-32" />
                <div className="text-left">
                  <h1 className="text-5xl font-black uppercase tracking-tighter text-modern-blue">Arul Jothi</h1>
                  <p className="text-sm font-black uppercase tracking-[0.4em] text-modern-blue">Auto Consulting</p>
                  <div className="flex items-center gap-6 pt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Mob: +91 73735 31010</span>
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                    <span>aruljothiautoconsulting@gmail.com</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center pt-4">
                <div className="bg-black px-12 py-4 rounded-xl shadow-lg border-2 border-black print-black-box">
                  <input 
                    type="text"
                    value={globalName}
                    onChange={(e) => setGlobalName(e.target.value)}
                    placeholder="ENTER CUSTOMER NAME"
                    className="bg-transparent border-none text-white text-center font-black uppercase tracking-[0.3em] text-2xl outline-none placeholder:text-gray-700 min-w-[500px]"
                  />
                </div>
              </div>
          </div>
          <div className="overflow-x-auto no-scrollbar flex-1 px-8 print:px-20 pb-20 relative z-10 print:overflow-visible">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b-2 border-black">
                  <th className="px-4 py-6 text-left text-[11px] font-black uppercase tracking-[0.2em] text-black border-r border-slate-200">Vehicle No</th>
                  <th className="px-4 py-6 text-right text-[11px] font-black uppercase tracking-[0.2em] text-black border-r border-slate-200">Tax Amount</th>
                  <th className="px-4 py-6 text-right text-[11px] font-black uppercase tracking-[0.2em] text-black border-r border-slate-200">GT</th>
                  {showSC && <th className="px-4 py-6 text-right text-[11px] font-black uppercase tracking-[0.2em] text-black border-r border-slate-200">S C</th>}
                  <th className="px-4 py-6 text-right text-[11px] font-black uppercase tracking-[0.2em] text-black border-r border-slate-200">Total Amount</th>
                  <th className="px-2 py-6 text-center text-[11px] font-black uppercase tracking-[0.2em] text-black no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => {
                  const total = (Number(row.taxAmount) || 0) + (Number(row.gt) || 0) + (showSC ? (Number(row.sc) || 0) : 0);
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/20 group">
                      <td className="px-4 py-5 border-r border-slate-100">
                        <input 
                          type="text"
                          value={row.vehicleNo}
                          onChange={(e) => updateRow(row.id, 'vehicleNo', e.target.value)}
                          placeholder="TN..."
                          className="w-full bg-transparent border-none text-base font-bold text-slate-800 font-mono tracking-widest outline-none uppercase"
                        />
                      </td>
                      <td className="px-4 py-5 border-r border-slate-100">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-slate-400 font-bold text-sm">₹</span>
                          <input 
                            type="number"
                            value={row.taxAmount}
                            onChange={(e) => updateRow(row.id, 'taxAmount', e.target.value)}
                            placeholder="0"
                            className="w-24 bg-transparent border-none text-right font-bold text-slate-800 text-base outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-5 border-r border-slate-100">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-modern-blue font-bold text-sm">₹</span>
                          <input 
                            type="number"
                            value={row.gt}
                            onChange={(e) => updateRow(row.id, 'gt', e.target.value)}
                            placeholder="0"
                            className="w-20 bg-transparent border-none text-right font-bold text-modern-blue text-base outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </td>
                      {showSC && (
                         <td className="px-4 py-5 border-r border-slate-100">
                           <div className="flex items-center justify-end gap-1">
                             <span className="text-[#f48fb1] font-bold text-sm">₹</span>
                             <input 
                               type="number"
                               value={row.sc}
                               onChange={(e) => updateRow(row.id, 'sc', e.target.value)}
                               placeholder="0"
                               className="w-20 bg-transparent border-none text-right font-bold text-[#f48fb1] text-base outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                             />
                           </div>
                         </td>
                      )}
                      <td className="px-4 py-5 border-r border-slate-100 text-right font-black text-slate-900 text-base bg-slate-50/30 whitespace-nowrap">
                        ₹{total.toLocaleString()}
                      </td>
                      <td className="px-2 py-5 text-center no-print">
                        <button 
                          onClick={() => removeRow(row.id)}
                          className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-4 border-black">
                <tr className="bg-slate-50/50 font-black">
                  <td className="px-4 py-8 text-[11px] font-black uppercase text-modern-muted text-right tracking-[0.2em] border-r border-slate-200">Total Collection</td>
                  <td className="px-4 py-8 text-right font-black text-slate-600 text-base border-r border-slate-200">₹{stats.totalTax.toLocaleString()}</td>
                  <td className="px-4 py-8 text-right font-black text-slate-600 text-base border-r border-slate-200">₹{stats.totalGT.toLocaleString()}</td>
                  {showSC && <td className="px-4 py-8 text-right font-black text-slate-600 text-base border-r border-slate-200">₹{stats.totalSC.toLocaleString()}</td>}
                  <td className="px-4 py-8 text-right text-xl font-black text-modern-text bg-yellow-50/50 whitespace-nowrap">₹{stats.totalAmount.toLocaleString()}</td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div className="no-print flex justify-center pt-8">
        <button 
          onClick={addRow}
          className="flex items-center gap-3 px-12 py-5 bg-white border-2 border-modern-blue text-modern-blue rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-modern-blue hover:text-white transition-all shadow-xl shadow-modern-blue/10 active:scale-95"
        >
          <Plus className="w-6 h-6" />
          Add Entry Row
        </button>
      </div>
    </div>
  );
}
