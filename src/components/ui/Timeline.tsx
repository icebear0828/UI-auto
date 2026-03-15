
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeContext';
import { resolveIcon } from '@/utils/iconRegistry';

interface TimelineItem {
  title: string;
  description?: string;
  time?: string;
  status?: 'COMPLETED' | 'ACTIVE' | 'PENDING';
  icon?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  variant?: 'DEFAULT' | 'GLOW';
}

export const Timeline = ({ items = [], variant = 'DEFAULT' }: TimelineProps) => {
  const { theme } = useTheme();

  return (
    <div className={`${theme.timeline.container} ${variant === 'GLOW' ? 'border-indigo-500/30' : ''}`}>
      {items.map((item, i) => {
        const Icon = resolveIcon(item.icon);
        
        // Status Colors
        let dotColor = "bg-zinc-700";
        if (item.status === 'COMPLETED') dotColor = "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
        if (item.status === 'ACTIVE') dotColor = "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-pulse";
        if (item.status === 'PENDING') dotColor = "bg-amber-500";

        return (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            className={theme.timeline.item}
          >
            {/* Dot */}
            <div className={`${theme.timeline.dot} ${dotColor} ${variant === 'GLOW' ? 'shadow-lg' : ''}`} />
            
            {/* Time */}
            {item.time && <span className={theme.timeline.time}>{item.time}</span>}
            
            {/* Content */}
            <div className="flex items-start gap-2">
                {Icon && <Icon className="w-4 h-4 text-slate-400 mt-0.5" />}
                <div>
                    <h4 className={theme.timeline.title}>{item.title}</h4>
                    {item.description && <p className={theme.timeline.desc}>{item.description}</p>}
                </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
