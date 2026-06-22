import React, { useState, useEffect } from 'react';
import { Car, Shield, AlertCircle, Phone, LogOut, ChevronRight, FileCheck, Globe, Printer, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { Vehicle } from '../types';
import ExpiryBadge from './ExpiryBadge';
import Logo from './Logo';

interface UserDashboardProps {
  identifier: string;
  onLogout: () => void;
  reminderDays: number;
}

export default function UserDashboard({ identifier, onLogout, reminderDays }: UserDashboardProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserVehicles = async () => {
      setLoading(true);
      try {
        const data = await api.searchVehicles(identifier);
        setVehicles(data);
      } catch (err) {
        console.error("User vehicle search error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserVehicles();
  }, [identifier]);

  return (
    <div className="min-h-screen bg-modern-bg p-6 sm:p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#fbc4cc]/10 rounded-full blur-3xl -ml-32 -mb-32" />
      
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-white p-3 rounded-2xl shadow-xl border border-modern-border">
              <Logo className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-modern-text">Client Portal</h1>
              <p className="text-modern-muted text-xs font-black uppercase tracking-[0.2em]">{identifier}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-4 bg-white border border-modern-border rounded-2xl text-modern-muted hover:text-blue-500 hover:border-blue-100 transition-all active:scale-95 shadow-sm"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-48 gap-6">
            <div className="w-16 h-16 border-4 border-modern-blue/10 border-t-modern-blue rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-modern-blue">Fetching Vehicle State</p>
          </div>
        ) : (
          <div className="space-y-8">
            {vehicles.length > 0 ? (
              vehicles.map(vehicle => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={vehicle.id} 
                  className="modern-card p-10 bg-white shadow-2xl space-y-12"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-12 border-b border-modern-border">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-modern-blue/5 border border-modern-blue/10 flex items-center justify-center">
                        <Car className="w-8 h-8 text-modern-blue" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-modern-muted mb-1">Registered Vehicle</p>
                        <h2 className="text-4xl font-display font-bold text-modern-text tracking-tight">{vehicle.plateNumber}</h2>
                      </div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 px-6 py-3 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Verification</p>
                      <p className="text-xs font-bold text-emerald-700 flex items-center gap-2 mt-0.5">
                        <Shield className="w-4 h-4" />
                        SECURE ACTIVE
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    <section className="space-y-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-modern-muted">Expiry Monitor</p>
                      <div className="space-y-4">
                        {[
                          { label: 'FC Expiry', date: vehicle.fcExpiry },
                          { label: 'Insurance', date: vehicle.insuranceExpiry },
                          { label: 'Permit', date: vehicle.permitExpiry }
                        ].map(doc => (
                          <div key={doc.label} className="flex items-center justify-between p-5 bg-slate-50 border border-modern-border rounded-2xl">
                            <span className="text-[11px] font-bold text-modern-text">{doc.label}</span>
                            <ExpiryBadge date={doc.date} reminderDays={reminderDays} />
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-modern-muted">Quick Actions</p>
                      <div className="grid grid-cols-2 gap-4">
                        <button className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-modern-border rounded-3xl hover:bg-modern-blue/5 hover:border-modern-blue/20 transition-all group active:scale-95 text-center">
                          <Printer className="w-6 h-6 text-slate-400 group-hover:text-modern-blue mb-3" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Print Details</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-modern-border rounded-3xl hover:bg-emerald-50 hover:border-emerald-200 transition-all group active:scale-95 text-center">
                          <Phone className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 mb-3" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Call Agent</span>
                        </button>
                      </div>
                    </section>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="modern-card p-20 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl border border-modern-border flex items-center justify-center mb-10">
                  <AlertCircle className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-modern-text mb-4">No Vehicle Records</h3>
                <p className="text-modern-muted text-sm max-w-sm mb-12 font-medium">Your vehicle number was not found in our database. Please contact Arul Jothi Auto Consulting for registration.</p>
                <div className="flex gap-4">
                   <button className="modern-button-primary">Call Support</button>
                   <button onClick={onLogout} className="modern-button-secondary">Try Another ID</button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
