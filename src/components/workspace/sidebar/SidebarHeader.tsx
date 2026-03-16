import React from 'react';
import { Settings, Sparkles } from 'lucide-react';

interface SidebarHeaderProps {
    isGenerating: boolean;
    onSettingsClick: () => void;
    onPlaySound: (sound: string) => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
    isGenerating,
    onSettingsClick,
    onPlaySound
}) => (
    <header className="h-16 flex items-center justify-between px-5 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10 ${isGenerating ? 'animate-spin' : ''}`}>
                <Sparkles className="w-4 h-4 text-white fill-current" />
            </div>
            <div>
                <h1 className="font-bold text-sm text-white tracking-tight leading-tight">GenUI <span className="text-slate-500 font-light">Architect</span></h1>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span>v3.5 Neo-Glass</span>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-2">
            <button onClick={() => { onSettingsClick(); onPlaySound('CLICK'); }} className="p-2 text-slate-400 hover:text-white transition-colors hover:bg-white/10 rounded-lg group relative" data-testid="settings-button">
                <Settings className="w-4 h-4" />
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-indigo-500 scale-0 group-hover:scale-100 transition-transform" />
            </button>
        </div>
    </header>
);
