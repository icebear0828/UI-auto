import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ThemeContext';
import { UIAction, AnimationType } from '@/types';
import { resolveIcon } from '@/utils/iconRegistry';

type ButtonVariant = 'PRIMARY' | 'SECONDARY' | 'OUTLINE' | 'GHOST' | 'GLOW' | 'GRADIENT' | 'DANGER';

interface ButtonComponentProps {
  label?: string;
  variant?: ButtonVariant;
  icon?: string;
  action?: UIAction;
  onAction?: (action: UIAction) => void;
  path?: string;
  disabled?: boolean;
  ariaLabel?: string;
  animation?: AnimationType;
}

export const Button = memo<ButtonComponentProps>(function Button({
  label,
  variant = 'PRIMARY',
  icon,
  action,
  onAction,
  path,
  disabled,
  ariaLabel,
  ...props
}) {
  const { theme } = useTheme();
  const IconCmp = resolveIcon(icon);

  const variantClass = theme.button.variants[variant as keyof typeof theme.button.variants] || theme.button.variants.PRIMARY;

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;

    if (onAction && action) {
        const enhancedAction = {
            ...action,
            path: path || action.path
        };
        onAction(enhancedAction);
    }
  };

  // Accessibility: Use provided ariaLabel, or label, or icon name as fallback
  const accessibleLabel = ariaLabel || label || (icon ? icon.replace(/([A-Z])/g, ' $1').trim() : 'Button');

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      aria-label={accessibleLabel}
      aria-disabled={disabled}
      className={`${theme.button.base} ${variantClass} relative overflow-hidden group z-0`}
      whileHover={!disabled ? { scale: 1.05, y: -2, filter: "brightness(1.1)" } : {}}
      whileTap={!disabled ? { scale: 0.95, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      {...props}
    >
      {/* Dynamic Shimmer Effect for Primary/Glow/Gradient Buttons */}
      {(variant === 'PRIMARY' || variant === 'GLOW' || variant === 'GRADIENT') && (
        <div className="absolute top-0 -inset-full h-full w-1/2 z-1 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine pointer-events-none" />
      )}
      
      {/* Glow Backdrop for specific variants */}
      {variant === 'GLOW' && (
        <div className="absolute inset-0 bg-indigo-500/20 blur-md group-hover:blur-lg transition-all opacity-0 group-hover:opacity-100 z-[-1]" />
      )}

      <div className="flex items-center gap-2 relative z-10">
        <AnimatePresence mode="wait">
           {IconCmp && (
             <motion.div
                key={icon}
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500 }}
             >
               <IconCmp className="w-4 h-4" />
             </motion.div>
           )}
        </AnimatePresence>
        
        <span className="font-semibold tracking-wide">{label}</span>
      </div>
    </motion.button>
  );
});