
import { useCallback, useRef, useEffect } from 'react';
import { useGenUI } from './useGenUI'; // To access config if needed, or we pass enabled prop

// Sound signatures
type SoundType = 'CLICK' | 'HOVER' | 'SUCCESS' | 'ERROR' | 'TYPE' | 'ACTIVATE';

export const useSound = (enabled: boolean = true) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    // Initialize Audio Context on first user interaction usually, 
    // but here we init lazily on first play to avoid browser warnings.
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
      }
    }
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const play = useCallback((type: SoundType) => {
    if (!enabled) return;
    initAudio();
    
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'CLICK':
        // Mechanical thud + high chirp
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        osc.start(t);
        osc.stop(t + 0.08);
        break;

      case 'HOVER':
        // Very subtle high tick
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.linearRampToValueAtTime(600, t + 0.03);
        gain.gain.setValueAtTime(0.02, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.03);
        osc.start(t);
        osc.stop(t + 0.03);
        break;

      case 'TYPE':
        // Soft keypress
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, t);
        gain.gain.setValueAtTime(0.03, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;

      case 'SUCCESS':
        // Ascending sci-fi chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.1);
        osc.frequency.exponentialRampToValueAtTime(1760, t + 0.3);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        
        osc.start(t);
        osc.stop(t + 0.6);
        
        // Add a second harmonic
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(220, t);
        osc2.frequency.exponentialRampToValueAtTime(880, t + 0.4);
        gain2.gain.setValueAtTime(0, t);
        gain2.gain.linearRampToValueAtTime(0.05, t + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc2.start(t);
        osc2.stop(t + 0.5);
        break;
        
      case 'ACTIVATE':
        // Power up sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, t);
        osc.frequency.exponentialRampToValueAtTime(440, t + 0.2);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        break;

      case 'ERROR':
        // Descending buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(50, t + 0.3);
        
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.3);
        
        osc.start(t);
        osc.stop(t + 0.3);
        break;
    }
  }, [enabled]);

  return { play };
};
