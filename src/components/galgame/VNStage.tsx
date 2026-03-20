
import React, { useEffect, useState, useRef } from 'react';
import { UIAction, ImageAsset, VNCharacter, VNDialogue, VNChoice } from '@/types';
import { BackgroundLayer } from './layers/BackgroundLayer';
import { CharacterLayer } from './layers/CharacterLayer';
import { DialogLayer } from './layers/DialogLayer';
import { resolveImage } from '@/services/imageFactory';

interface VNStageProps {
  background?: ImageAsset; // Optional to handle partial stream
  characters?: VNCharacter[];
  dialogue?: VNDialogue;
  choices?: VNChoice[];
  bgm?: string;
  sfx?: string;
  onAction: (action: UIAction) => void;
  path?: string;
  animation?: { type?: string; duration?: string; delay?: number; trigger?: string };
}

export const VNStage: React.FC<VNStageProps> = ({ 
  background, 
  characters = [], 
  dialogue, 
  choices = [], 
  onAction 
}) => {
  const [bgSrc, setBgSrc] = useState<string>('');
  const isMounted = useRef(true);

  // cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // 1. Safe Image Resolution
  useEffect(() => {
    // Defensive: Check if background object is valid before processing
    if (!background || !background.value) return;

    let active = true;

    const fetchImage = async () => {
        try {
            const url = await resolveImage(background);
            if (active && isMounted.current) setBgSrc(url);
        } catch (e) {
            console.error("Failed to load background", e);
            // Fallback: construct Pollinations URL directly from value
            if (active && isMounted.current && background.value) {
                const fallback = background.value.startsWith('http')
                    ? background.value
                    : `https://image.pollinations.ai/prompt/${encodeURIComponent(background.value)}?nologo=true`;
                setBgSrc(fallback);
            }
        }
    };

    fetchImage();
    return () => { active = false; };
  }, [background?.source, background?.value, background?.style]);

  // 2. Handle Global Click (Continue)
  const handleStageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const hasChoices = choices && choices.length > 0;
    
    // Only trigger continue if no choices are blocking
    if (!hasChoices) {
        onAction({
            type: 'SUBMIT_FORM',
            payload: { intent: 'continue' } 
        });
    }
  };
  
  // 3. Loading/Skeleton State
  // If we don't have a valid background definition yet, show a loader
  if (!background || (!background.source && !background.value)) {
      return (
        <div className="w-full h-full min-h-[500px] bg-zinc-950 flex items-center justify-center border border-white/10 rounded-2xl">
            <div className="flex flex-col items-center gap-2 opacity-50">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono text-indigo-400">INITIALIZING_ENGINE...</span>
            </div>
        </div>
      );
  }
  
  return (
    <div 
        className="relative w-full h-full min-h-[500px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black select-none cursor-pointer group"
        onClick={handleStageClick}
    >
      {/* Layer 0: Background */}
      <BackgroundLayer src={bgSrc} />

      {/* Layer 1: Characters */}
      {/* Pass defensive copy or handle inside component */}
      <CharacterLayer characters={characters || []} />

      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20" />
      <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)]" />

      {/* Layer 2: UI & Dialogue */}
      {dialogue && (
        <DialogLayer 
            dialogue={dialogue} 
            choices={choices} 
            onAction={onAction} 
        />
      )}

      {/* Loading Indicator while background resolves */}
      {!bgSrc && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                 <div className="w-16 h-16 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                 <span className="text-cyan-400 font-mono text-xs tracking-widest animate-pulse">LOADING_SCENE...</span>
              </div>
          </div>
      )}
    </div>
  );
};

export default VNStage;
