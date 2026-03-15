
import React, { useRef, useState, useCallback, memo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { RenderChildren } from './renderUtils';
import { useTheme } from '@/components/ThemeContext';
import { UIAction, TypedUINode, AnimationType } from '@/types';

type CardVariant = 'DEFAULT' | 'HIGHLIGHT' | 'GRADIENT' | 'GLASS';

interface CardComponentProps {
  children?: TypedUINode[];
  title?: string;
  variant?: CardVariant;
  onAction?: (action: UIAction) => void;
  path?: string;
  animation?: AnimationType;
}

export const Card = memo<CardComponentProps>(function Card({
  children,
  title,
  variant = 'DEFAULT',
  onAction,
  path
}) {
  const { theme } = useTheme();

  // --- 3D Tilt Logic ---
  const ref = useRef<HTMLDivElement>(null);
  const lastMoveTime = useRef(0);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const now = performance.now();
    if (now - lastMoveTime.current < 33) return; // ~30fps throttle
    lastMoveTime.current = now;

    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);

    // Spotlight calc
    setPosition({ x: mouseX, y: mouseY });
  }, [x, y]);

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setOpacity(0);
  };
  
  const handleMouseEnter = () => setOpacity(1);

  // --- Legacy Spotlight State ---
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const variantClass = theme.card.variants[variant as keyof typeof theme.card.variants] || theme.card.variants.DEFAULT;

  return (
    <motion.div 
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${theme.card.base} ${variantClass} relative`}
      style={{
        rotateX: rotateX,
        rotateY: rotateY,
        transformStyle: "preserve-3d",
      }}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Texture Noise Layer */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay rounded-2xl"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")" }}
      />

      {/* Spotlight Effect Layer */}
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-10 rounded-2xl"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`
        }}
      />
      
      {/* Border Spotlight */}
      <div 
        className="pointer-events-none absolute inset-0 transition duration-300 z-10 rounded-2xl"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.1), transparent 40%)`,
          maskImage: 'linear-gradient(black, black), content-box',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1px' // Border width
        }}
      />

      <div className="relative z-20 flex flex-col h-full" style={{ transform: "translateZ(20px)" }}>
        {title && (
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h3 className="font-semibold text-slate-200 tracking-tight">{title}</h3>
            </div>
        )}
        <div className="p-6 flex-1 flex flex-col gap-4">
            <RenderChildren children={children} onAction={onAction} parentPath={path} />
        </div>
      </div>
    </motion.div>
  );
});
