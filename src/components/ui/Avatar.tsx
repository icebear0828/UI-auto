
import React from 'react';
import { useTheme } from '@/components/ThemeContext';

export const Avatar = ({ initials, src, status }: any) => {
  const { theme } = useTheme();
  const statusColor = status ? (theme.avatar.status[status as keyof typeof theme.avatar.status] || theme.avatar.status.OFFLINE) : '';

  return (
    <div className="relative inline-block group">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center border border-zinc-700 ring-2 ring-transparent group-hover:ring-white/10 transition-all">
        {src ? (
          <img src={src} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="font-bold text-xs text-slate-400 group-hover:text-white">{initials}</span>
        )}
      </div>
      {status && (
        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 ${statusColor}`} />
      )}
    </div>
  );
};
