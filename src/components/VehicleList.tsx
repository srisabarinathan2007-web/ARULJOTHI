import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Calendar, AlertCircle, CheckCircle2, ChevronRight, FileDown, MoreVertical, MessageSquare, Download, Printer, FileSpreadsheet, Car, Shield, FileText, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { differenceInDays, isBefore, format, parseISO, startOfMonth, endOfMonth, isWithinInterval, addDays, isSameDay, startOfDay } from 'date-fns';
import * as XLSX from 'xlsx';
import { Vehicle } from '../types';
import ExpiryBadge from './ExpiryBadge';
import { cn } from '../lib/utils';
import HighlightText from './HighlightText';

interface VehicleListProps {
  vehicles: Vehicle[];
  loading: boolean;
  onViewDetails: (vehicle: Vehicle) => void;
  onEdit: (vehicle: Vehicle) => void;
  onAdd: () => void;
  reminderDays: number;
  initialExpiryFilter: string;
  isAdmin: boolean;
  onImport: () => void;
}

export default function VehicleList({ 
  vehicles, 
  loading, 
  onViewDetails, 
  onEdit,
  onAdd,
  reminderDays, 
  initialExpiryFilter,
  isAdmin,
  onImport
}: VehicleListProps) {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [docFilter, setDocFilter] = useState<'all' | 'fc' | 'permit' | 'insurance' | 'np'>('all');
  const [timeFilter, setTimeFilter] = useState<'any' | 'expired' | 'today' | '1d' | '7d' | '15d' | '30d' | 'this_month' | 'next_month'>('any');

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const pn = v.plateNumber || '';
      const on = v.ownerName || '';
      const ph = v.phoneNumber || '';
      const search = debouncedSearch.toLowerCase();
      
      const matchesSearch = pn.toLowerCase().includes(search) || 
                           on.toLowerCase().includes(search) ||
                           ph.toLowerCase().includes(search);
      
      if (!matchesSearch) return false;

      const getRelevantDates = () => {
        if (docFilter === 'fc') return [v.fcExpiry];
        if (docFilter === 'permit') return [v.permitExpiry];
        if (docFilter === 'insurance') return [v.insuranceExpiry];
        if (docFilter === 'np') return [v.nationalPermitExpiry];
        return [v.fcExpiry, v.permitExpiry, v.insuranceExpiry, v.nationalPermitExpiry, v.pollutionExpiry, v.taxExpiry, v.greenTaxExpiry];
      };

      const dates = getRelevantDates().filter(Boolean) as string[];
      if (timeFilter === 'any') return true;

      const today = startOfDay(new Date());

      return dates.some(d => {
        const date = startOfDay(parseISO(d));
        
        switch (timeFilter) {
          case 'expired':
            return isBefore(date, today);
          case 'today':
            return isSameDay(date, today);
          case '1d':
            return isWithinInterval(date, { start: today, end: addDays(today, 1) });
          case '7d':
            return isWithinInterval(date, { start: today, end: addDays(today, 7) });
          case '15d':
            return isWithinInterval(date, { start: today, end: addDays(today, 15) });
          case '30d':
            return isWithinInterval(date, { start: today, end: addDays(today, 30) });
          case 'this_month':
            return isWithinInterval(date, { start: startOfMonth(today), end: endOfMonth(today) });
          case 'next_month':
            const nextMonth = addDays(endOfMonth(today), 1);
            return isWithinInterval(date, { start: startOfMonth(nextMonth), end: endOfMonth(nextMonth) });
          default:
            return true;
        }
      });
    });
  }, [vehicles, debouncedSearch, docFilter, timeFilter]);

  const handleExport = () => {
    const exportData = filteredVehicles.map(v => ({
      'Plate Number': v.plateNumber,
      'Owner Name': v.ownerName,
      'Phone': v.phoneNumber,
      'FC Expiry': v.fcExpiry,
      'Insurance': v.insuranceExpiry,
      'Permit': v.permitExpiry,
      'NP Expiry': v.nationalPermitExpiry,
      'Pollution': v.pollutionExpiry,
      'Tax': v.taxExpiry,
      'Green Tax': v.greenTaxExpiry
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vehicles');
    XLSX.writeFile(wb, `ArulJothi_Vehicles_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-6">
        <div className="w-16 h-16 border-4 border-modern-blue/10 border-t-modern-blue rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-modern-blue animate-pulse">Loading Vehicles</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Big Search Bar Area Match */}
      <div className="no-print">
         <div className="relative group max-w-full">
            <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-all duration-300">
               <Search className="w-6 h-6 lg:w-7 lg:h-7" />
            </div>
            <input 
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setShowSearchResults(e.target.value.length > 0);
              }}
              placeholder="Search by Plate Number, Owner, or Phone..."
              className="w-full bg-white border-2 border-slate-100 rounded-[40px] py-8 lg:py-10 pl-20 lg:pl-24 pr-20 outline-none focus:border-blue-600/50 shadow-[0_15px_60px_rgba(37,99,235,0.03)] transition-all font-black text-[#1e293b] text-base lg:text-lg placeholder:text-slate-200 placeholder:font-bold"
            />
            <div className="absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-600 cursor-pointer shadow-sm transition-all active:scale-95 group-hover:bg-blue-50 group-hover:text-blue-600">
               <Filter className="w-6 h-6" />
            </div>

            {/* Quick Search Dropdown */}
            <AnimatePresence>
              {showSearchResults && filteredVehicles.length > 0 && (
                 <motion.div 
                   initial={{ opacity: 0, y: 20, scale: 0.98 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: 20, scale: 0.98 }}
                   className="absolute left-0 top-full mt-6 w-full bg-white rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.12)] border border-slate-100 z-[100] overflow-hidden p-6"
                 >
                   <div className="px-8 py-5 border-b border-slate-50 mb-4 flex items-center justify-between">
                     <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Quick Results</span>
                     <span className="px-3 py-1.5 bg-blue-50 text-[10px] font-black text-blue-600 rounded-full">{filteredVehicles.length} Vehicles found</span>
                   </div>
                   <div className="max-h-[450px] overflow-y-auto no-scrollbar space-y-2 p-2">
                     {filteredVehicles.slice(0, 6).map(v => (
                       <div 
                         key={v.id}
                         onClick={() => {
                           onViewDetails(v);
                           setShowSearchResults(false);
                         }}
                         className="p-6 hover:bg-slate-50/50 rounded-3xl cursor-pointer transition-all border border-transparent hover:border-blue-100/50 flex items-center justify-between group/result"
                       >
                         <div className="flex items-center gap-8">
                           <div className="w-14 h-14 bg-blue-600/5 rounded-2xl flex items-center justify-center border border-blue-600/5 group-hover/result:bg-blue-600 group-hover/result:text-white transition-all shadow-sm">
                             <Car className="w-6 h-6" />
                           </div>
                           <div>
                             <span className="text-[10px] font-black text-blue-600 block mb-1 group-hover/result:text-blue-700 transition-all uppercase tracking-[0.2em]">{v.plateNumber}</span>
                             <p className="text-lg font-black text-[#1e293b]">{v.ownerName}</p>
                             <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{v.phoneNumber}</p>
                           </div>
                         </div>
                         <div className="bg-slate-100/50 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/result:bg-blue-600 group-hover/result:text-white transition-all">
                           Open Profile
                         </div>
                       </div>
                     ))}
                   </div>
                 </motion.div>
              )}
            </AnimatePresence>
         </div>
      </div>

      {/* Filter Section Match */}
      <div className="bg-white border-[4px] border-blue-600 rounded-[32px] p-0 shadow-2xl no-print overflow-hidden mb-12 relative">
        <div className="p-8 lg:p-10 flex flex-col lg:flex-row gap-0">
          {/* Document type filter buttons */}
          <div className="flex-1 space-y-6 pr-10">
             <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest leading-none">Document Type</h4>
             </div>
             <div className="flex flex-wrap gap-2.5">
                {[
                   { id: 'all', label: 'ALL DOCS' },
                   { id: 'fc', label: 'FC' },
                   { id: 'permit', label: 'PERMIT' },
                   { id: 'insurance', label: 'INSURANCE' },
                   { id: 'np', label: 'NAT. PERMIT' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setDocFilter(f.id as any)}
                    className={cn(
                      "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border",
                      docFilter === f.id 
                        ? "bg-blue-600 border-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)]" 
                        : "bg-white border-slate-100 text-slate-400 hover:border-blue-200"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
             </div>
          </div>

          {/* Vertical Separator */}
          <div className="hidden lg:block w-[1px] bg-slate-100 my-4" />

          {/* Time filter buttons */}
          <div className="flex-[1.5] space-y-6 lg:pl-10">
             <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest leading-none">Time Filter</h4>
             </div>
             <div className="space-y-4">
                <div className="flex flex-wrap gap-2.5">
                   {[
                      { id: 'any', label: 'ANY TIME' },
                      { id: 'expired', label: 'EXPIRED' },
                      { id: 'today', label: 'TODAY' },
                      { id: '1d', label: '1 DAY' },
                      { id: '7d', label: '7 DAYS' },
                      { id: '15d', label: '15 DAYS' }
                   ].map((t) => (
                     <button
                       key={t.id}
                       onClick={() => setTimeFilter(t.id as any)}
                       className={cn(
                         "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border",
                         timeFilter === t.id 
                           ? "bg-blue-600 border-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)]" 
                           : "bg-white border-slate-100 text-slate-400 hover:border-blue-200"
                       )}
                     >
                       {t.label}
                     </button>
                   ))}
                </div>
                <div className="flex flex-wrap gap-2.5">
                   {[
                      { id: '30d', label: '30 DAYS' },
                      { id: 'this_month', label: 'THIS MONTH' },
                      { id: 'next_month', label: 'NEXT MONTH' }
                   ].map((t) => (
                     <button
                       key={t.id}
                       onClick={() => setTimeFilter(t.id as any)}
                       className={cn(
                         "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border",
                         timeFilter === t.id 
                           ? "bg-blue-600 border-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)]" 
                           : "bg-white border-slate-100 text-slate-400 hover:border-blue-200"
                       )}
                     >
                       {t.label}
                     </button>
                   ))}
                </div>
             </div>
          </div>

          {/* Side Illustration Match */}
          <div className="hidden xl:flex items-center justify-center pl-12 pr-6">
             <div className="relative shrink-0">
                <img 
                  src="/date.png" 
                  alt="Calendar Schedule" 
                  className="w-44 h-auto object-contain drop-shadow-xl hover:rotate-3 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
             </div>
          </div>
        </div>

        {/* Bottom Bar Controls Match Image */}
        <div className="bg-slate-50/50 p-5 lg:px-8 border-t border-slate-100 flex items-center justify-center lg:justify-between relative">
           <div className="hidden lg:flex items-center gap-4">
              <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-600 w-1/3 rounded-full animate-pulse" />
              </div>
           </div>

           <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:top-1/2 lg:-translate-y-1/2">
              <div className="w-24 h-1.5 bg-blue-600/10 rounded-full overflow-hidden relative">
                 <div className="absolute inset-0 bg-blue-600 w-1/2 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
              </div>
           </div>

           <div className="hidden lg:flex items-center gap-3">
              <div className="bg-white border border-slate-100 p-1.5 rounded-2xl flex items-center gap-2 shadow-sm transition-all hover:shadow-md">
                 <button 
                   onClick={handleExport}
                   className="flex items-center gap-3 px-6 py-2.5 rounded-xl hover:bg-slate-50 transition-all group"
                 >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1e293b]">Excel</span>
                 </button>
                 <div className="w-[1px] h-6 bg-slate-100" />
                 <button 
                   onClick={() => window.print()}
                   className="flex items-center gap-3 px-6 py-2.5 rounded-xl hover:bg-slate-50 transition-all group"
                 >
                    <Printer className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1e293b]">Print</span>
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Main Data Table Match */}
      <div className="bg-white rounded-[48px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.04)] border border-slate-100">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead className="bg-[#0a1128] text-white">
              <tr>
                <th className="px-4 py-4 text-left">
                   <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 opacity-70" />
                      <span className="text-[10px] font-black uppercase tracking-[0.1em] opacity-80">Details</span>
                   </div>
                </th>
                {(docFilter === 'all' || docFilter === 'fc') && (
                  <th className="px-4 py-4 text-left">
                     <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 opacity-70" />
                        <span className="text-[10px] font-black uppercase tracking-[0.1em] opacity-80">FC</span>
                     </div>
                  </th>
                )}
                {(docFilter === 'all' || docFilter === 'insurance') && (
                  <th className="px-4 py-4 text-left">
                     <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 opacity-70" />
                        <span className="text-[10px] font-black uppercase tracking-[0.1em] opacity-80">Insurance</span>
                     </div>
                  </th>
                )}
                {(docFilter === 'all' || docFilter === 'permit') && (
                  <th className="px-4 py-4 text-left">
                     <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 opacity-70" />
                        <span className="text-[10px] font-black uppercase tracking-[0.1em] opacity-80">Permit</span>
                     </div>
                  </th>
                )}
                {(docFilter === 'all' || docFilter === 'np') && (
                  <th className="px-4 py-4 text-left">
                     <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 opacity-70" />
                        <span className="text-[10px] font-black uppercase tracking-[0.1em] opacity-80">NP</span>
                     </div>
                  </th>
                )}
                <th className="px-4 py-4 text-right">
                   <div className="flex items-center justify-end gap-2 px-4">
                       <span className="text-[10px] font-black uppercase tracking-[0.1em] opacity-80">Action</span>
                   </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredVehicles.map((vehicle) => (
                  <motion.tr
                    layout
                    key={vehicle.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-50/50 transition-all group/row cursor-default"
                  >
                    <td className="px-4 py-6">
                       <div className="flex items-center gap-4">
                          {/* Plate Number Pill Match */}
                          <div className="bg-white border-2 border-slate-100 px-4 py-2 rounded-[14px] shadow-sm group-hover/row:border-blue-100 group-hover/row:shadow-md transition-all shrink-0">
                             <span className="text-xs font-black tracking-tight text-[#1e293b] uppercase">
                                <HighlightText text={vehicle.plateNumber} highlight={debouncedSearch} />
                             </span>
                          </div>
                          {/* Owner Info Match */}
                          <div className="min-w-[100px]">
                             <p className="text-xs font-black text-[#1e293b] tracking-tight uppercase mb-0.5">
                                <HighlightText text={vehicle.ownerName} highlight={debouncedSearch} />
                             </p>
                             <div className="flex items-center gap-1.5 text-slate-400">
                                <Phone className="w-2.5 h-2.5 opacity-30" />
                                <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">
                                   <HighlightText text={vehicle.phoneNumber} highlight={debouncedSearch} />
                                </span>
                             </div>
                          </div>
                       </div>
                    </td>
                    {(docFilter === 'all' || docFilter === 'fc') && (
                      <td className="px-4 py-6">
                         <ExpiryBadge date={vehicle.fcExpiry} reminderDays={reminderDays} />
                      </td>
                    )}
                    {(docFilter === 'all' || docFilter === 'insurance') && (
                      <td className="px-4 py-6">
                         <ExpiryBadge date={vehicle.insuranceExpiry} reminderDays={reminderDays} />
                      </td>
                    )}
                    {(docFilter === 'all' || docFilter === 'permit') && (
                      <td className="px-4 py-6">
                         <ExpiryBadge date={vehicle.permitExpiry} reminderDays={reminderDays} />
                      </td>
                    )}
                    {(docFilter === 'all' || docFilter === 'np') && (
                      <td className="px-4 py-6">
                         <ExpiryBadge date={vehicle.nationalPermitExpiry} reminderDays={reminderDays} />
                      </td>
                    )}
                    <td className="px-4 py-6 text-right">
                       <div className="flex items-center justify-end gap-2 translate-x-2 opacity-0 group-hover/row:opacity-100 group-hover/row:translate-x-0 transition-all px-4">
                          <button 
                             className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                          >
                             <MessageSquare className="w-4 h-4" />
                          </button>
                          <button 
                             onClick={() => onViewDetails(vehicle)}
                             className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 flex items-center justify-center hover:bg-white hover:text-blue-600 transition-all hover:border-blue-200 shadow-sm"
                          >
                             <ChevronRight className="w-5 h-5" />
                          </button>
                       </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {filteredVehicles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-modern-border">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-modern-text">No Vehicles Found</h3>
          <p className="text-modern-muted text-sm mt-1 max-w-xs">We couldn't find any vehicles matching your search or filter.</p>
        </div>
      )}
    </div>
  );
}
