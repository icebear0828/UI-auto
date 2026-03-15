
import React, { memo } from 'react';
import { RenderChildren } from './renderUtils';
import { useTheme } from '@/components/ThemeContext';
import { UIAction, TypedUINode, AnimationType } from '@/types';

type HeroGradient = 'BLUE_PURPLE' | 'ROSE_ORANGE' | 'GREEN_TEAL' | 'DARK';
type HeroAlign = 'CENTER' | 'LEFT';

interface HeroComponentProps {
  title?: string;
  subtitle?: string;
  gradient?: HeroGradient;
  align?: HeroAlign;
  children?: TypedUINode[];
  onAction?: (action: UIAction) => void;
  path?: string;
  animation?: AnimationType;
}

export const Hero = memo<HeroComponentProps>(function Hero({ title, subtitle, gradient = 'BLUE_PURPLE', align = 'CENTER', children, onAction, path }) {
  const { theme } = useTheme();
  const gradientClass = theme.hero.gradients[gradient as keyof typeof theme.hero.gradients] || theme.hero.gradients.BLUE_PURPLE;
  const alignClass = align === 'LEFT' ? 'text-left items-start' : 'text-center items-center';

  return (
    <div className={`${theme.hero.base} ${alignClass} gap-8`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-40 blur-3xl`} />
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")" }}
      />
      
      <div className="relative z-10 flex flex-col gap-6 max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-sm">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl font-light">
          {subtitle}
        </p>
      </div>

      <div className="relative z-10 mt-6 flex gap-4">
        <RenderChildren children={children} onAction={onAction} parentPath={path} />
      </div>
    </div>
  );
});
