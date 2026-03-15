
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VNDialogue, UIAction } from '@/types';
import { ChevronRight, Terminal } from 'lucide-react';

interface DialogLayerProps {
  dialogue: VNDialogue;
  choices?: { label: string, action: UIAction, style?: string }[];
  onAction: (action: UIAction) => void;
}

const TypewriterText = ({ text, speed = 30 }: { text: string, speed?: number }) => {
  const [displayed, setDisplayed] = useState('');
  
  useEffect(() => {
    if (!text) return;
    setDisplayed('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className="font-mono text-cyan-50">
        {displayed}
        <span className="inline-block w-2.5 h-5 bg-cyan-500 ml-1 align-middle animate-pulse shadow-[0_0_10px_#22d3ee]" />
    </span>
  );
};

export const DialogLayer: React.FC<DialogLayerProps> = ({ dialogue, choices, onAction }) => {
  const hasChoices = choices && choices.length > 0;
  // Guard against undefined dialogue content
  const content = dialogue?.content || '';
  const speaker = dialogue?.speaker || '';

  const handleChoiceClick = (e: React.MouseEvent, action: UIAction) => {
    e.stopPropagation();
    onAction(action);
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end pointer-events-none pb-4 md:pb-8">
        
        {/* Choices Overlay - Centered */}
        <AnimatePresence>
        {hasChoices && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 backdrop-blur-sm z-30 pointer-events-auto"
            >
                {choices.map((choice, idx) => (
                    <motion.button
                        key={idx}
                        onClick={(e) => handleChoiceClick(e, choice.action)}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.3 }}
                        whileHover={{ scale: 1.02, x: 10 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                            relative overflow-hidden group
                            px-8 py-4 min-w-[340px] max-w-[90%] text-sm font-bold font-mono tracking-widest uppercase
                            border-l-4 backdrop-blur-md transition-all duration-300
                            ${choice.style === 'AGGRESSIVE' 
                                ? 'bg-red-950/80 border-red-500 text-red-100 hover:bg-red-900/90 shadow-[0_0_20px_rgba(220,38,38,0.2)]' 
                                : choice.style === 'ROMANTIC' 
                                ? 'bg-fuchsia-950/80 border-fuchsia-500 text-fuchsia-100 hover:bg-fuchsia-900/90 shadow-[0_0_20px_rgba(217,70,239,0.2)]'
                                : 'bg-slate-900/90 border-cyan-500 text-cyan-100 hover:bg-cyan-950/50 shadow-[0_0_20px_rgba(34,211,238,0.1)]'
                            }
                        `}
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <span>{choice.label}</span>
                            <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                                choice.style === 'AGGRESSIVE' ? 'text-red-400' : choice.style === 'ROMANTIC' ? 'text-fuchsia-400' : 'text-cyan-400'
                            }`} />
                        </div>
                        
                        {/* Scanline Effect on Button */}
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)] bg-[length:200%_200%] opacity-0 group-hover:opacity-100 animate-shine pointer-events-none" />
                    </motion.button>
                ))}
            </motion.div>
        )}
        </AnimatePresence>

        {/* Text Box Container */}
        <div className="w-full max-w-6xl mx-auto px-4 pointer-events-auto relative z-20">
            {/* Speaker Name Tag */}
            <AnimatePresence>
            {speaker && (
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-end mb-0 relative z-10 pl-1"
                >
                    <div className="
                        bg-black/90 border-t border-x border-cyan-500/50 
                        text-cyan-400 font-mono text-xs font-bold tracking-[0.2em] uppercase
                        px-6 py-1.5 transform skew-x-12 origin-bottom-left ml-4
                        shadow-[0_-5px_20px_rgba(34,211,238,0.15)]
                    ">
                        <span className="block transform -skew-x-12">{speaker}</span>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
            
            {/* Main Text Area */}
            <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`
                    relative overflow-hidden
                    bg-black/85 backdrop-blur-xl
                    border-y-2 border-cyan-500/30
                    shadow-[0_0_50px_rgba(0,0,0,0.8)]
                    min-h-[160px] md:min-h-[200px]
                    flex flex-col group
                    ${hasChoices ? 'opacity-30 blur-[2px] transition-all duration-500 grayscale' : 'opacity-100 blur-0'}
                `}
            >
                {/* Tech Deco: Corner Markers */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

                {/* Tech Deco: Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none" />

                {/* Text Content */}
                <div className="relative z-10 p-6 md:p-10 flex-1">
                   <div className="text-lg md:text-xl leading-relaxed drop-shadow-md">
                       <TypewriterText text={content} speed={dialogue.speed === 'FAST' ? 10 : dialogue.speed === 'SLOW' ? 60 : 25} />
                   </div>
                </div>
                
                {/* Footer/Status Bar */}
                <div className="relative z-10 h-6 bg-cyan-950/30 border-t border-cyan-500/20 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2 text-[10px] text-cyan-700 font-mono">
                        <Terminal className="w-3 h-3" />
                        <span>LOG_ACTIVE</span>
                    </div>
                    
                    {!hasChoices && (
                         <div className="flex items-center gap-2 animate-pulse">
                            <span className="text-[10px] font-bold tracking-widest text-cyan-400">WAITING_INPUT</span>
                            <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                         </div>
                    )}
                </div>

            </motion.div>
        </div>
    </div>
  );
};
