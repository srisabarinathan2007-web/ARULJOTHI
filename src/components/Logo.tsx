import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export default function Logo({ className }: { className?: string }) {
  const [hasError, setHasError] = React.useState(false);
  const [logoUrl, setLogoUrl] = React.useState(`/LOGO.png?t=${Date.now()}`);

  const fallbackLogo = "https://raw.githubusercontent.com/srisabarinathan2007/aruljothi/main/LOGO.png";
  
  return (
    <div className={cn("relative flex items-center justify-center p-2", className)}>
      {/* Rotating Ring Container */}
      <motion.div 
        className="absolute inset-0 z-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-60">
          <defs>
            <path
              id="logoTextPath"
              d="M 50, 50 m -47, 0 a 47,47 0 1,1 94,0 a 47,47 0 1,1 -94,0"
              fill="none"
            />
          </defs>
          <text className="text-[6.5px] font-black uppercase tracking-[0.25em] fill-blue-400/80 drop-shadow-[0_0_5px_rgba(59,130,246,0.3)]">
            <textPath href="#logoTextPath">
              ARUL JOTHI AUTO CONSULTING • RTO SERVICES • ARUL JOTHI AUTO CONSULTING • RTO SERVICES •
            </textPath>
          </text>
        </svg>
      </motion.div>

      {/* Dashed Inner Support Ring */}
      <div className="absolute inset-4 rounded-full border border-dashed border-white/10 z-0" />

      {/* Central Logo */}
      <div className="relative z-10 w-[85%] h-[85%] flex items-center justify-center rounded-full bg-slate-900/40 backdrop-blur-sm overflow-hidden border border-white/5 shadow-inner">
        {hasError ? (
          <div className="w-full h-full bg-blue-600 rounded-full flex flex-col items-center justify-center text-white border-2 border-amber-500/50">
             <span className="text-xl font-bold leading-none tracking-tighter">AJ</span>
             <div className="h-0.5 w-4 bg-amber-500 mt-0.5" />
          </div>
        ) : (
          <img 
            src={logoUrl} 
            alt="Logo" 
            className="w-full h-full object-cover rounded-full drop-shadow-xl"
            referrerPolicy="no-referrer"
            onError={() => {
              if (logoUrl.includes('LOGO.png')) {
                setLogoUrl(fallbackLogo);
              } else {
                setHasError(true);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
