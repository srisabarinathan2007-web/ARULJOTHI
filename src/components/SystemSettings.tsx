import React, { useState, useEffect, useRef } from 'react';
import { X, Shield, Bell, Save, MessageSquare, Key, Clock, Settings, ArrowRight, Upload, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';

interface SystemSettingsProps {
  onClose: () => void;
}

export default function SystemSettings({ onClose }: SystemSettingsProps) {
  const [reminderDays, setReminderDays] = useState(15);
  const [whatsappToken, setWhatsappToken] = useState('');
  const [whatsappInstance, setWhatsappInstance] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await api.getSettings('vahan_config');
        if (data) {
          if (data.expiryReminderDays) setReminderDays(data.expiryReminderDays);
          if (data.whatsappToken) setWhatsappToken(data.whatsappToken);
          if (data.whatsappInstanceId) setWhatsappInstance(data.whatsappInstanceId);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    loadSettings();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        await api.uploadLogo(file);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        // Reload to see the new logo everywhere
        window.location.reload();
      } catch (error) {
        console.error("Logo upload failed:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.updateSettings('vahan_config', {
        expiryReminderDays: reminderDays,
        whatsappToken,
        whatsappInstanceId: whatsappInstance
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      window.location.reload(); 
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
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
              <Settings className="w-6 h-6 text-modern-blue" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-modern-text">Global Config</h2>
              <p className="text-modern-muted text-[10px] font-black uppercase tracking-[0.2em] mt-1">System Wide Settings</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-modern-muted hover:bg-slate-50 rounded-xl transition-all"><X className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar">
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <ImageIcon className="w-5 h-5 text-modern-blue" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-modern-muted">Branding & Identity</h3>
            </div>
            
            <div className="modern-card p-10 bg-slate-50/50 space-y-8">
              <div className="flex items-center gap-8">
                <div className="w-24 h-24 bg-white rounded-3xl border border-modern-border flex items-center justify-center overflow-hidden shadow-sm">
                  <img src={`/logo.png?t=${Date.now()}`} id="settings-logo-preview" onError={(e) => (e.currentTarget.src = 'https://raw.githubusercontent.com/srisabarinathan2007/aruljothi/main/LOGO.png')} className="w-16 h-16 object-contain" />
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-bold text-modern-text">System Logo</p>
                  <p className="text-[10px] text-modern-muted font-medium">Recommended: Square PNG with transparent background.</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleLogoUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="modern-button-secondary py-3 px-6 flex items-center gap-3"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-modern-text">Upload New Logo</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <Bell className="w-5 h-5 text-modern-blue" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-modern-muted">Notification Logic</h3>
            </div>
            
            <div className="modern-card p-10 bg-slate-50/50 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-modern-text flex justify-between">
                  <span>Expiry Threshold (Days)</span>
                  <span className="text-modern-blue">{reminderDays} Days</span>
                </label>
                <input 
                  type="range" min="1" max="90" 
                  value={reminderDays} 
                  onChange={(e) => setReminderDays(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-modern-blue"
                />
                <p className="text-[9px] font-medium text-modern-muted">Reminder alerts will trigger this many days before the actual document expiry.</p>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-modern-muted">WhatsApp Integration</h3>
            </div>
            
            <div className="modern-card p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">Provider Token</label>
                <input 
                  type="password" 
                  value={whatsappToken} 
                  onChange={(e) => setWhatsappToken(e.target.value)}
                  placeholder="••••••••••••••••" 
                  className="modern-input w-full" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-modern-muted ml-2">Instance ID</label>
                <input 
                  type="text" 
                  value={whatsappInstance} 
                  onChange={(e) => setWhatsappInstance(e.target.value)}
                  placeholder="inst_8892_abc" 
                  className="modern-input w-full" 
                />
              </div>
            </div>
          </section>
        </div>

        <div className="p-10 border-t border-modern-border bg-white sticky bottom-0 z-10">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="modern-button-primary w-full flex items-center justify-center gap-4 py-5"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {saveSuccess ? 'Changes Applied!' : 'Save Configurations'}
                </span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
