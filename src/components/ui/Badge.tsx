
import React, { memo } from 'react';
import { useTheme } from '@/components/ThemeContext';
import { AnimationType } from '@/types';

type BadgeColor = 'BLUE' | 'GREEN' | 'RED' | 'YELLOW' | 'PURPLE' | 'GRAY';

interface BadgeComponentProps {
  label?: string;
  color?: BadgeColor;
  animation?: AnimationType;
}

export const Badge = memo<BadgeComponentProps>(function Badge({ label, color = 'BLUE' }) {
  const { theme } = useTheme();
  const colorClass = theme.badge.colors[color as keyof typeof theme.badge.colors] || theme.badge.colors.BLUE;
  
  return (
    <span className={`${theme.badge.base} ${colorClass}`}>
      {label}
    </span>
  );
});
