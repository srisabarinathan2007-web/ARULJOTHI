import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download } from 'lucide-react';
import Logo from './Logo';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Only show our custom prompt if the user hasn't dismissed it this session
      const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the native install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User responded to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, so clear it
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember dismissal for this session to not annoy the user
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-6 flex justify-center no-print pointer-events-none">
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-[32px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-modern-border flex items-center gap-5 pointer-events-auto"
          >
            <div className="bg-rose-50 p-3 rounded-2xl shrink-0">
              <Logo className="w-12 h-12" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-lg text-modern-text leading-tight">Install Arul Jothi</h3>
              <p className="text-xs font-medium text-modern-muted truncate">Access the terminal directly from your home screen</p>
            </div>

            <div className="flex items-center gap-3">
               <button 
                onClick={handleInstall}
                className="bg-rose-500 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20 active:scale-95"
               >
                 Install
               </button>
               <button 
                onClick={handleDismiss}
                className="bg-slate-100 text-slate-500 px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-colors active:scale-95 whitespace-nowrap"
               >
                 Not now
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
