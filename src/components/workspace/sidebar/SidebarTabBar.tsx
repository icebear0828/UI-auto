import React from 'react';
import { MessageSquare, Layers } from 'lucide-react';

interface SidebarTabBarProps {
    sidebarTab: 'chat' | 'layers';
    setSidebarTab: (tab: 'chat' | 'layers') => void;
    onPlaySound: (sound: string) => void;
}

export const SidebarTabBar: React.FC<SidebarTabBarProps> = ({
    sidebarTab,
    setSidebarTab,
    onPlaySound
}) => (
    <div className="px-5 pt-4 pb-2 flex gap-4 border-b border-white/5">
        <button
            onClick={() => { setSidebarTab('chat'); onPlaySound('HOVER'); }}
            className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors relative ${sidebarTab === 'chat' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
            <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                Generator
            </div>
            {sidebarTab === 'chat' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-500 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.5)]" />}
        </button>

        <button
            onClick={() => { setSidebarTab('layers'); onPlaySound('HOVER'); }}
            className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors relative ${sidebarTab === 'layers' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
            <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" />
                Structure
            </div>
            {sidebarTab === 'layers' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-500 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.5)]" />}
        </button>
    </div>
);
