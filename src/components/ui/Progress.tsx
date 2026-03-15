
import React, { memo } from 'react';
import { useTheme } from '@/components/ThemeContext';
import { AnimationType } from '@/types';

type ProgressColor = 'BLUE' | 'GREEN' | 'RED' | 'YELLOW' | 'PURPLE';

interface ProgressComponentProps {
  label?: string;
  value?: number;
  color?: ProgressColor;
  animation?: AnimationType;
}

export const Progress = memo<ProgressComponentProps>(function Progress({ label, value = 0, color = 'BLUE' }) {
  const { theme } = useTheme();
  const colorClass = theme.progress.colors[color as keyof typeof theme.progress.colors] || theme.progress.colors.BLUE;
  
  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]`} 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
});
