import React, { useState } from 'react';
import { Key, Car, ArrowRight, User, Loader2, Truck, ShieldCheck, Headphones, Zap, CheckCircle2, Shield, FileText, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';

interface LoginProps {
  onLogin: (identifier: string, isAdmin: boolean) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      if (isAdminMode) {
        if (identifier === 'ARULJOTHIAUTOCONSULTING' && password === 'Aruljothi@2009') {
          onLogin(identifier, true);
        } else {
          setError('Invalid Administrative Credentials');
        }
      } else {
        if (identifier.length >= 4) {
          onLogin(identifier, false);
        } else {
          setError('Please enter a valid Plate Number');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication Service Unavailable');
    } finally {
      setLoading(false);
    }
  };

  const serviceList = [
    { name: "VEHICLE REGISTRATION", icon: Car },
    { name: "DRIVING LICENSE", icon: ShieldCheck },
    { name: "INSURANCE RENEWAL", icon: Shield },
    { name: "OWNERSHIP TRANSFER", icon: User },
    { name: "ROAD TAX", icon: Truck },
    { name: "PERMITS & NOC", icon: FileText }
  ];

  return (
    <div className="h-screen bg-[#050a1e] flex flex-col lg:flex-row relative overflow-hidden font-sans no-print selection:bg-blue-600/30">
      {/* LEFT SIDE: BRANDING */}
      <div className="relative w-full lg:w-[62%] h-full flex flex-col p-6 lg:p-10 z-10 overflow-hidden shrink-0">
        {/* Background Overlay Layer */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/city.jpg" 
            className="w-full h-full object-cover opacity-60 brightness-[0.8]" 
            alt="City Skyline"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#050a1e]/70 via-transparent to-[#050a1e]/85" />
        </div>

        {/* Content Area */}
        <div className="relative z-20 flex flex-col h-full w-full">
          {/* Top Section: Badges, Logo, Title and Services */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between w-full gap-4 lg:gap-8">
            {/* Top Left Badge */}
            <div className="relative shrink-0 mb-4 lg:mb-0">
              <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full scale-150 -z-10" />
              <img 
                src="/2009.png" 
                alt="Since 2009" 
                className="w-24 lg:w-36 h-auto object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] brightness-0 invert"
              />
            </div>

            {/* Top Center: Logo, Title and Subtext */}
            <div className="flex-1 flex flex-col items-center pt-1 lg:pt-1">
              <div className="w-16 lg:w-24 h-16 lg:h-24 mb-2 relative">
                <Logo className="w-full h-full" />
              </div>
              
              <div className="text-center relative px-2 overflow-visible">
                <h1 className="text-2xl lg:text-5xl font-black italic tracking-tight leading-none mb-0 drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)] scale-y-105 overflow-visible">
                  <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#50d8ff] via-[#00a2ff] to-[#0055ff] filter brightness-110 pr-4 inline-block font-sans">
                    ARUL JOTHI
                  </span>
                </h1>
                
                <div className="flex items-center justify-center gap-2 lg:gap-4 mt-1 lg:mt-2">
                  <div className="h-[1px] w-6 lg:w-12 bg-gradient-to-r from-transparent to-white/60" />
                  <p className="text-[#cbd5e1] font-black tracking-[0.4em] uppercase text-[7px] lg:text-[11px] drop-shadow-md whitespace-nowrap">
                    Auto Consulting
                  </p>
                  <div className="h-[1px] w-6 lg:w-12 bg-gradient-to-l from-transparent to-white/60" />
                </div>

                <div className="mt-3 lg:mt-4 bg-[#0038a8] px-3 lg:px-6 py-1 lg:py-1.5 rounded shadow-[0_10px_25px_rgba(0,0,0,0.4)] border-l-3 border-blue-400">
                  <p className="text-white text-[6px] lg:text-[9px] font-black uppercase tracking-[0.25em] whitespace-nowrap">
                    RTO SERVICES | FAST • RELIABLE • HASSLE-FREE
                  </p>
                </div>
              </div>

              <div className="mt-4 text-center max-w-sm px-2">
                <h3 className="text-[8px] lg:text-[11px] font-black text-white/90 tracking-widest uppercase mb-1 drop-shadow-sm">
                  SIMPLIFYING RTO SERVICES FOR YOU
                </h3>
              </div>
            </div>

            {/* Top Right: Services Box */}
            <div className="lg:w-[220px] w-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-2xl shrink-0">
               <div className="bg-blue-600/20 p-1.5 text-center border-b border-white/5">
                 <h4 className="text-[7px] font-black text-blue-400 tracking-[0.2em] uppercase">OUR RTO SERVICES</h4>
               </div>
               <div className="divide-y divide-white/5">
                 {serviceList.map((service, idx) => (
                   <div key={idx} className="flex items-center justify-between px-3 py-1.5 group cursor-pointer hover:bg-blue-600/30 transition-all">
                     <div className="flex items-center gap-2">
                        <service.icon className="w-2.5 h-2.5 text-blue-400" />
                        <span className="text-[8px] font-bold text-white tracking-widest uppercase">
                          {service.name}
                        </span>
                     </div>
                     <ArrowRight className="w-2 h-2 text-white/20 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Bottom Section: Hero Image & Badges */}
          <div className="mt-auto relative w-full flex flex-col items-center">
            <div className="relative flex justify-center z-10 -translate-x-2 lg:-translate-x-4">
              <img 
                src="/car.png" 
                alt="Vehicles" 
                className="w-full max-w-md lg:max-w-xl h-auto object-contain filter drop-shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
              />
            </div>

            <div className="flex flex-col items-center justify-center py-6 gap-6 relative z-20 w-full bg-gradient-to-t from-[#050a1e] via-[#050a1e]/80 to-transparent">
              <div className="flex items-center justify-center gap-6 lg:gap-14">
                {[
                  { icon: User, label: 'CONTACT' },
                  { icon: Zap, label: 'QUICK' },
                  { icon: CheckCircle2, label: 'TRUSTED' },
                  { icon: Headphones, label: 'SUPPORT' }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 group">
                    <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-blue-600 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] bg-white/5 backdrop-blur-md">
                      <item.icon className="w-4 h-4 lg:w-6 lg:h-6 text-white/50 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[6px] lg:text-[8px] font-black text-white/30 tracking-[0.3em] text-center uppercase leading-none group-hover:text-white/80 transition-colors">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center text-center">
                <p className="text-[10px] lg:text-[16px] font-black text-[#00a2ff] tracking-[0.25em] uppercase mb-2 drop-shadow-[0_4px_15px_rgba(0,162,255,0.4)]">
                  15+ YEARS OF TRUST • THOUSANDS OF HAPPY CUSTOMERS
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-[1.2px] w-6 lg:w-12 bg-white/10" />
                  <p className="text-[7px] lg:text-[10px] font-bold text-white/20 uppercase tracking-[0.5em]">
                    Serving all your RTO needs with excellence
                  </p>
                  <div className="h-[1.2px] w-6 lg:w-12 bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slanted Blade Divider */}
        <div 
          className="absolute right-[-1px] top-0 bottom-0 w-[120px] bg-white z-30 lg:block hidden" 
          style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%, 100% 0)' }} 
        />
        <div 
          className="absolute right-[-1px] top-0 bottom-0 w-[124px] bg-blue-600 z-[29] lg:block hidden" 
          style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%, 100% 0)' }} 
        />
      </div>

      {/* RIGHT SIDE: LOGIN FORM */}
      <div className="relative flex-1 bg-white flex flex-col z-20 h-full overflow-hidden shrink-0">
        {/* Blue Side Border Accent */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-600 lg:block hidden z-40" />

        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 relative z-20">
          <div className="w-full max-w-sm flex flex-col items-center">
            {/* User Icon branding */}
            <div className="flex flex-col items-center text-center mb-8 w-full">
               <div className="w-16 h-16 bg-blue-50 flex items-center justify-center rounded-full mb-4 shadow-xl shadow-blue-900/5">
                  <User className="w-8 h-8 text-blue-600" />
               </div>
               <h2 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight mb-2">Welcome Back!</h2>
               <p className="text-slate-400 font-bold text-sm">Sign in to continue to your account</p>
               <div className="w-12 h-1 bg-blue-600 rounded-full mt-4" />
            </div>

            {/* Login Mode Switch */}
            <div className="flex items-center gap-3 mb-6 w-full">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-fit">Login as</span>
               <div className="flex-1 flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button 
                    onClick={() => { setIsAdminMode(false); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isAdminMode ? 'bg-blue-700 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                     <User className="w-3.5 h-3.5" />
                     <span>Customer</span>
                  </button>
                  <button 
                    onClick={() => { setIsAdminMode(true); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isAdminMode ? 'bg-blue-700 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                     <Shield className="w-3.5 h-3.5" />
                     <span>Admin</span>
                  </button>
               </div>
            </div>

            {/* Login Card */}
            <div className="bg-white border border-slate-100 rounded-[24px] p-6 lg:p-8 w-full space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.06)] text-center relative overflow-hidden">
               <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mx-auto mb-2 border border-blue-100/50">
                  {isAdminMode ? <ShieldCheck className="w-6 h-6" /> : <Car className="w-6 h-6" />}
               </div>
               
               <div className="space-y-1">
                 <h3 className="text-sm font-black text-blue-700 tracking-[0.2em] uppercase">{isAdminMode ? 'ADMIN LOGIN' : 'CUSTOMER LOGIN'}</h3>
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Track your RTO applications</p>
               </div>

               <form onSubmit={handleLogin} className="space-y-4 text-left">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1 block">
                        {isAdminMode ? 'Admin Identity' : 'Vehicle Number'}
                     </label>
                     <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                           {isAdminMode ? <Shield className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                        </div>
                        <input 
                           type="text"
                           value={identifier}
                           onChange={(e) => setIdentifier(e.target.value.toUpperCase())}
                           placeholder={isAdminMode ? "ENTER ID" : "TN 58 U 4825"}
                           className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3.5 pl-11 pr-4 outline-none focus:border-blue-500 focus:bg-white transition-all font-black text-slate-800 tracking-[0.1em] text-sm"
                           required
                        />
                     </div>
                  </div>

                  {isAdminMode && (
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1 block">Security Access Pin</label>
                       <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                             <Key className="w-4 h-4" />
                          </div>
                          <input 
                             type="password"
                             value={password}
                             onChange={(e) => setPassword(e.target.value)}
                             placeholder="••••••••"
                             className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3.5 pl-11 pr-4 outline-none focus:border-blue-500 focus:bg-white transition-all font-black text-slate-800 tracking-[0.3em] text-sm"
                             required
                          />
                       </div>
                    </div>
                  )}

                  {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black tracking-widest text-center uppercase border border-rose-100"
                    >
                        {error}
                    </motion.div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3.5 rounded-lg font-black text-[11px] tracking-widest uppercase shadow-xl shadow-blue-700/20 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                     {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `LOGIN AS ${!isAdminMode ? 'CUSTOMER' : 'ADMIN'}`}
                  </button>
               </form>
            </div>

            <div className="text-center mt-6">
               <button className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 tracking-widest uppercase hover:text-blue-600 transition-all group">
                  <User className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                  <span>Need help? <span className="text-blue-600 underline underline-offset-4">Contact Admin</span></span>
               </button>
            </div>
          </div>
        </div>

        {/* Universal Footer */}
        <div className="p-4 text-center border-t border-slate-50 mt-auto bg-slate-900 lg:bg-transparent">
           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
              © 2009-{new Date().getFullYear()} Arul Jothi Auto Consulting.
           </p>
        </div>
      </div>
    </div>
  );
}
