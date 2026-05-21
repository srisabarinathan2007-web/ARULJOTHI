import React from 'react';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

interface TopHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function TopHeader({ isOpen, onToggle }: TopHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-28 bg-white/90 backdrop-blur-md border-b border-modern-border z-[70] flex items-center justify-center px-6 lg:px-12 no-print shadow-sm">
      {/* Brand Center */}
      <div className="flex flex-col items-center">
        <Logo className="w-12 h-12 object-contain mb-2" />
        <div className="text-center">
          <h1 className="text-xl font-display font-black text-[#1e40af] tracking-widest uppercase">Arul Jothi</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#3b82f6]/60 -mt-1 scale-x-110">Auto Consulting</p>
        </div>
      </div>

      {/* Menu Toggle Right */}
      <button 
        onClick={onToggle}
        className="absolute right-6 lg:right-12 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 group"
      >
        {isOpen ? (
          <X className="w-8 h-8 text-modern-text group-hover:text-[#3b82f6] transition-colors" />
        ) : (
          <Menu className="w-8 h-8 text-modern-text group-hover:text-[#3b82f6] transition-colors" />
        )}
      </button>
    </header>
  );
}
