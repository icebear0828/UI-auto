/**
 * DeviceWrapper Component
 * 
 * Extracted from App.tsx - Renders the device frame (desktop/mobile) around UI content
 */

import React from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Shield } from 'lucide-react';
import DynamicRenderer from '@/components/DynamicRenderer';
import { UINode, UserContext, UIAction } from '@/types';

interface DeviceWrapperProps {
    context: UserContext;
    node: UINode;
    onAction: (action: UIAction) => void;
    isStreaming: boolean;
    onError?: (error: Error, node: UINode, path: string) => void;
    editMode: boolean;
    history: {
        canUndo: boolean;
        canRedo: boolean;
        undo: () => void;
        redo: () => void;
    };
}

export const DeviceWrapper: React.FC<DeviceWrapperProps> = ({
    context,
    node,
    onAction,
    isStreaming,
    onError,
    editMode,
    history
}) => {
    const { canUndo, canRedo, undo, redo } = history || {};

    return (
        <div
            data-streaming={isStreaming ? 'true' : 'false'}
            className={`transition-all duration-700 ease-[0.23,1,0.32,1] relative flex-shrink-0 perspective-1000
        ${context.device === 'mobile' ? 'w-[400px]' : 'w-[1100px]'}
        ${isStreaming ? 'opacity-95' : 'opacity-100'}
      `}
        >
            <div className={`
        /* GLASS EFFECT: Increased Transparency & Blur */
        bg-black/60 rounded-2xl overflow-hidden shadow-2xl relative transition-all duration-500
        ${context.device === 'mobile'
                    ? 'min-h-[850px] border-[8px] border-zinc-900 rounded-[3.5rem] ring-2 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)]'
                    : 'h-[800px] border border-white/10 ring-1 ring-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)]'
                }
        ${editMode ? 'scale-[0.96] ring-offset-8 ring-offset-black/50 ring-2 ring-indigo-500/50' : ''}
      `}>
                {/* Desktop Browser Bar */}
                {context.device !== 'mobile' && (
                    <div className="h-11 bg-zinc-900/80 border-b border-white/5 flex items-center px-5 gap-4 sticky top-0 z-50">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 shadow-inner" />
                            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 shadow-inner" />
                            <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 shadow-inner" />
                        </div>

                        {/* Navigation Controls */}
                        <div className="flex items-center gap-2 text-zinc-400">
                            <button
                                onClick={undo}
                                disabled={!canUndo}
                                className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                title="Go Back (History)"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={redo}
                                disabled={!canRedo}
                                className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                title="Go Forward"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => { }}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                                title="Refresh"
                            >
                                <RotateCw className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="flex-1 max-w-2xl mx-auto h-7 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center text-[11px] text-zinc-400 font-mono group hover:border-white/10 transition-colors cursor-text shadow-inner">
                            <Shield className="w-3 h-3 mr-2 opacity-50" />
                            <span className="group-hover:text-zinc-300">https://genui.architect/preview</span>
                        </div>
                    </div>
                )}

                {/* Mobile Dynamic Island Notch */}
                {context.device === 'mobile' && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-50 flex items-center justify-center pointer-events-none">
                        <div className="w-20 h-4 bg-zinc-900/50 rounded-full blur-[0.5px]" />
                    </div>
                )}

                {/* SCROLLABLE CONTENT AREA */}
                <div className={`
          /* Removed inner dark background to allow translucency */
          w-full
          overflow-y-auto custom-scrollbar
          ${context.device === 'mobile'
                        ? 'h-[850px] pt-12 pb-8 px-2'
                        : 'h-[calc(100%-44px)]'
                    }
        `}>
                    <DynamicRenderer node={node} onAction={onAction} onError={onError} path="root" />
                </div>

                {/* Loading Indicator */}
                {isStreaming && (
                    <div className="absolute bottom-6 right-6 z-50 flex items-center gap-3 bg-zinc-900/90 backdrop-blur px-4 py-2 rounded-full border border-white/10 shadow-xl pointer-events-none">
                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-bold text-white tracking-wide">STREAMING</span>
                    </div>
                )}
            </div>
        </div>
    );
};
