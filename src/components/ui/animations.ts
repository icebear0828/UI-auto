
import { Variants } from 'framer-motion';

export type AnimationType = 
  | 'FADE_IN' 
  | 'FADE_IN_UP' 
  | 'SLIDE_FROM_LEFT' 
  | 'SLIDE_FROM_RIGHT'
  | 'SCALE_IN' 
  | 'SCALE_ELASTIC' 
  | 'BLUR_IN' 
  | 'STAGGER_CONTAINER' 
  | 'PULSE' 
  | 'SHIMMER' 
  | 'SHAKE' 
  | 'GLOW' 
  | 'BOUNCE'
  | 'TYPEWRITER'
  | 'SCRAMBLE'
  | 'GRADIENT_FLOW'
  | 'WIGGLE'        
  | 'POP'           
  | 'HOVER_GROW'    
  | 'NONE';

export interface AnimationConfig {
  type: AnimationType;
  duration?: 'FAST' | 'NORMAL' | 'SLOW';
  delay?: number; // seconds
  trigger?: 'ON_MOUNT' | 'ON_HOVER' | 'ON_VIEW';
}

// Duration constants (seconds)
const DURATIONS = {
  FAST: 0.2,
  NORMAL: 0.5,
  SLOW: 0.8
};

// --------------------------------------------------------------------------
// VARIANT REGISTRY
// --------------------------------------------------------------------------

export const ANIMATION_VARIANTS: Record<AnimationType, Variants> = {
  NONE: {
    hidden: {},
    visible: {}
  },
  
  // --- Entry Animations ---
  
  FADE_IN: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  
  FADE_IN_UP: {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", damping: 25, stiffness: 300 } 
    }
  },

  SLIDE_FROM_LEFT: {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", damping: 25, stiffness: 300 } 
    }
  },

  SLIDE_FROM_RIGHT: {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", damping: 25, stiffness: 300 } 
    }
  },

  SCALE_IN: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  },

  SCALE_ELASTIC: {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", damping: 10, stiffness: 200 }
    }
  },

  BLUR_IN: {
    hidden: { opacity: 0, filter: "blur(12px)" },
    visible: { 
      opacity: 1, 
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: "easeOut" }
    }
  },

  STAGGER_CONTAINER: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05
      }
    }
  },

  // --- Attention / Loop Animations ---
  
  PULSE: {
    hidden: { opacity: 0.5, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        repeat: Infinity,
        repeatType: "reverse",
        duration: 0.8
      }
    }
  },

  SHIMMER: {
    hidden: { backgroundPosition: "200% 0" },
    visible: {
      backgroundPosition: "-200% 0",
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: "linear"
      }
    }
  },

  SHAKE: {
    hidden: { x: 0 },
    visible: {
      x: [0, -15, 15, -15, 15, 0],
      transition: { duration: 0.6, type: "spring", stiffness: 400, damping: 10 }
    }
  },

  BOUNCE: {
    hidden: { y: 0 },
    visible: {
      y: -15,
      transition: {
        repeat: Infinity,
        repeatType: "reverse",
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  },

  GLOW: {
    hidden: { opacity: 0.6 },
    visible: {
      opacity: 1,
      transition: {
        repeat: Infinity,
        repeatType: "reverse",
        duration: 1.2
      }
    }
  },

  WIGGLE: {
    hidden: { rotate: 0 },
    visible: {
      rotate: [0, -20, 20, -15, 15, -5, 5, 0],
      transition: { duration: 0.8, ease: "easeInOut" }
    }
  },

  POP: {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
      scale: [0.5, 1.3, 1],
      opacity: 1,
      transition: { duration: 0.5, type: "spring", bounce: 0.6 }
    }
  },

  HOVER_GROW: {
    hidden: { scale: 1 },
    visible: {
      scale: 1.05,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  },

  // --- Text Animations ---
  
  TYPEWRITER: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 } 
  },

  SCRAMBLE: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },

  GRADIENT_FLOW: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }
};

/**
 * Helper to construct the final transition object based on config
 */
export const getTransition = (config?: AnimationConfig) => {
  if (!config) return undefined;
  
  const baseDuration = DURATIONS[config.duration || 'NORMAL'];
  const baseDelay = config.delay || 0;

  return {
    duration: baseDuration,
    delay: baseDelay,
  };
};
