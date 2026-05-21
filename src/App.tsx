import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { api } from './services/api';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import VehicleList from './components/VehicleList';
import TaxDashboard from './components/TaxDashboard';
import TaxReport from './components/TaxReport';
import BillingDashboard from './components/BillingDashboard';
import AccountsDashboard from './components/AccountsDashboard';
import AadharPrint from './components/AadharPrint';
import SystemSettings from './components/SystemSettings';
import VehicleDetails from './components/VehicleDetails';
import BulkImport from './components/BulkImport';
import VehicleForm from './components/VehicleForm';
import TaxForm from './components/TaxForm';
import BillingForm from './components/BillingForm';
import Logo from './components/Logo';
import { 
  Menu, Car, Calculator, Receipt, 
  Settings as SettingsIcon, LogOut, ChevronRight, Plus,
  FileText, IndianRupee, Printer, Headphones, Search, Filter, FileDown, X as CloseIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type DashboardView = 'vehicles' | 'tax' | 'tax-report' | 'billing' | 'accounts' | 'aadhar';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Terminal Crash Log:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white p-10 rounded-[32px] border border-slate-200 shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Terminal Halted</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              A runtime error occurs. This often happens due to network issues or corrupted session data.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 overflow-auto max-h-32">
              <code className="text-[10px] text-slate-400 font-mono break-all">
                {this.state.error?.message || 'Unknown Error'}
              </code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-slate-800 transition-all active:scale-95"
            >
              Reload Terminal
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors"
            >
              Reset All Data
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [userState, setUserState] = useState<{
    isAuthenticated: boolean;
    isAdmin: boolean;
    identifier: string;
    loading: boolean;
  }>({
    isAuthenticated: false,
    isAdmin: false,
    identifier: '',
    loading: true
  });

  const [activeView, setActiveView] = useState<DashboardView>(() => {
    try {
      const saved = localStorage.getItem('aruljothi_last_view');
      const validViews: DashboardView[] = ['vehicles', 'tax', 'tax-report', 'billing', 'accounts', 'aadhar'];
      if (saved && validViews.includes(saved as DashboardView)) {
        return saved as DashboardView;
      }
    } catch (e) {
      console.warn("View persistence error:", e);
    }
    return 'tax';
  });

  useEffect(() => {
    // Safety timeout: If app doesn't load in 5 seconds, force it to stop loading
    const timer = setTimeout(() => {
      setUserState(prev => prev.loading ? { ...prev, loading: false } : prev);
    }, 5000);

    try {
      const savedLogin = localStorage.getItem('aruljothi_session');
      if (savedLogin) {
        const { identifier, isAdmin } = JSON.parse(savedLogin);
        setUserState({
          isAuthenticated: true,
          isAdmin,
          identifier,
          loading: false
        });
      } else {
        setUserState(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error("Local storage error:", err);
      localStorage.removeItem('aruljothi_session');
      setUserState(prev => ({ ...prev, loading: false }));
    }

    // Fetch system settings
    const loadSettings = async () => {
      try {
        const config = await api.getSettings('vahan_config');
        if (config?.expiryReminderDays) {
          setReminderDays(config.expiryReminderDays);
        }
      } catch (err) {
        console.warn("Settings fetch failed:", err);
      }
    };
    loadSettings();

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('aruljothi_last_view', activeView);
  }, [activeView]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('aruljothi_last_view');
      return saved !== 'tax';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [reminderDays, setReminderDays] = useState(15);
  const [showSettings, setShowSettings] = useState(false);
  const [showImport, setShowImport] = useState<{ active: boolean, type: 'vehicles' | 'tax' | 'billing' }>({
    active: false,
    type: 'vehicles'
  });
  const [showForm, setShowForm] = useState<{ active: boolean, type: 'vehicles' | 'tax' | 'billing', data: any }>({
    active: false,
    type: 'vehicles',
    data: null
  });

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  const fetchVehicles = async () => {
    if (userState.isAuthenticated && userState.isAdmin) {
      setVehiclesLoading(true);
      try {
        const data = await api.getVehicles();
        setVehicles(data);
      } catch (err) {
        console.error("Failed to fetch vehicles:", err);
      } finally {
        setVehiclesLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [userState.isAuthenticated, userState.isAdmin]);

  const handleLogin = (identifier: string, isAdmin: boolean) => {
    const session = { identifier, isAdmin };
    localStorage.setItem('aruljothi_session', JSON.stringify(session));
    setUserState({
      isAuthenticated: true,
      isAdmin,
      identifier,
      loading: false
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('aruljothi_session');
    setUserState({
      isAuthenticated: false,
      isAdmin: false,
      identifier: '',
      loading: false
    });
  };

  if (userState.loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', padding: '2rem' }}>
        <div style={{ width: '64px', height: '64px', border: '4px solid #3b82f61a', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1.5rem', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#3b82f6' }}>Arul Jothi Terminal Initializing</p>
        <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
      </div>
    );
  }

  if (!userState.isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (!userState.isAdmin) {
    return (
      <UserDashboard 
        identifier={userState.identifier} 
        onLogout={handleLogout} 
        reminderDays={reminderDays}
      />
    );
  }

  const navItems = [
    { id: 'vehicles', label: 'Vehicle Details', icon: Car },
    { id: 'tax', label: 'Tax Admin', icon: Calculator },
    { id: 'tax-report', label: 'Tax Reports', icon: FileText },
    { id: 'billing', label: 'Billing', icon: Receipt },
    { id: 'accounts', label: 'Accounts', icon: IndianRupee },
    { id: 'aadhar', label: 'Aadhaar Print', icon: Printer },
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#f3f4f9] flex font-sans">
        {/* Sidebar - Dark Navy Style */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            className="w-72 bg-[#0a1128] flex-shrink-0 flex flex-col h-screen sticky top-0 z-50 text-white overflow-y-auto no-scrollbar no-print"
          >
            {/* Sidebar Logo */}
            <div className="pt-12 pb-8 px-10 flex flex-col items-center relative">
               <button 
                 onClick={() => setIsSidebarOpen(false)}
                 className="absolute top-4 right-4 p-2 text-white/20 hover:text-white transition-colors"
               >
                 <CloseIcon className="w-5 h-5" />
               </button>
               <div className="w-16 h-16 mb-4 filter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                  <Logo className="w-full h-full object-contain" />
               </div>
               <div className="text-center">
                 <h1 className="text-sm font-black tracking-[0.2em] uppercase">Arul Jothi</h1>
                 <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-1">Auto Consulting</p>
               </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-4 space-y-1 mt-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as DashboardView)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${
                    activeView === item.id 
                      ? 'bg-blue-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.4)] translate-x-1' 
                      : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${activeView === item.id ? 'opacity-100' : 'opacity-40'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Sidebar Bottom Extras */}
            <div className="px-6 pb-10 space-y-2">
              <div className="h-[1px] bg-white/5 mx-2 my-6" />
              
              <button 
                onClick={() => setShowSettings(true)}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-xl text-white/40 hover:text-white transition-all"
              >
                <SettingsIcon className="w-4 h-4 opacity-40" />
                <span className="text-[10px] font-black uppercase tracking-widest">System Config</span>
              </button>

               <div className="mt-4 px-6">
                 <button onClick={handleLogout} className="flex items-center gap-4 text-white/40 hover:text-blue-400 transition-colors">
                    <LogOut className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Exit Terminal</span>
                 </button>
               </div>

               <div className="mt-8 relative px-2">
                  <div className="relative rounded-2xl overflow-hidden bg-gradient-to-t from-blue-900/40 to-transparent">
                    <img 
                      src="/truck.png" 
                      className="w-full h-auto opacity-100 transition-all duration-500 scale-110 hover:scale-125"
                      alt="Terminal Truck"
                    />
                  </div>
               </div>

              {/* Customer Support footer badge */}
              <div className="mt-8 bg-[#1e293b]/40 border border-white/5 p-5 rounded-3xl flex items-center gap-4 shadow-2xl">
                 <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Headphones className="w-5 h-5 text-white" />
                 </div>
                 <div className="min-w-0">
                    <span className="block text-[8px] font-black text-white/30 uppercase tracking-widest leading-none mb-1.5">Customer Support</span>
                    <span className="block text-[11px] font-bold text-white tracking-widest leading-none">+91 98765 43210</span>
                 </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className={`flex-1 flex flex-col min-w-0 h-screen ${
        (activeView === 'tax' || activeView === 'aadhar') ? 'overflow-hidden' : 'overflow-y-auto no-scrollbar scroll-smooth'
      }`}>
        {/* Resource Mgmt Header Part */}
        {activeView !== 'aadhar' && activeView !== 'tax' && (
          <header className="px-6 lg:px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
            <div className="flex items-center gap-4">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Resource Management Dashboard</p>
                  <div className="flex items-center gap-4">
                     <h2 className="text-4xl lg:text-5xl font-black text-[#1e293b] tracking-tight">
                      {navItems.find(i => i.id === activeView)?.label || 'Dashboard'}
                     </h2>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-widest opacity-80">MANAGE REGISTRATION DOCUMENTS AND EXPIRY REMINDERS EFFORTLESSLY</p>
               </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="bg-white px-8 py-4 rounded-full flex items-center gap-4 border border-slate-200/50 shadow-sm mr-2 transition-all hover:shadow-md">
                 <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1e293b]">Active Terminal</span>
               </div>
               
               <button 
                 onClick={() => setShowSettings(true)}
                 className="w-14 h-14 bg-white rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center active:scale-95 group"
                 title="System Settings"
               >
                  <SettingsIcon className="w-6 h-6 text-[#1e293b] group-hover:rotate-90 transition-transform duration-500" />
               </button>

               <button 
                 onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                 className="w-14 h-14 bg-white rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center active:scale-95"
               >
                  <Menu className="w-6 h-6 text-[#1e293b]" />
               </button>
            </div>
          </header>
        )}

        {/* Action Controls Match */}
        {activeView === 'vehicles' && (
          <div className="px-6 lg:px-8 mb-10 no-print flex flex-col md:flex-row md:items-center justify-end gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <button 
                  onClick={async () => {
                     const btn = document.querySelector('[data-excel-trigger="true"]') as HTMLButtonElement;
                     if (btn) btn.click();
                  }}
                  className="flex-1 md:flex-none bg-white border border-slate-200 px-8 py-5 rounded-2xl flex items-center justify-center gap-4 hover:bg-slate-50 transition-all group shadow-sm active:scale-95"
                >
                  <FileDown className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1e293b]">Excel</span>
                </button>

                <button 
                  onClick={() => setShowImport({ active: true, type: 'vehicles' })}
                  className="flex-1 md:flex-none bg-white border border-slate-200 px-8 py-5 rounded-2xl flex items-center justify-center gap-4 hover:bg-slate-50 transition-all group shadow-sm active:scale-95"
                >
                  <Plus className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1e293b]">Import</span>
                </button>

                <button 
                  onClick={() => setShowForm({ active: true, type: 'vehicles', data: null })}
                  className="flex-[2] md:flex-none bg-blue-600 px-10 py-5 rounded-2xl flex items-center justify-center gap-4 hover:bg-blue-700 transition-all shadow-[0_15px_40px_rgba(37,99,235,0.3)] active:scale-95"
                >
                  <Plus className="w-5 h-5 text-white" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-white">Add Vehicle</span>
                </button>
              </div>
          </div>
        )}

        <main className={`${(activeView === 'tax' || activeView === 'aadhar') ? 'px-0' : 'px-6 lg:px-8'} flex-1 flex flex-col min-h-0`}>
          <AnimatePresence mode="wait">
             <motion.div
               key={activeView}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
               className="flex-1 flex flex-col min-h-0"
             >
              {activeView === 'vehicles' && (
                <VehicleList 
                  vehicles={vehicles}
                  loading={vehiclesLoading}
                  onViewDetails={setSelectedVehicle}
                  onEdit={(v) => setShowForm({ active: true, type: 'vehicles', data: v })}
                  onAdd={() => setShowForm({ active: true, type: 'vehicles', data: null })}
                  reminderDays={reminderDays}
                  initialExpiryFilter="all"
                  isAdmin={userState.isAdmin}
                  onImport={() => setShowImport({ active: true, type: 'vehicles' })}
                />
              )}
              {activeView === 'tax' && <TaxDashboard {...{ vehicles, onImport: () => setShowImport({active: true, type: 'tax'}), onAdd: () => setShowForm({active: true, type: 'tax', data: null}), onEdit: (t: any) => setShowForm({active: true, type: 'tax', data: t}), onViewVehicle: setSelectedVehicle }} />}
              {activeView === 'tax-report' && <TaxReport />}
              {activeView === 'billing' && <BillingDashboard />}
              {activeView === 'accounts' && <AccountsDashboard />}
              {activeView === 'aadhar' && <AadharPrint onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />}
             </motion.div>
          </AnimatePresence>
 
          {activeView !== 'tax' && activeView !== 'aadhar' && (
            <footer className="mt-20 py-16 border-t border-slate-200/50 text-center no-print">
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center justify-center gap-4">
                  <span>© 2009-2026 ARUL JOTHI AUTO CONSULTING</span>
                  <span className="w-1 h-1 bg-slate-200 rounded-full" />
                  <span>ALL RIGHTS RESERVED</span>
               </p>
            </footer>
          )}
        </main>
      </div>

      <AnimatePresence>
        {selectedVehicle && (
          <VehicleDetails 
            vehicle={selectedVehicle} 
            onClose={() => setSelectedVehicle(null)} 
            onEdit={(v) => {
              setSelectedVehicle(null);
              setShowForm({ active: true, type: 'vehicles', data: v });
            }}
            isAdmin={userState.isAdmin} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && <SystemSettings onClose={() => setShowSettings(false)} />}
        {showImport.active && (
          <BulkImport 
            type={showImport.type} 
            onClose={() => setShowImport({ ...showImport, active: false })} 
          />
        )}
        {showForm.active && showForm.type === 'vehicles' && (
          <VehicleForm 
            initialData={showForm.data} 
            onClose={() => setShowForm({ ...showForm, active: false })} 
          />
        )}
        {showForm.active && showForm.type === 'tax' && (
          <TaxForm 
            initialData={showForm.data} 
            onClose={() => setShowForm({ ...showForm, active: false })} 
          />
        )}
        {showForm.active && showForm.type === 'billing' && (
          <BillingForm 
            initialData={showForm.data} 
            onClose={() => setShowForm({ ...showForm, active: false })} 
          />
        )}
      </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
