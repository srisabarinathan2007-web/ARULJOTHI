import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, IndianRupee, Save, FileText, ChevronDown } from 'lucide-react';
import Logo from './Logo';

export default function BillingDashboard() {
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('manual_billing_customer') || 'Sacha Dubois');
  
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('manual_billing_items');
    return saved ? JSON.parse(saved) : [
      { id: '1', vehicleNo: 'TN-01-AB-1234', service: 'Full Service', total: 1000 },
    ];
  });

  useEffect(() => {
    localStorage.setItem('manual_billing_customer', customerName);
    localStorage.setItem('manual_billing_items', JSON.stringify(items));
  }, [customerName, items]);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), vehicleNo: '', service: '', total: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item: any) => item.id !== id));
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map((item: any) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const grandTotal = items.reduce((sum: number, item: any) => sum + (parseFloat(item.total) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      {/* Action Buttons */}
      <div className="flex justify-between items-center no-print">
        <h2 className="text-3xl font-display font-bold text-modern-text flex items-center gap-4">
          <FileText className="w-8 h-8 text-modern-blue" />
          Invoice Terminal
        </h2>
        <div className="flex items-center gap-4">
           <div className="hidden lg:flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 no-print">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Note: Enable "Background Graphics" in print settings</span>
           </div>
           <button onClick={addItem} className="modern-button-secondary flex items-center gap-3">
             <Plus className="w-5 h-5" />
             Add Item
           </button>
           <button onClick={handlePrint} className="modern-button-primary flex items-center gap-3">
             <Printer className="w-5 h-5" />
             Print Invoice
           </button>
        </div>
      </div>

      {/* Invoice Page Container */}
        <div className="bg-white shadow-2xl w-full max-w-[210mm] min-h-[297mm] flex flex-col border border-modern-border overflow-hidden relative print:shadow-none print:border-none print:w-[210mm] print:h-[297mm] print:overflow-visible mx-auto">
          
          {/* Corner Geometric Accents (Matching Image Aesthetics) */}
          <div className="bg-[#0097a7] w-64 h-64 absolute top-0 right-0 print-accent block z-0" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />
          <div className="bg-[#f48fb1] w-48 h-48 absolute top-0 right-0 print-accent opacity-80 block z-0" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />
          
          <div className="bg-[#0097a7] w-64 h-64 absolute bottom-0 left-0 print-accent block z-0" style={{ clipPath: 'polygon(0 100%, 100% 100%, 0 0)' }} />
          <div className="bg-[#f48fb1] w-48 h-48 absolute bottom-0 left-0 print-accent opacity-80 block z-0" style={{ clipPath: 'polygon(0 100%, 100% 100%, 0 0)' }} />

          {/* Header Section */}
          <div className="p-20 pb-10 space-y-12 relative z-10 text-center">
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="relative group">
                  <Logo className="w-28 h-28 transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute -inset-4 bg-gradient-to-tr from-[#0097a7]/10 to-[#f48fb1]/10 rounded-full blur-2xl -z-10 group-hover:opacity-100 opacity-0 transition-opacity" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-6xl font-black uppercase tracking-tighter text-[#1a1a1a]">Arul Jothi</h2>
                  <p className="text-sm font-black uppercase tracking-[0.4em] text-modern-blue opacity-90">Auto Consulting & RTO Solutions</p>
                  <div className="flex items-center justify-center gap-8 pt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-2">Mob: +91 73735 31010</span>
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                    <span className="flex items-center gap-2">Email: aruljothiautoconsulting@gmail.com</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-8 pt-4">
                <div className="relative group">
                  <div className="bg-black px-16 py-5 rounded-xl shadow-2xl border-2 border-black transform hover:-translate-y-1 transition-all duration-300 print-black-box">
                    <input 
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="ENTER CUSTOMER NAME"
                      className="bg-transparent border-none text-white text-center font-black uppercase tracking-[0.3em] text-2xl outline-none placeholder:text-gray-700 min-w-[550px]"
                    />
                  </div>
                </div>
              </div>
          </div>

          <div className="px-20 py-10 relative flex-1 z-10">
              {/* Table Section */}
              <div className="border-2 border-black relative bg-white/50 backdrop-blur-[2px]">
               <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f0f0f0] border-b-2 border-black">
                      <th className="border-r-2 border-black px-8 py-5 text-[11px] font-black uppercase tracking-widest w-24 text-center">S.No</th>
                      <th className="border-r-2 border-black px-8 py-5 text-[11px] font-black uppercase tracking-widest min-w-[200px]">Vehicle Number</th>
                      <th className="border-r-2 border-black px-8 py-5 text-[11px] font-black uppercase tracking-widest">Service</th>
                      <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest w-48 text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: any, index: number) => (
                      <tr key={item.id} className="group border-b border-black">
                        <td className="border-r-2 border-black px-8 py-6 text-lg font-black text-center relative">
                          {index + 1}
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="absolute -left-16 top-1/2 -translate-y-1/2 p-3 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity no-print"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                        <td className="border-r-2 border-black px-8 py-6">
                          <input 
                            type="text"
                            value={item.vehicleNo}
                            onChange={(e) => updateItem(item.id, 'vehicleNo', e.target.value)}
                            placeholder="Vehicle No"
                            className="w-full bg-transparent border-none p-0 outline-none text-lg font-bold text-[#1a1a1a] uppercase tracking-wider"
                          />
                        </td>
                        <td className="border-r-2 border-black px-8 py-6">
                          <input 
                            type="text"
                            value={item.service}
                            onChange={(e) => updateItem(item.id, 'service', e.target.value)}
                            placeholder="Service Details"
                            className="w-full bg-transparent border-none p-0 outline-none text-lg font-bold text-[#1a1a1a]"
                          />
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <span className="font-black text-lg">₹</span>
                            <input 
                              type="number"
                              value={item.total}
                              onChange={(e) => updateItem(item.id, 'total', parseFloat(e.target.value) || 0)}
                              className="w-full bg-transparent border-none p-0 outline-none text-center font-black text-xl"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {/* Empty spacer rows to maintain height if needed */}
                    {[...Array(Math.max(0, 5 - items.length))].map((_, i) => (
                      <tr key={`spacer-${i}`} className="border-b border-black h-16">
                        <td className="border-r-2 border-black" />
                        <td className="border-r-2 border-black" />
                        <td className="border-r-2 border-black" />
                        <td />
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#fdfdfd] border-black">
                      <td colSpan={2} className="border-r-2 border-black" />
                      <td className="border-r-2 border-black px-8 py-8 text-[12px] font-black uppercase tracking-[0.3em] text-center">Grand Total</td>
                      <td className="px-8 py-8 text-2xl font-black text-center text-[#1a1a1a]">
                        ₹{(grandTotal || 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
               </table>
            </div>

            {/* Additional Info Footer */}
            <div className="flex justify-end items-end pt-20">
               <div className="text-center space-y-3">
                  <div className="w-80 mx-auto border-b-2 border-black pb-2 text-right pr-4">
                     <span className="font-display italic text-2xl text-black font-bold">M SUNDARARAJAN</span>
                  </div>
                  <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]">Manager / Authorized Sign</p>
               </div>
            </div>
        </div>

        {/* Bottom Legacy Branding */}
        <div className="p-12 text-center relative z-10 bg-white">
            <div className="inline-flex flex-col items-center gap-2 opacity-40">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1a1a1a]">Providing RTO Solutions</p>
              <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]">Since 2009</p>
            </div>
        </div>

      </div>
    </div>
  );
}
