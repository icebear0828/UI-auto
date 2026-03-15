/**
 * Animation Variant Cache
 * 
 * Caches computed motion variants to avoid per-render object creation
 */

import { ANIMATION_VARIANTS, getTransition, AnimationConfig } from '@/components/ui/animations';

type MotionVariants = typeof ANIMATION_VARIANTS[keyof typeof ANIMATION_VARIANTS];

const variantCache = new Map<string, MotionVariants>();

/**
 * Get cached animation variants
 * Avoids recreating variant objects on each render
 */
export function getCachedVariants(config: AnimationConfig | undefined): MotionVariants {
    // Build cache key from config properties
    const key = config
        ? `${config.type || 'FADE_IN_UP'}-${config.duration || 'NORMAL'}-${config.delay || 0}-${config.trigger || 'ON_MOUNT'}`
        : 'default';

    if (variantCache.has(key)) {
        return variantCache.get(key)!;
    }

    // Build variants
    const variantKey = config?.type && ANIMATION_VARIANTS[config.type] ? config.type : 'FADE_IN_UP';
    const baseVariants = ANIMATION_VARIANTS[variantKey] || ANIMATION_VARIANTS.FADE_IN_UP;

    const customTransition = getTransition(config);

    const finalVariants = customTransition ? {
        hidden: baseVariants.hidden,
        visible: {
            ...baseVariants.visible,
            transition: {
                ...(baseVariants.visible as any).transition,
                ...customTransition
            }
        }
    } : baseVariants;

    variantCache.set(key, finalVariants as MotionVariants);
    return finalVariants as MotionVariants;
}

/**
 * Clear animation cache (for testing or hot reload)
 */
export function clearAnimationCache(): void {
    variantCache.clear();
}
