
import React, { memo } from 'react';
import { Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';
import { AnimationType } from '@/types';

type AlertVariant = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

interface AlertComponentProps {
  title?: string;
  description?: string;
  variant?: AlertVariant;
  animation?: AnimationType;
}

export const Alert = memo<AlertComponentProps>(function Alert({
  title,
  description,
  variant = 'INFO'
}) {
  const { theme } = useTheme();
  const styles = theme.alert.variants[variant as keyof typeof theme.alert.variants] || theme.alert.variants.INFO;

  const icons: Record<AlertVariant, LucideIcon> = {
    INFO: Info,
    SUCCESS: CheckCircle2,
    WARNING: AlertTriangle,
    ERROR: XCircle,
  };

  const Icon = icons[variant] || icons.INFO;

  return (
    <div className={`${theme.alert.base} ${styles}`} role="alert">
      <div className="mt-0.5 p-1 bg-white/5 rounded-full">
         <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      </div>
      <div>
        <h5 className="font-semibold text-sm mb-1">{title}</h5>
        <p className="text-xs opacity-80 leading-relaxed">{description}</p>
      </div>
    </div>
  );
});
