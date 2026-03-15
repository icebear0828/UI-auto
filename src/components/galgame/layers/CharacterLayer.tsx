
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VNCharacter } from '@/types';
import { resolveImage } from '@/services/imageFactory';

interface CharacterLayerProps {
  characters: VNCharacter[];
}

const CharacterSprite: React.FC<{ char: VNCharacter }> = ({ char }) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const isMounted = useRef(true);

  // Defensive: Ensure avatar object exists
  const avatar = char?.avatar;
  const source = avatar?.source;
  const value = avatar?.value;
  const style = avatar?.style;

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (!avatar || !source || !value) return;

    let active = true;
    resolveImage(avatar).then(url => {
      if (active && isMounted.current) setImgSrc(url);
    });
    return () => { active = false; };
  }, [source, value, style]);

  const getPositionStyle = (pos: string) => {
    switch(pos) {
      case 'LEFT': return { left: '20%', transform: 'translateX(-50%)', zIndex: 10 };
      case 'RIGHT': return { left: '80%', transform: 'translateX(-50%)', zIndex: 10 };
      case 'CENTER': return { left: '50%', transform: 'translateX(-50%)', zIndex: 20 };
      case 'CLOSE_UP': return { left: '50%', transform: 'translateX(-50%) scale(1.4)', bottom: '-15%', zIndex: 30 };
      default: return { left: '50%', transform: 'translateX(-50%)', zIndex: 10 };
    }
  };

  const getAnimation = (type?: string) => {
      switch(type) {
          case 'BOUNCE': return { y: [0, -20, 0], transition: { duration: 0.4 } };
          case 'SHAKE': return { x: [-5, 5, -5, 5, 0], transition: { duration: 0.3 } };
          case 'SLIDE_IN_LEFT': return { x: [-100, 0], opacity: [0, 1] };
          case 'FADE_IN': default: return { opacity: [0, 1] };
      }
  };

  // If we have data but no image yet (loading), or missing data, render nothing or placeholder
  if (!imgSrc) return null;

  return (
    <motion.div
      className="absolute bottom-0 w-[500px] h-[800px] md:w-[600px] md:h-[900px] pointer-events-none origin-bottom"
      style={getPositionStyle(char.position)}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: char.position === 'CLOSE_UP' ? 1.4 : 1, ...getAnimation(char.animation?.type) }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 120, delay: char.animation?.delay || 0 }}
    >
        <img 
            src={imgSrc} 
            alt={char.name} 
            className="w-full h-full object-contain drop-shadow-[0_0_35px_rgba(0,0,0,0.8)] filter brightness-110 contrast-110"
        />
    </motion.div>
  );
};

export const CharacterLayer: React.FC<CharacterLayerProps> = ({ characters }) => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex items-end justify-center overflow-hidden">
        <AnimatePresence>
            {characters && characters.map(char => (
                <CharacterSprite key={char.id} char={char} />
            ))}
        </AnimatePresence>
    </div>
  );
};
