import React from 'react';
import { X, Phone, User, Calendar, Shield, Share2, Printer, MapPin, Hash, CheckCircle2, Trash2, Car, MessageSquare, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Vehicle } from '../types';
import { api } from '../services/api';
import ExpiryBadge from './ExpiryBadge';
import { format, parseISO } from 'date-fns';
import { cn } from '../lib/utils';

interface VehicleDetailsProps {
  vehicle: Vehicle;
  onClose: () => void;
  onEdit: (vehicle: Vehicle) => void;
  isAdmin: boolean;
}

export default function VehicleDetails({ vehicle, onClose, onEdit, isAdmin }: VehicleDetailsProps) {
  const handlePrint = () => window.print();

  const handleWhatsApp = () => {
    const message = `Hello, this is a reminder regarding vehicle ${vehicle.plateNumber}.
FC Expiry: ${vehicle.fcExpiry || 'N/A'}
Insurance: ${vehicle.insuranceExpiry || 'N/A'}
Owner: ${vehicle.ownerName}`;
    const url = `https://wa.me/91${vehicle.phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-modern-text/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[90vh] border border-white/20"
      >
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-[20px] flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Car className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-[#1e293b] tracking-tight uppercase">{vehicle.plateNumber}</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Vehicle Assessment Profile</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Owner & Stats */}
            <div className="lg:col-span-5 space-y-10">
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-1 h-4 bg-blue-600 rounded-full" />
                   <h3 className="text-[11px] font-black uppercase tracking-widest text-[#1e293b]">Ownership Identity</h3>
                </div>
                <div className="bg-[#f8fafc] border border-slate-200/50 rounded-3xl p-8 space-y-6 shadow-sm">
                  <div className="flex items-start justify-between">
                     <div>
                        <p className="text-2xl font-black text-[#1e293b] uppercase leading-tight mb-2">{vehicle.ownerName}</p>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{vehicle.phoneNumber}</p>
                     </div>
                     <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                     </div>
                  </div>
                  
                  <div className="flex gap-4">
                     <a href={`tel:${vehicle.phoneNumber}`} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-[#1e293b] font-black text-[10px] uppercase tracking-widest hover:border-emerald-400 transition-all flex items-center justify-center gap-3 active:scale-95">
                        <Phone className="w-4 h-4 text-emerald-500" />
                        Voice Call
                     </a>
                     <button onClick={handleWhatsApp} className="flex-1 py-4 bg-emerald-600 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95">
                        <MessageSquare className="w-4 h-4" />
                        WhatsApp
                     </button>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-blue-600 rounded-full" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-[#1e293b]">System Management</h3>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => {
                        const baseUrl = window.location.origin;
                        window.open(`${baseUrl}?openVehicleId=${vehicle.id}`, '_blank');
                      }}
                      className="p-6 bg-white border border-slate-100 rounded-3xl flex flex-col items-center gap-3 hover:border-blue-400 transition-all group active:scale-95 shadow-sm"
                    >
                       <MapPin className="w-6 h-6 text-slate-300 group-hover:text-blue-600 transition-colors" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">New Tab</span>
                    </button>
                    <button 
                      onClick={() => onEdit(vehicle)}
                      className="p-6 bg-white border border-slate-100 rounded-3xl flex flex-col items-center gap-3 hover:border-blue-400 transition-all group active:scale-95 shadow-sm"
                    >
                       <FileText className="w-6 h-6 text-slate-300 group-hover:text-blue-600 transition-colors" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Edit Asset</span>
                    </button>
                    <button 
                      onClick={handlePrint}
                      className="p-6 bg-white border border-slate-100 rounded-3xl flex flex-col items-center gap-3 hover:border-blue-400 transition-all group active:scale-95 shadow-sm"
                    >
                       <Printer className="w-6 h-6 text-slate-300 group-hover:text-blue-600 transition-colors" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Export PDF</span>
                    </button>
                    <button 
                      className="p-6 bg-white border border-slate-100 rounded-3xl flex flex-col items-center gap-3 hover:border-emerald-400 transition-all group active:scale-95 shadow-sm"
                    >
                       <Share2 className="w-6 h-6 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Transfer</span>
                    </button>
                    <button 
                      onClick={async () => {
                        if (window.confirm('Delete this vehicle record permanently?')) {
                          await api.deleteVehicle(vehicle.id);
                          onClose();
                        }
                      }}
                      className="p-6 bg-rose-50/50 border border-rose-100 rounded-3xl flex flex-col items-center gap-3 hover:bg-rose-50 transition-all group active:scale-95"
                    >
                       <Trash2 className="w-6 h-6 text-rose-300 group-hover:text-rose-500 transition-colors" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Purge Data</span>
                    </button>
                 </div>
              </section>
            </div>

            {/* Right Column: Documents Timeline */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-[#1e293b]">Compliance Registry</h3>
                 </div>
                 <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Total 7 Docs tracked</span>
              </div>
              
              <div className="bg-[#f8fafc] border border-slate-200/30 rounded-[32px] overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100">
                  {[
                    { label: 'Fitness Certificate (FC)', date: vehicle.fcExpiry },
                    { label: 'Insurance Policy', date: vehicle.insuranceExpiry },
                    { label: 'State Road Permit', date: vehicle.permitExpiry },
                    { label: 'National Authorization (NP)', date: vehicle.nationalPermitExpiry },
                    { label: 'Emission Test (Pollution)', date: vehicle.pollutionExpiry },
                    { label: 'Commercial Tax', date: vehicle.taxExpiry },
                    { label: 'Environmental Tax (Green)', date: vehicle.greenTaxExpiry }
                  ].map((doc) => (
                    <div key={doc.label} className="px-8 py-6 flex items-center justify-between hover:bg-white transition-colors group/doc">
                      <div className="flex items-center gap-4">
                         <div className={cn(
                           "w-10 h-10 rounded-xl flex items-center justify-center border",
                           doc.date ? "bg-white border-slate-100" : "bg-slate-50 border-transparent opacity-30"
                         )}>
                            <Hash className="w-4 h-4 text-slate-300 group-hover/doc:text-blue-600 transition-colors" />
                         </div>
                         <div>
                            <p className="text-sm font-black text-[#1e293b] uppercase group-hover/doc:text-blue-700 transition-colors">{doc.label}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Automated Scan Entry</p>
                         </div>
                      </div>
                      <ExpiryBadge date={doc.date} reminderDays={21} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
