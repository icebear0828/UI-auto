
import React from 'react';
import { Map as MapIcon } from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';

export const MapWidget = ({ label, style = 'DARK', markers = [] }: any) => {
  const { theme } = useTheme();
  const mapTheme = theme.map.styles[style as keyof typeof theme.map.styles] || theme.map.styles.DARK;

  return (
    <div className="w-full h-72 rounded-xl overflow-hidden relative border border-zinc-700 group shadow-2xl">
      {/* Mock Map Background */}
      <div 
        className="absolute inset-0 w-full h-full transition-colors duration-500"
        style={{ backgroundColor: mapTheme.bg }}
      >
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            backgroundImage: `linear-gradient(${mapTheme.grid} 1px, transparent 1px), linear-gradient(90deg, ${mapTheme.grid} 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 bg-zinc-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-zinc-700 shadow-xl flex items-center gap-2">
        <MapIcon className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-bold text-slate-200">{label || 'Geographic View'}</span>
      </div>

      {/* Markers */}
      {markers && markers.map((m: any, i: number) => {
        const top = 20 + ((i * 37) % 60) + '%';
        const left = 20 + ((i * 53) % 60) + '%';
        
        return (
          <div 
            key={i} 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group/marker cursor-pointer"
            style={{ top, left }}
          >
            <div className="relative flex flex-col items-center">
               <div className="w-3 h-3 bg-indigo-500 rounded-full ring-4 ring-indigo-500/30 animate-pulse" />
               <div className="absolute -top-8 opacity-0 group-hover/marker:opacity-100 transition-all transform translate-y-2 group-hover/marker:translate-y-0 bg-zinc-900 text-[10px] px-2 py-1 rounded border border-zinc-700 whitespace-nowrap z-20 shadow-xl font-bold">
                  {m.title}
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
