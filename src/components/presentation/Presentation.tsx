import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import type { UIAction } from '@/types';
import type { PresentationProps, Slide } from '@/services/schemas/presentation';
import { injectSymbols } from '@/services/svg/symbols';
import { sanitizeSvg } from '@/services/svg/sanitize';
import { useIsStreaming } from '@/components/ui/renderUtils';

interface PresentationComponentProps extends PresentationProps {
  onAction: (action: UIAction) => void;
  path?: string;
}

export const Presentation: React.FC<PresentationComponentProps> = ({ title, slides = [], onAction }) => {
  const isStreaming = useIsStreaming();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const safeIndex = Math.min(currentIndex, Math.max(0, slides.length - 1));
  const currentSlide: Slide | undefined = slides[safeIndex];
  const total = slides.length;

  const sanitizedSvg = useMemo(() => {
    if (!currentSlide?.svg_code) return '';
    if (!currentSlide.svg_code.includes('</svg>')) return '';
    return sanitizeSvg(injectSymbols(currentSlide.svg_code));
  }, [currentSlide?.svg_code]);

  const goNext = useCallback(() => {
    if (safeIndex < total - 1) {
      setCurrentIndex(safeIndex + 1);
    } else if (!isStreaming) {
      onAction({ type: 'SUBMIT_FORM', payload: { intent: 'continue' } });
    }
  }, [safeIndex, total, isStreaming, onAction]);

  const goPrev = useCallback(() => {
    if (safeIndex > 0) setCurrentIndex(safeIndex - 1);
  }, [safeIndex]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFullscreen(); }
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, toggleFullscreen, isFullscreen]);

  // Sync index when new slides stream in
  useEffect(() => {
    if (isStreaming && slides.length > 0) {
      setCurrentIndex(slides.length - 1);
    }
  }, [slides.length, isStreaming]);

  if (total === 0) {
    return (
      <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl select-none">
        <svg viewBox="0 0 1280 720" className="block w-full">
          <rect width="1280" height="720" fill="#0f172a" />
          <text x="640" y="350" textAnchor="middle" fill="#475569" fontSize="16" fontFamily="monospace">
            {isStreaming ? 'Generating slides…' : 'No slides'}
          </text>
          {isStreaming && (
            <circle cx="640" cy="390" r="4" fill="#6366f1" opacity="0.6">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
            </circle>
          )}
        </svg>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`w-full rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl select-none flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
      {/* Slide */}
      <div className="flex-1 relative">
        {sanitizedSvg ? (
          <div
            className="w-full"
            style={{ aspectRatio: '16 / 9' }}
            dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
          />
        ) : (
          <svg viewBox="0 0 1280 720" className="block w-full">
            <rect width="1280" height="720" fill="#0f172a" />
            <text x="640" y="360" textAnchor="middle" fill="#475569" fontSize="14" fontFamily="monospace">
              Loading slide…
            </text>
          </svg>
        )}
      </div>

      {/* Navigation bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/60 backdrop-blur-md border-t border-white/5">
        {/* Left: title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {title && <span className="text-xs text-slate-500 truncate">{title}</span>}
          {currentSlide?.title && (
            <span className="text-xs text-slate-400 truncate">— {currentSlide.title}</span>
          )}
        </div>

        {/* Center: nav */}
        <div className="flex items-center gap-3">
          <button
            onClick={goPrev}
            disabled={safeIndex === 0}
            className={`p-1.5 rounded-md transition-all ${safeIndex === 0 ? 'text-zinc-700 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs text-slate-500 font-mono tabular-nums min-w-[3rem] text-center">
            {safeIndex + 1} / {total}
          </span>

          <button
            onClick={goNext}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: fullscreen */}
        <div className="flex-1 flex justify-end">
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition-all"
            title="Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="flex gap-1 px-4 py-2 bg-black/40 overflow-x-auto">
          {slides.map((_s, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`flex-shrink-0 w-12 h-7 rounded border transition-all ${i === safeIndex ? 'border-indigo-500 bg-indigo-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
            >
              <span className="text-[8px] text-slate-500">{i + 1}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Presentation;
