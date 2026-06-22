import React, { useState, useEffect } from 'react';
import { X, Save, Car, User, Phone, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { Vehicle } from '../types';

interface VehicleFormProps {
  onClose: () => void;
  initialData?: Vehicle | null;
}

export default function VehicleForm({ onClose, initialData }: VehicleFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    plateNumber: '',
    ownerName: '',
    phoneNumber: '',
    fcExpiry: '',
    insuranceExpiry: '',
    permitExpiry: '',
    nationalPermitExpiry: '',
    pollutionExpiry: '',
    taxExpiry: '',
    greenTaxExpiry: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        plateNumber: formData.plateNumber?.toUpperCase()
      };

      if (initialData?.id) {
        await api.updateVehicle(initialData.id, dataToSave);
      } else {
        await api.createVehicle(dataToSave);
      }
      onClose();
      // Note: We might need a way to trigger a refresh in App.tsx or use a callback
      // For now, assume a full refresh or the user will navigate
      window.location.reload(); 
    } catch (error) {
      console.error("Error saving vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'plateNumber', label: 'Plate Number', icon: Car, placeholder: 'TN01AB1234', required: true },
    { name: 'ownerName', label: 'Owner Name', icon: User, placeholder: 'Full Name', required: true },
    { name: 'phoneNumber', label: 'Phone Number', icon: Phone, placeholder: '10-digit Mobile', required: true },
    { name: 'fcExpiry', label: 'FC Expiry', icon: Calendar, type: 'date' },
    { name: 'insuranceExpiry', label: 'Insurance Expiry', icon: Calendar, type: 'date' },
    { name: 'permitExpiry', label: 'Permit Expiry', icon: Calendar, type: 'date' },
    { name: 'nationalPermitExpiry', label: 'N. Permit Expiry', icon: Calendar, type: 'date' },
    { name: 'pollutionExpiry', label: 'Pollution Expiry', icon: Calendar, type: 'date' },
    { name: 'taxExpiry', label: 'Tax Expiry', icon: Calendar, type: 'date' },
    { name: 'greenTaxExpiry', label: 'Green Tax Expiry', icon: Calendar, type: 'date' },
  ];

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
              <Car className="w-6 h-6 text-modern-blue" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-modern-text">{initialData ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
              <p className="text-modern-muted text-[10px] font-black uppercase tracking-[0.2em] mt-1">Registry Entry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-modern-muted hover:bg-slate-50 rounded-xl transition-all"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-12 space-y-8 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">{field.label}</label>
                <div className="modern-input flex items-center gap-4 p-0 px-6 focus-within:ring-4 focus-within:ring-modern-blue/10 focus-within:border-modern-blue">
                  <div className="text-slate-400 flex-shrink-0">
                    <field.icon className="w-5 h-5" />
                  </div>
                  <input 
                    type={field.type || 'text'}
                    value={(formData as any)[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="bg-transparent border-none outline-none py-4 w-full font-bold text-modern-text placeholder:text-slate-300"
                  />
                </div>
              </div>
            ))}
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
                <Save className="w-5 h-5" />
                <span className="text-[11px] font-black uppercase tracking-widest">Commit Changes</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
