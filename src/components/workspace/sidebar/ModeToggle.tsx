import React from 'react';
import { Activity, Gamepad2, Layout, PenTool, Shapes } from 'lucide-react';
import { UserContext } from '@/types';

interface ModeToggleProps {
    editMode: boolean;
    setEditMode: (value: boolean) => void;
    context: UserContext;
    setContext: React.Dispatch<React.SetStateAction<UserContext>>;
    metrics: { active: boolean };
    onPlaySound: (sound: string) => void;
    showToast: (options: any) => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({
    editMode,
    setEditMode,
    context,
    setContext,
    metrics,
    onPlaySound,
    showToast
}) => (
    <div className="flex items-center justify-between mt-4 px-1 gap-2">
        <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 tracking-wide">
            <div className="flex items-center gap-2">
                <Activity className={`w-3 h-3 ${metrics.active ? 'text-emerald-500 animate-pulse' : ''}`} />
                <span className={metrics.active ? 'text-emerald-500' : ''}>{metrics.active ? 'GENERATING...' : 'IDLE'}</span>
            </div>
        </div>

        <div className="flex items-center gap-2">
            <button
                onClick={() => {
                    const newMode = context.mode === 'galgame' ? 'default' : 'galgame';
                    setContext(p => ({ ...p, mode: newMode }));
                    onPlaySound('ACTIVATE');
                    if (newMode === 'galgame') {
                        showToast({ type: 'SUCCESS', title: 'Galgame Engine', description: 'Visual Novel Mode Activated' });
                    } else {
                        showToast({ type: 'INFO', title: 'Standard UI', description: 'Returned to Architect Mode' });
                    }
                }}
                className={`text-[10px] flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 font-bold tracking-wider uppercase backdrop-blur-md ${context.mode === 'galgame'
                        ? 'bg-pink-600/90 text-white border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                        : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300 hover:bg-white/10'
                    }`}
                data-testid="mode-toggle-vn"
            >
                <Gamepad2 className="w-3 h-3" />
                {context.mode === 'galgame' ? 'VN' : 'VN'}
            </button>

            <button
                onClick={() => {
                    const newMode = context.mode === 'svg_animation' ? 'default' : 'svg_animation';
                    setContext(p => ({ ...p, mode: newMode }));
                    onPlaySound('ACTIVATE');
                    if (newMode === 'svg_animation') {
                        showToast({ type: 'SUCCESS', title: 'SVG Engine', description: 'SVG Animation Mode Activated' });
                    } else {
                        showToast({ type: 'INFO', title: 'Standard UI', description: 'Returned to Architect Mode' });
                    }
                }}
                className={`text-[10px] flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 font-bold tracking-wider uppercase backdrop-blur-md ${context.mode === 'svg_animation'
                        ? 'bg-cyan-600/90 text-white border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                        : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300 hover:bg-white/10'
                    }`}
                data-testid="mode-toggle-svg"
            >
                <Shapes className="w-3 h-3" />
                SVG
            </button>

            <button
                onClick={() => { setEditMode(!editMode); onPlaySound('CLICK'); }}
                className={`text-[10px] flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 font-bold tracking-wider uppercase backdrop-blur-md ${editMode
                        ? 'bg-indigo-600/90 text-white border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                        : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300 hover:bg-white/10'
                    }`}
                data-testid="mode-toggle-edit"
            >
                {editMode ? <PenTool className="w-3 h-3" /> : <Layout className="w-3 h-3" />}
                {editMode ? 'Design' : 'View'}
            </button>
        </div>
    </div>
);
