import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, FileText, Trash2, Printer, 
  CheckCircle2, AlertCircle, ChevronDown, ChevronRight, 
  ArrowLeft as BackIcon, Download, ExternalLink, X, Save,
  History, User, Headphones, Zap, Bell, MoreVertical,
  FileSpreadsheet, CloudUpload, Calendar, Phone, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { TaxRecord, Vehicle } from '../types';
import { format, parseISO } from 'date-fns';
import HighlightText from './HighlightText';
import Logo from './Logo';

interface TaxDashboardProps {
  onImport: () => void;
  onAdd: () => void;
  onEdit: (record: TaxRecord) => void;
  vehicles: Vehicle[];
  onViewVehicle: (vehicle: Vehicle) => void;
}

const YEAR_OPTIONS = Array.from({ length: 28 }, (_, i) => 2023 + i); // 2023 to 2050

export default function TaxDashboard({ onImport, onAdd, onEdit, vehicles, onViewVehicle }: TaxDashboardProps) {
  const [records, setRecords] = useState<TaxRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [taxTypeFilter, setTaxTypeFilter] = useState<string[]>(['All']);
  const [dateField, setDateField] = useState<'paidDate' | 'taxExpiry'>('paidDate');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [view, setView] = useState<'categories' | 'list'>('categories');
  const [activeRowSelector, setActiveRowSelector] = useState<string | null>(null);

  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [showTypeFilter, setShowTypeFilter] = useState(false);

  const getPeriods = (year: number) => {
    const nextYear = year + 1;
    return [
      { id: 'all', label: `ALL TAX RECORDS (${year}-${nextYear})`, start: '', end: '', title: 'ALL RECORD', type: 'period' },
      { id: 'q1', label: `01-04-${year} to 30-06-${year}`, start: `${year}-04-01`, end: `${year}-06-30`, title: 'FIRST QUARTER (01-04 to 30-06)', type: 'period' },
      { id: 'q2', label: `01-07-${year} to 30-09-${year}`, start: `${year}-07-01`, end: `${year}-09-30`, title: 'SECOND QUARTER (01-07 to 30-09)', type: 'period' },
      { id: 'q3', label: `01-10-${year} to 31-12-${year}`, start: `${year}-10-01`, end: `${year}-12-31`, title: 'THIRD QUARTER (01-10 to 31-12)', type: 'period' },
      { id: 'q4', label: `01-01-${nextYear} to 31-03-${nextYear}`, start: `${nextYear}-01-01`, end: `${nextYear}-03-31`, title: 'FOURTH QUARTER (01-01 to 31-03)', type: 'period' },
      { id: 'fy', label: `01-04-${year} to 31-03-${nextYear}`, start: `${year}-04-01`, end: `${nextYear}-03-31`, title: 'FULL YEAR (01-04 to 31-03)', type: 'period' },
    ];
  };

  const getTaxTypeCategories = () => [
    { id: 'cat-yearly', label: 'Filter all Yearly records', title: 'YEARLY TAX', type: 'category', value: 'Yearly' },
    { id: 'cat-quarterly', label: 'Filter all Quarterly records', title: 'QUARTERLY TAX', type: 'category', value: 'Quarterly' },
    { id: 'cat-lifetime', label: 'Filter all Life Time records', title: 'LIFE TIME TAX', type: 'category', value: 'Life Time' },
  ];

  const handlePeriodSelect = (item: any) => {
    if (item.type === 'category') {
      setTaxTypeFilter([item.value]);
      setSelectedPeriod(item.title);
      setSelectedPeriodId(item.id);
      setView('list');
    } else {
      setSelectedPeriodId(item.id);
      setSelectedPeriod(item.title);
      setStartDate(item.start);
      setEndDate(item.end);
      setTaxTypeFilter(['All']);
      setView('list');
    }
  };
  
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await api.getTaxRecords();
      setRecords(data);
    } catch (err) {
      console.error("Tax records fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filtered = records.filter(r => {
    const matchesSearch = (r.plateNumber?.toLowerCase() || '').includes(search.toLowerCase()) || 
                         (r.ownerName?.toLowerCase() || '').includes(search.toLowerCase());
    
    // Year filter - if selecting via periods, we skip general year filter to honor specific period
    const matchesYear = (r.taxPeriod?.includes(selectedYear.toString()) || r.paidDate?.includes(selectedYear.toString())) || selectedPeriod;
    
    // Tax Type filter
    const recordTypes = (r.taxType || '').split(', ').filter(v => v);
    let matchesType = taxTypeFilter.includes('All') || recordTypes.some(t => taxTypeFilter.includes(t));
    
    // Special handling for "ALL 4 QUATER"
    if (taxTypeFilter.includes('ALL 4 QUATER')) {
      const q1 = `01-04-${selectedYear} to 30-06-${selectedYear}`;
      const q2 = `01-07-${selectedYear} to 30-09-${selectedYear}`;
      const q3 = `01-10-${selectedYear} to 31-12-${selectedYear}`;
      const q4 = `01-01-${selectedYear + 1} to 31-03-${selectedYear + 1}`;
      if (recordTypes.some(t => [q1, q2, q3, q4].includes(t))) matchesType = true;
    }

    // Date Range Filter logic
    const targetDateStr = dateField === 'paidDate' ? r.paidDate : r.taxExpiry;
    let matchesDateRange = true;
    
    if (startDate && endDate) {
      if (!targetDateStr) {
        matchesDateRange = false;
      } else {
        const targetDate = new Date(targetDateStr);
        const start = new Date(startDate);
        const end = new Date(endDate);
        targetDate.setHours(0,0,0,0);
        start.setHours(0,0,0,0);
        end.setHours(0,0,0,0);
        if (targetDate < start || targetDate > end) matchesDateRange = false;
      }
    } else if (startDate) {
      if (!targetDateStr || new Date(targetDateStr) < new Date(startDate)) matchesDateRange = false;
    } else if (endDate) {
      if (!targetDateStr || new Date(targetDateStr) > new Date(endDate)) matchesDateRange = false;
    }
    
    return matchesSearch && matchesYear && matchesType && matchesDateRange; 
  });

  const handleUpdate = async (recordId: string, updates: Partial<TaxRecord>) => {
    if (String(recordId).startsWith('empty-')) return;
    
    // Optimistic update
    setRecords(prev => prev.map(r => r.id === recordId ? { ...r, ...updates } : r));
    
    try {
      await api.updateTaxRecord(recordId, updates);
    } catch (err) {
      console.error("Autosave failed:", err);
    }
  };

  // Logic for 600 rows
  const spreadsheetRows = Array.from({ length: 600 }, (_, i) => {
    const record = filtered[i];
    return record || { id: `empty-${i}`, plateNumber: '', ownerName: '', taxType: '', paidDate: '', inDate: '', gt: '', taxExpiry: '', taxAmount: '' } as TaxRecord;
  });

  const isAllRecordView = selectedPeriodId === 'all';

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc] font-sans selection:bg-blue-100 overflow-hidden">
      <AnimatePresence mode="wait">
        {view === 'categories' ? (
          <motion.div 
            key="categories"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 overflow-y-auto p-10 lg:p-20 min-h-0"
          >
            <div className="max-w-7xl mx-auto w-full">
              {/* Top Toolbar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-12">
              <div className="flex items-start gap-5">
                <div className="w-[6px] h-16 bg-blue-600 rounded-full" />
                <div className="pt-1">
                  <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-300 mb-2">RESOURCE MANAGEMENT DASHBOARD</p>
                  <h1 className="text-5xl font-black text-[#0f172a] tracking-tighter leading-none mb-3">Tax Admin</h1>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 opacity-60">MANAGE REGISTRATION DOCUMENTS AND EXPIRY REMINDERS</p>
                </div>
              </div>

              <div className="flex items-center gap-8 self-start lg:self-center">
                <div className="flex items-center gap-5 px-10 py-5 bg-white rounded-full border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.6)]" />
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#0f172a]">ACTIVE TERMINAL</span>
                </div>
                <div className="w-16 h-16 bg-white rounded-[20px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex items-center justify-center text-[#1e293b] cursor-pointer hover:bg-slate-50 hover:shadow-lg transition-all">
                  <Menu className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Main Selection Area */}
            <div className="bg-white rounded-[70px] border border-slate-50 shadow-[0_40px_100px_rgba(0,0,0,0.04)] overflow-hidden min-h-[600px] relative">
              {/* Selector Header */}
              <div className="p-16 lg:p-24 flex flex-col xl:flex-row xl:items-center justify-between gap-12 border-b border-slate-50">
                <div className="flex items-start gap-10">
                  <div className="w-16 h-[2.5px] bg-blue-600 mt-5 rounded-full" />
                  <div>
                    <p className="text-[12px] font-black uppercase tracking-[0.6em] text-slate-300 mb-5">CATEGORY TERMINAL</p>
                    <h2 className="text-5xl font-black text-[#0f172a] tracking-tighter leading-none mb-3">SELECT REPORT CATEGORY</h2>
                  </div>
                </div>

                <div className="flex items-center gap-10">
                   <div className="relative group">
                      <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="pl-12 pr-16 py-6 bg-slate-50 border border-slate-100 rounded-[24px] text-[12px] font-black text-slate-900 tracking-[0.2em] uppercase appearance-none outline-none focus:ring-4 focus:ring-blue-50 transition-all cursor-pointer"
                      >
                        {YEAR_OPTIONS.map(y => <option key={y} value={y}>YEAR: {y}</option>)}
                      </select>
                      <ChevronDown className="absolute right-7 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-600 pointer-events-none" />
                   </div>
                </div>
              </div>

              {/* Selection Content */}
              <div className="px-16 lg:px-24 grid grid-cols-1 gap-6 pt-12">
                {getPeriods(selectedYear).map((period) => (
                  <motion.button
                    key={period.id}
                    whileHover={{ scale: 1.01, x: 8 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handlePeriodSelect(period)}
                    className={`w-full text-left rounded-[35px] p-8 lg:p-10 flex items-center justify-between group shadow-lg transition-all relative overflow-hidden border ${
                      period.id === 'all' 
                        ? 'bg-[#2563eb] border-blue-400 text-white shadow-blue-200/50' 
                        : 'bg-white border-slate-100 text-slate-900 shadow-slate-100 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center gap-10 relative z-10">
                      <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center border ${
                        period.id === 'all' 
                          ? 'bg-white/10 border-white/20' 
                          : 'bg-blue-50 border-blue-100'
                      }`}>
                        <FileSpreadsheet className={`w-7 h-7 ${period.id === 'all' ? 'text-white' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <h3 className={`text-2xl font-black tracking-tight uppercase mb-1 ${period.id === 'all' ? 'text-white' : 'text-[#0f172a]'}`}>
                          {period.title}
                        </h3>
                        <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${period.id === 'all' ? 'text-white/50' : 'text-slate-400'}`}>
                          {period.label}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center shadow-lg transition-all ${
                      period.id === 'all' 
                        ? 'bg-white text-blue-600' 
                        : 'bg-blue-600 text-white scale-90 group-hover:scale-100'
                    }`}>
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </motion.button>
                ))}

                <div className="flex items-center mt-20 mb-8 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                    <h3 className="text-xl font-black text-[#0f172a] tracking-widest uppercase italic">BY TAX TYPE</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-24">
                  {getTaxTypeCategories().map((cat) => (
                    <motion.button
                      key={cat.id}
                      whileHover={{ scale: 1.01, y: -4 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handlePeriodSelect(cat)}
                      className="group relative bg-white border border-slate-100 p-10 rounded-[32px] text-left hover:border-blue-200 transition-all shadow-xl overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 blur-[60px] group-hover:bg-blue-100 transition-all" />
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-3 group-hover:text-blue-400 transition-colors">TAX CATEGORY</p>
                      <h4 className="text-2xl font-black text-[#0f172a] tracking-tight mb-2">{cat.title}</h4>
                      <p className="text-[11px] font-medium text-slate-500 tracking-widest">{cat.label}</p>
                      <div className="mt-8 flex items-center gap-3 text-blue-600 group-hover:gap-5 transition-all">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Select Category</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Trust Footer */}
            <div className="mt-20 pb-10 flex flex-col items-center">
              <div className="flex items-center gap-10 opacity-30 pointer-events-none grayscale">
                <div className="w-14 h-14 text-slate-900">
                  <Logo className="w-full h-full" />
                </div>
                <div className="w-2 h-2 rounded-full bg-slate-900" />
                <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-900">© 2009-2026 ARUL JOTHI AUTO CONSULTING</p>
              </div>
            </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 min-h-0 flex flex-col bg-[#f0f0f0] font-sans overflow-hidden"
          >
            {/* Excel Ribbon / Toolbar */}
            <div className="bg-[#f3f3f3] border-b border-slate-300 px-2 py-1 flex items-center gap-4 shadow-sm z-30">
              <div className="flex items-center gap-1 border-r border-slate-300 pr-4 mr-2">
                <button 
                  onClick={() => setView('categories')}
                  className="p-1 hover:bg-slate-200 rounded text-slate-500 mr-2"
                >
                  <BackIcon className="w-4 h-4" />
                </button>
                <div className="bg-[#217346] p-1.5 rounded text-white mr-2">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h1 className="text-[13px] font-bold text-slate-700">TaxAdmin_Report.xlsx</h1>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-2 py-1">
                   <Search className="w-3.5 h-3.5 text-slate-400" />
                   <input 
                     type="text" 
                     placeholder="Search..." 
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="bg-transparent text-[12px] outline-none w-40"
                   />
                </div>
                
                <div className="h-6 w-[1px] bg-slate-300" />
                
                <button 
                  onClick={onAdd}
                  className="flex items-center gap-1.5 px-3 py-1 hover:bg-slate-200 rounded text-[12px] font-medium text-slate-700 transition-colors"
                >
                  <Plus className="w-4 h-4 text-[#217346]" /> Insert Row
                </button>
                
                <button 
                  onClick={onImport}
                  className="flex items-center gap-1.5 px-3 py-1 hover:bg-slate-200 rounded text-[12px] font-medium text-slate-700 transition-colors"
                >
                  <CloudUpload className="w-4 h-4 text-[#217346]" /> Import Data
                </button>

                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1 hover:bg-slate-200 rounded text-[12px] font-medium text-slate-700 transition-colors"
                >
                  <Printer className="w-4 h-4 text-[#217346]" /> Print
                </button>
              </div>

              <div className="ml-auto flex items-center gap-4 text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  AUTOSAVE ON
                </div>
                <div className="pr-4">{filtered.length} RECORDS FOUND</div>
              </div>
            </div>

            {/* Formula Bar / Filter Strip */}
            <div className="bg-white border-b border-slate-300 px-4 py-1.5 flex items-center gap-4 z-20">
              <div className="bg-slate-50 border border-slate-300 px-3 py-0.5 rounded text-[11px] font-mono text-slate-500 w-16 text-center">
                {search ? 'Filtered' : 'A1'}
              </div>
              <div className="h-5 w-[1px] bg-slate-300" />
              <div className="flex-1 flex items-center gap-4 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400">REPORT:</span>
                  <span className="text-[12px] font-black text-[#217346] uppercase truncate max-w-[300px]">
                    {selectedPeriod || 'CUSTOM VIEW'}
                  </span>
                </div>
                <div className="h-4 w-[1px] bg-slate-200 mx-2" />
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400">FY:</span>
                  <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="text-[11px] font-bold outline-none border-b border-transparent hover:border-[#217346] cursor-pointer"
                  >
                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}-{y+1}</option>)}
                  </select>
                </div>
                <div 
                  className="flex items-center gap-2 relative group-filter"
                >
                  <span className="text-[11px] font-bold text-slate-400">TYPE:</span>
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTypeFilter(!showTypeFilter);
                      }}
                      className="text-[11px] font-bold flex items-center gap-1 border-b border-transparent hover:border-[#217346] text-[#217346]"
                    >
                      {taxTypeFilter.includes('All') ? 'All Types' : `${taxTypeFilter.length} Selected`}
                      <ChevronDown className={`w-3 h-3 transition-transform ${showTypeFilter ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {showTypeFilter && (
                        <div className="z-[60]">
                          <div 
                            className="fixed inset-0 z-[-1]" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowTypeFilter(false);
                            }} 
                          />
                          <motion.div 
                            key="type-filter-popover"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 shadow-xl rounded-lg py-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Multi-Choice Filter</span>
                            <button 
                              onClick={() => setTaxTypeFilter(['All'])}
                              className="text-[9px] font-bold text-blue-600 hover:underline"
                            >
                              Reset
                            </button>
                          </div>
                          
                          <div className="max-h-64 overflow-y-auto pt-1 text-left">
                            <button 
                              onClick={() => setTaxTypeFilter(['All'])}
                              className="w-full px-4 py-1.5 flex items-center gap-3 hover:bg-slate-50 text-[11px] text-slate-700 font-medium"
                            >
                              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${taxTypeFilter.includes('All') ? 'bg-[#217346] border-[#217346] text-white' : 'border-slate-300'}`}>
                                {taxTypeFilter.includes('All') && <CheckCircle2 className="w-2.5 h-2.5" />}
                              </div>
                              All Types
                            </button>
    
                            <div className="h-[1px] bg-slate-100 my-1 mx-2" />
                            
                            {['Yearly', 'Quarterly', 'Life Time'].map(t => (
                              <button 
                                key={t}
                                onClick={() => {
                                  setTaxTypeFilter(prev => {
                                    const next = prev.filter(v => v !== 'All');
                                    if (next.includes(t)) {
                                      const filtered = next.filter(v => v !== t);
                                      return filtered.length === 0 ? ['All'] : filtered;
                                    }
                                    return [...next, t];
                                  });
                                }}
                                className="w-full px-4 py-1.5 flex items-center gap-3 hover:bg-slate-50 text-[11px] text-slate-700 font-medium"
                              >
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${taxTypeFilter.includes(t) ? 'bg-[#217346] border-[#217346] text-white' : 'border-slate-300'}`}>
                                  {taxTypeFilter.includes(t) && <CheckCircle2 className="w-2.5 h-2.5" />}
                                </div>
                                {t}
                              </button>
                            ))}
    
                            <div className="px-3 py-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 mt-2">Tax Periods</div>
                            {[
                              `01-04-${selectedYear} to 30-06-${selectedYear}`,
                              `01-07-${selectedYear} to 30-09-${selectedYear}`,
                              `01-10-${selectedYear} to 31-12-${selectedYear}`,
                              `01-01-${selectedYear+1} to 31-03-${selectedYear+1}`,
                              `01-04-${selectedYear} to 31-03-${selectedYear+1}`,
                              'ALL 4 QUATER'
                            ].map(t => (
                              <button 
                                key={t}
                                onClick={() => {
                                  setTaxTypeFilter(prev => {
                                    const next = prev.filter(v => v !== 'All');
                                    if (next.includes(t)) {
                                      const filtered = next.filter(v => v !== t);
                                      return filtered.length === 0 ? ['All'] : filtered;
                                    }
                                    return [...next, t];
                                  });
    
                                  // Auto-update dates if needed
                                  const year = selectedYear;
                                  const nextYear = year + 1;
                                  if (t === `01-04-${year} to 30-06-${year}`) { setStartDate(`${year}-04-01`); setEndDate(`${year}-06-30`); }
                                  else if (t === `01-07-${year} to 30-09-${year}`) { setStartDate(`${year}-07-01`); setEndDate(`${year}-09-30`); }
                                  else if (t === `01-10-${year} to 31-12-${year}`) { setStartDate(`${year}-10-01`); setEndDate(`${year}-12-31`); }
                                  else if (t === `01-01-${nextYear} to 31-03-${nextYear}`) { setStartDate(`${nextYear}-01-01`); setEndDate(`${nextYear}-03-31`); }
                                  else if (t === `01-04-${year} to 31-03-${nextYear}`) { setStartDate(`${year}-04-01`); setEndDate(`${nextYear}-03-31`); }
                                  else if (t === 'ALL 4 QUATER') { setStartDate(`${year}-04-01`); setEndDate(`${nextYear}-03-31`); }
                                }}
                                className="w-full px-4 py-1.5 flex items-center gap-3 hover:bg-slate-50 text-[10px] text-slate-500 font-mono"
                              >
                                <div className={`w-3 h-3 rounded border flex items-center justify-center ${taxTypeFilter.includes(t) ? 'bg-[#217346] border-[#217346] text-white' : 'border-slate-300'}`}>
                                  {taxTypeFilter.includes(t) && <CheckCircle2 className="w-2 h-2" />}
                                </div>
                                {t}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Spreadsheet Grid */}
            <div className="flex-1 overflow-auto bg-[#e1e1e1] relative select-none scrollbar-thin scrollbar-thumb-slate-400">
              <table className="border-separate border-spacing-0 table-fixed bg-white min-w-full">
                <thead className="sticky top-0 z-10 shadow-sm">
                  {/* Column Headers A, B, C... */}
                  <tr className="bg-[#f3f3f3]">
                    <th className="w-12 h-6 border-r border-b border-slate-300 text-[10px] font-normal text-slate-500 text-center sticky left-0 z-20 bg-[#f3f3f3]"></th>
                    {(isAllRecordView ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E', 'F', 'G']).map(col => (
                      <th key={col} className="w-[180px] h-6 border-r border-b border-slate-300 text-[10px] font-normal text-slate-500 text-center">
                        {col}
                      </th>
                    ))}
                    <th className="w-24 h-6 border-b border-slate-300"></th>
                  </tr>
                  {/* Field Names */}
                  <tr className="bg-[#f3f3f3]">
                    <th className="w-12 h-8 border-r border-b border-slate-300 sticky left-0 z-20 bg-[#f3f3f3]"></th>
                    {isAllRecordView ? (
                      <>
                        <th className="px-3 border-r border-b border-slate-300 text-[11px] font-bold text-slate-600 text-left bg-slate-50/50">Vehicle No</th>
                        <th className="px-3 border-r border-b border-slate-300 text-[11px] font-bold text-slate-600 text-left bg-slate-50/50">Owner Name</th>
                        <th className="px-3 border-r border-b border-slate-300 text-[11px] font-bold text-slate-600 text-left bg-slate-50/50">Tax Type</th>
                        <th className="px-3 border-r border-b border-slate-300 text-[11px] font-bold text-slate-600 text-left bg-slate-50/50">Amount</th>
                      </>
                    ) : (
                      <>
                        <th className="px-3 border-r border-b border-slate-300 text-[11px] font-bold text-slate-600 text-left bg-slate-50/50 w-16">S.No</th>
                        <th className="px-3 border-r border-b border-slate-300 text-[11px] font-bold text-slate-600 text-left bg-slate-50/50">Vehicle Number</th>
                        <th className="px-3 border-r border-b border-slate-300 text-[11px] font-bold text-slate-600 text-left bg-slate-50/50">Owner Name</th>
                        <th className="px-3 border-r border-b border-slate-300 text-[11px] font-bold text-slate-600 text-left bg-slate-50/50">Tax Amount</th>
                        <th className="px-3 border-r border-b border-slate-300 text-[11px] font-bold text-slate-600 text-left bg-slate-50/50">GT</th>
                        <th className="px-3 border-r border-b border-slate-300 text-[11px] font-bold text-slate-600 text-left bg-slate-50/50">In Date</th>
                        <th className="px-3 border-r border-b border-slate-300 text-[11px] font-bold text-slate-600 text-left bg-slate-50/50">Paid Date</th>
                      </>
                    )}
                    <th className="px-3 border-b border-slate-300 text-[11px] font-bold text-slate-600 text-center bg-slate-50/50 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {spreadsheetRows.map((record, i) => {
                    const isNew = String(record.id).startsWith('empty-');
                    return (
                      <tr key={record.id} className="group hover:bg-[#e7f1ec]">
                        {/* Row Index Label */}
                        <td className="w-12 h-8 border-r border-b border-slate-200 bg-[#f3f3f3] text-[10px] text-slate-500 text-center sticky left-0 z-10 transition-colors group-hover:bg-[#d0d7d4] group-hover:text-slate-700">
                          {i + 1}
                        </td>
                        
                        {isAllRecordView ? (
                          <>
                            {/* Vehicle Column */}
                            <td className="border-r border-b border-slate-200 p-0 focus-within:ring-2 focus-within:ring-[#217346] focus-within:z-10 bg-inherit w-[180px]">
                              <input 
                                type="text"
                                value={record.plateNumber || ''}
                                onChange={(e) => handleUpdate(record.id, { plateNumber: e.target.value })}
                                className="w-full h-8 px-3 bg-transparent text-[11px] text-[#0f172a] uppercase outline-none focus:bg-white"
                              />
                            </td>
                            {/* Owner Column */}
                            <td className="border-r border-b border-slate-200 p-0 focus-within:ring-2 focus-within:ring-[#217346] focus-within:z-10 bg-inherit w-[180px]">
                              <input 
                                type="text"
                                value={record.ownerName || ''}
                                onChange={(e) => handleUpdate(record.id, { ownerName: e.target.value })}
                                className="w-full h-8 px-3 bg-transparent text-[11px] text-slate-700 uppercase outline-none focus:bg-white truncate"
                              />
                            </td>
                            {/* Type Column */}
                            <td className="border-r border-b border-slate-200 p-0 focus-within:ring-2 focus-within:ring-[#217346] focus-within:z-10 bg-inherit w-[180px] relative">
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveRowSelector(activeRowSelector === record.id ? null : (record.id as string));
                                }}
                                className="relative h-8 flex items-center justify-between px-3 cursor-pointer group-hover/cell:bg-slate-50 focus:bg-slate-50 transition-colors outline-none"
                              >
                                <span className="text-[11px] text-slate-500 uppercase truncate pr-4">
                                  {record.taxType || 'Select Type'}
                                </span>
                                <ChevronDown className="w-3 h-3 text-slate-400" />
                                
                                {activeRowSelector === record.id && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveRowSelector(null); }} />
                                    <div 
                                      onClick={(e) => e.stopPropagation()}
                                      className="absolute top-full left-0 w-[240px] bg-white border border-slate-300 shadow-xl rounded-md py-2 z-50"
                                    >
                                      <div className="px-3 pb-2 border-b border-slate-100 mb-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Multi-Choice Selection</p>
                                      </div>
                                      <div className="max-h-60 overflow-y-auto">
                                        {['Yearly', 'Quarterly', 'Life Time'].map(type => {
                                          const isSelected = (record.taxType || '').split(', ').includes(type);
                                          return (
                                            <button
                                              key={type}
                                              type="button"
                                              onClick={() => {
                                                const current = (record.taxType || '').split(', ').filter(v => v);
                                                const next = isSelected ? current.filter(v => v !== type) : [...current, type];
                                                handleUpdate(record.id, { taxType: next.join(', ') });
                                              }}
                                              className="w-full px-4 py-1.5 hover:bg-slate-50 flex items-center gap-3 transition-colors text-left"
                                            >
                                              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#217346] border-[#217346] text-white' : 'border-slate-300 bg-white'}`}>
                                                {isSelected && <CheckCircle2 className="w-2.5 h-2.5" />}
                                              </div>
                                              <span className={`text-[11px] font-medium ${isSelected ? 'text-[#217346]' : 'text-slate-600'}`}>{type}</span>
                                            </button>
                                          );
                                        })}
                                        <div className="h-[1px] bg-slate-100 my-1 mx-2" />
                                        <p className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 text-left">Tax Periods</p>
                                        {[
                                          `01-04-${selectedYear} to 30-06-${selectedYear}`,
                                          `01-07-${selectedYear} to 30-09-${selectedYear}`,
                                          `01-10-${selectedYear} to 31-12-${selectedYear}`,
                                          `01-01-${selectedYear+1} to 31-03-${selectedYear+1}`,
                                          `01-04-${selectedYear} to 31-03-${selectedYear+1}`,
                                          'ALL 4 QUATER'
                                        ].map(type => {
                                          const isSelected = (record.taxType || '').split(', ').includes(type);
                                          return (
                                            <button
                                              key={type}
                                              type="button"
                                              onClick={() => {
                                                const current = (record.taxType || '').split(', ').filter(v => v);
                                                const next = isSelected ? current.filter(v => v !== type) : [...current, type];
                                                handleUpdate(record.id, { taxType: next.join(', ') });
                                              }}
                                              className="w-full px-4 py-1.5 hover:bg-slate-50 flex items-center gap-3 transition-colors text-left"
                                            >
                                              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#217346] border-[#217346] text-white' : 'border-slate-300 bg-white'}`}>
                                                {isSelected && <CheckCircle2 className="w-2.5 h-2.5" />}
                                              </div>
                                              <span className={`text-[10px] font-mono ${isSelected ? 'text-[#217346]' : 'text-slate-500'}`}>{type}</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                            {/* Amount Column */}
                            <td className="border-r border-b border-slate-200 p-0 focus-within:ring-2 focus-within:ring-[#217346] focus-within:z-10 bg-inherit w-[180px]">
                              <input 
                                type="number"
                                value={record.taxAmount || ''}
                                onChange={(e) => handleUpdate(record.id, { taxAmount: e.target.value })}
                                className="w-full h-8 px-3 bg-transparent text-[11px] font-bold text-emerald-700 outline-none focus:bg-white text-right"
                              />
                            </td>
                          </>
                        ) : (
                          <>
                            {/* S.No */}
                            <td className="border-r border-b border-slate-200 px-3 h-8 text-[11px] text-slate-500 bg-slate-50/10 w-16 text-center">
                              {isNew ? '' : (i + 1)}
                            </td>
                            {/* Vehicle Number */}
                            <td className="border-r border-b border-slate-200 p-0 focus-within:ring-2 focus-within:ring-[#217346] focus-within:z-10 bg-inherit w-[180px]">
                              <input 
                                type="text"
                                value={record.plateNumber || ''}
                                onChange={(e) => handleUpdate(record.id, { plateNumber: e.target.value })}
                                className="w-full h-8 px-3 bg-transparent text-[11px] text-[#0f172a] uppercase outline-none focus:bg-white"
                              />
                            </td>
                            {/* Owner Name */}
                            <td className="border-r border-b border-slate-200 p-0 focus-within:ring-2 focus-within:ring-[#217346] focus-within:z-10 bg-inherit w-[180px]">
                              <input 
                                type="text"
                                value={record.ownerName || ''}
                                onChange={(e) => handleUpdate(record.id, { ownerName: e.target.value })}
                                className="w-full h-8 px-3 bg-transparent text-[11px] text-slate-700 uppercase outline-none focus:bg-white truncate"
                              />
                            </td>
                            {/* Tax Amount */}
                            <td className="border-r border-b border-slate-200 p-0 focus-within:ring-2 focus-within:ring-[#217346] focus-within:z-10 bg-inherit w-[180px]">
                              <input 
                                type="number"
                                value={record.taxAmount || ''}
                                onChange={(e) => handleUpdate(record.id, { taxAmount: e.target.value })}
                                className="w-full h-8 px-3 bg-transparent text-[11px] text-emerald-700 font-bold outline-none focus:bg-white text-right"
                              />
                            </td>
                            {/* GT */}
                            <td className="border-r border-b border-slate-200 p-0 focus-within:ring-2 focus-within:ring-[#217346] focus-within:z-10 bg-inherit w-[180px]">
                              <input 
                                type="text"
                                value={record.gt || ''}
                                onChange={(e) => handleUpdate(record.id, { gt: e.target.value })}
                                className="w-full h-8 px-3 bg-transparent text-[11px] text-slate-600 outline-none focus:bg-white"
                              />
                            </td>
                            {/* In Date */}
                            <td className="border-r border-b border-slate-200 p-0 focus-within:ring-2 focus-within:ring-[#217346] focus-within:z-10 bg-inherit w-[180px]">
                              <input 
                                type="date"
                                value={record.inDate || ''}
                                onChange={(e) => handleUpdate(record.id, { inDate: e.target.value })}
                                className="w-full h-8 px-2 bg-transparent text-[11px] text-slate-600 outline-none focus:bg-white"
                              />
                            </td>
                            {/* Paid Date */}
                            <td className="border-r border-b border-slate-200 p-0 focus-within:ring-2 focus-within:ring-[#217346] focus-within:z-10 bg-inherit w-[180px]">
                              <input 
                                type="date"
                                value={record.paidDate || ''}
                                onChange={(e) => handleUpdate(record.id, { paidDate: e.target.value })}
                                className="w-full h-8 px-2 bg-transparent text-[11px] text-slate-600 outline-none focus:bg-white"
                              />
                            </td>
                          </>
                        )}
                        
                        {/* Actions Column */}
                        <td className="border-b border-slate-200 p-0 text-center bg-slate-50/30 w-24">
                           <div className="flex items-center justify-center gap-1 h-8">
                             {!isNew && (
                               <>
                                 <button
                                   onClick={() => {
                                     const vehicle = vehicles.find(v => v.plateNumber === record.plateNumber);
                                     if (vehicle) onViewVehicle(vehicle);
                                   }}
                                   className="text-slate-400 hover:text-blue-600 p-1 transition-colors"
                                 >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                 </button>
                                 <button
                                   onClick={() => {
                                     if(confirm('Permanently delete this row?')) {
                                       api.deleteTaxRecord(record.id).then(() => fetchRecords());
                                     }
                                   }}
                                   className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                                 >
                                    <Trash2 className="w-3.5 h-3.5" />
                                 </button>
                               </>
                             )}
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Spreadsheet Status Bar */}
            <div className="bg-[#217346] text-white px-4 py-1 flex items-center gap-10 text-[11px] font-medium z-30">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" />
                READY
              </div>
              <div className="h-3 w-[1px] bg-white/20" />
              <div className="flex items-center gap-2">
                AVG: ₹ {(records.reduce((acc, r) => acc + (Number(r.taxAmount) || 0), 0) / (records.length || 1)).toFixed(0)}
              </div>
              <div className="flex items-center gap-2">
                SUM: ₹ {records.reduce((acc, r) => acc + (Number(r.taxAmount) || 0), 0).toLocaleString()}
              </div>
              <div className="ml-auto opacity-70">
                PROCESSED BY SYSTEM_TERMINAL_XP
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
