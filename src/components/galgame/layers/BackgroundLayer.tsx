
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BackgroundLayerProps {
  src: string;
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ src }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <AnimatePresence mode="popLayout">
        {src && (
          <motion.img
            key={src} // Key change triggers transition
            src={src}
            alt="Scene Background"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="w-full h-full object-cover"
          />
        )}
      </AnimatePresence>
      
      {/* Cinematic Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
    </div>
  );
};
