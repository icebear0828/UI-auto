import React, { useState, useEffect, memo } from 'react';
import { useTheme } from '@/components/ThemeContext';
import { motion, Variants } from 'framer-motion';
import { AnimationConfig } from './animations';

/* -------------------------------------------------------------------------- */
/*                               EFFECT LOGIC                                 */
/* -------------------------------------------------------------------------- */

// --- 1. Typewriter Effect ---
const Typewriter = ({ content }: { content: string }) => {
  const letters = Array.from(content || "");
  
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i: number = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.04 * i },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", damping: 12, stiffness: 200 },
    },
    hidden: {
      opacity: 0,
      x: -5,
      transition: { type: "spring", damping: 12, stiffness: 200 },
    },
  };

  return (
    <motion.span variants={container} initial="hidden" animate="visible" className="inline-block">
      {letters.map((letter, index) => (
        <motion.span variants={child} key={index} className="inline-block whitespace-pre">
          {letter}
        </motion.span>
      ))}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="inline-block w-2 h-[1em] bg-indigo-500 ml-1 align-middle"
      />
    </motion.span>
  );
};

// --- 2. Scramble Effect ---
const ScrambleText = ({ content }: { content: string }) => {
  // Ensure content is string
  const validContent = content || "";
  const [display, setDisplay] = useState(validContent);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
  
  useEffect(() => {
    let iteration = 0;
    let rafId: number;
    let lastTime = 0;
    const letters = validContent.split("");

    const step = (time: number) => {
      if (time - lastTime < 33) { // ~30fps
        rafId = requestAnimationFrame(step);
        return;
      }
      lastTime = time;

      setDisplay(
        letters
          .map((letter, index) => {
            if (index < iteration) {
              return letter;
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= validContent.length) {
        return; // stop
      }

      iteration += 1/3; // Speed control
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(rafId);
  }, [validContent]);

  return <span className="font-mono text-emerald-400">{display}</span>;
};

// --- 3. Gradient Flow Effect ---
const GradientFlow = ({ content, fontClass }: { content: string, fontClass: string }) => {
  return (
    <span 
      className={`${fontClass} text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x bg-[length:200%_auto]`}
    >
      {content}
    </span>
  );
};

// --- Main Component ---

interface TypographyProps {
  content: string;
  variant?: string;
  color?: string;
  font?: string;
  animation?: AnimationConfig;
}

export const Typography = memo(function Typography({ content, variant = 'BODY', color = 'DEFAULT', font = 'SANS', animation }: TypographyProps) {
  const { theme } = useTheme();

  const styles = theme.typography.variants;
  const colors = theme.typography.colors;
  const fonts = theme.typography.fonts;

  const fontClass = fonts[font as keyof typeof fonts] || fonts.SANS;
  const isClass = !fontClass.includes('"');
  const styleObj = !isClass ? { fontFamily: fontClass.replace('font-', '') } : {};
  
  const baseClasses = `${styles[variant as keyof typeof styles] || styles.BODY} ${colors[color as keyof typeof colors] || colors.DEFAULT} ${isClass ? fontClass : ''}`;

  // Ensure safe string
  const safeContent = String(content ?? "");

  // If specific text animation is requested, delegate to effect components
  if (animation?.type === 'TYPEWRITER') {
    return (
      <div className={baseClasses} style={styleObj}>
        <Typewriter content={safeContent} />
      </div>
    );
  }

  if (animation?.type === 'SCRAMBLE') {
    return (
      <div className={baseClasses} style={styleObj}>
        <ScrambleText content={safeContent} />
      </div>
    );
  }

  if (animation?.type === 'GRADIENT_FLOW') {
    return (
      <div className={baseClasses} style={styleObj}>
        <GradientFlow content={safeContent} fontClass="" />
      </div>
    );
  }

  // Default Render
  return (
    <div
      className={baseClasses}
      style={styleObj}
    >
      {safeContent}
    </div>
  );
});