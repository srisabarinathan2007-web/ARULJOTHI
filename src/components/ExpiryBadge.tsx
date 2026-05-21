import React from 'react';
import { format, isBefore, differenceInDays, parseISO } from 'date-fns';
import { cn } from '../lib/utils';

interface ExpiryBadgeProps {
  date?: string;
  reminderDays: number;
  hideLabel?: boolean;
}

export default function ExpiryBadge({ date, reminderDays, hideLabel }: ExpiryBadgeProps) {
  if (!date) return (
    <div className="px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center min-w-[140px] opacity-40">
       <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">-- --- ----</span>
       <span className="text-[8px] font-bold text-slate-200 uppercase tracking-widest leading-none">(N/A)</span>
    </div>
  );

  const expiryDate = parseISO(date);
  const today = new Date();
  const isExpired = isBefore(expiryDate, today);
  const diff = differenceInDays(expiryDate, today);
  const isExpiringSoon = !isExpired && diff <= reminderDays;

  return (
    <div className={cn(
      "px-3 py-2 rounded-xl border transition-all flex flex-col items-center justify-center min-w-[110px] shadow-sm",
      isExpired 
        ? "bg-[#fff1f2] border-[#ffe4e6] text-[#e11d48]" :
      isExpiringSoon 
        ? "bg-[#fffbeb] border-[#fef3c7] text-[#d97706]" :
      "bg-[#f0f9ff] border-[#e0f2fe] text-[#0284c7]"
    )}>
      <div className="flex items-center gap-1.5 mb-1">
        <div className={cn(
          "w-1.5 h-1.5 rounded-full",
          isExpired ? "bg-[#e11d48]" :
          isExpiringSoon ? "bg-[#d97706]" :
          "bg-[#0284c7]"
        )} />
        <span className="text-[10px] font-black uppercase tracking-[0.1em] leading-none">
          {format(expiryDate, 'dd MMM yyyy').toUpperCase()}
        </span>
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest opacity-60 leading-none">
        ({isExpired ? 'EXPIRED' : `${diff}D LEFT`})
      </span>
    </div>
  );
}
