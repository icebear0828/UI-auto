import React, { useState, memo } from 'react';
import { useTheme } from '@/components/ThemeContext';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimationType } from '@/types';

type ImageAspectRatio = 'SQUARE' | 'VIDEO' | 'PORTRAIT' | 'WIDE';

interface ImageComponentProps {
  src?: string;
  alt?: string;
  caption?: string;
  aspectRatio?: ImageAspectRatio;
  animation?: AnimationType;
}

export const ImageComponent = memo<ImageComponentProps>(function ImageComponent({ src, alt, caption, aspectRatio = 'VIDEO' }) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const ratioClass = theme.image.ratios[aspectRatio as keyof typeof theme.image.ratios] || theme.image.ratios.VIDEO;

  return (
    <figure className="w-full flex flex-col gap-3 group relative z-0">
      <motion.div 
        className={`w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 ${ratioClass} relative`}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.4 }}
      >
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 animate-pulse z-10">
            <Loader2 className="w-8 h-8 text-zinc-600 animate-spin" />
          </div>
        )}

        {/* Error Fallback */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-20 text-zinc-600">
            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
            <span className="text-xs font-mono uppercase">Image Failed</span>
          </div>
        )}

        <motion.img 
          src={src || 'https://via.placeholder.com/800x400/18181b/52525b?text=Visual'} 
          alt={alt || 'Generated Content'} 
          className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${isLoading ? 'opacity-0' : 'opacity-100 group-hover:scale-105 group-hover:brightness-110'}`} 
          onLoad={() => setIsLoading(false)}
          onError={() => { setIsLoading(false); setHasError(true); }}
        />
        
        {/* Inner Border / Gloss */}
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none z-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
      </motion.div>
      
      {caption && (
        <figcaption className="text-xs text-center text-slate-500 font-medium tracking-wide animate-in fade-in slide-in-from-top-1">
          {caption}
        </figcaption>
      )}
    </figure>
  );
});