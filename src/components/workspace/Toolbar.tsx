/**
 * Toolbar Component
 * 
 * Extracted from App.tsx - Top toolbar with device toggles, history controls, and actions
 */

import React from 'react';
import {
    Monitor, Smartphone, Shield, User, Undo2, Redo2, Split, Code2
} from 'lucide-react';
import { UserContext } from '@/types';

interface ToolbarProps {
    context: UserContext;
    setContext: React.Dispatch<React.SetStateAction<UserContext>>;
    editMode: boolean;
    selectedPath: string | null;
    loading: boolean;
    showCode: boolean;
    setShowCode: (show: boolean) => void;
    history: {
        canUndo: boolean;
        canRedo: boolean;
        undo: () => void;
        redo: () => void;
    };
    onCreateVariation: () => void;
    onPlaySound: (sound: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
    context,
    setContext,
    editMode,
    selectedPath,
    loading,
    showCode,
    setShowCode,
    history,
    onCreateVariation,
    onPlaySound
}) => {
    const { canUndo, canRedo, undo, redo } = history;

    return (
        <div className="h-16 border-b border-white/5 bg-transparent flex items-center justify-center relative z-30 px-6 pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 shadow-2xl backdrop-blur-md">
                {/* View Toggles */}
                <button
                    onClick={() => { setContext(p => ({ ...p, device: 'desktop' })); onPlaySound('CLICK'); }}
                    className={`p-2 rounded-md transition-all ${context.device === 'desktop' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Desktop View"
                    data-testid="device-desktop"
                >
                    <Monitor className="w-4 h-4" />
                </button>
                <button
                    onClick={() => { setContext(p => ({ ...p, device: 'mobile' })); onPlaySound('CLICK'); }}
                    className={`p-2 rounded-md transition-all ${context.device === 'mobile' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Mobile View"
                    data-testid="device-mobile"
                >
                    <Smartphone className="w-4 h-4" />
                </button>

                <div className="w-px h-4 bg-white/10 mx-2" />

                {/* History Controls */}
                <button
                    onClick={() => undo()}
                    disabled={!canUndo}
                    className={`p-2 rounded-md transition-all ${!canUndo ? 'text-zinc-700 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                    title="Undo (Ctrl+Z)"
                    data-testid="toolbar-undo"
                >
                    <Undo2 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => redo()}
                    disabled={!canRedo}
                    className={`p-2 rounded-md transition-all ${!canRedo ? 'text-zinc-700 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                    title="Redo (Ctrl+Shift+Z)"
                    data-testid="toolbar-redo"
                >
                    <Redo2 className="w-4 h-4" />
                </button>

                <div className="w-px h-4 bg-white/10 mx-2" />

                {/* Role Toggle */}
                <button
                    onClick={() => setContext(p => ({ ...p, role: context.role === 'admin' ? 'user' : 'admin' }))}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:bg-white/10 transition-all"
                    data-testid="role-toggle"
                >
                    {context.role === 'admin' ? <Shield className="w-3.5 h-3.5 text-indigo-400" /> : <User className="w-3.5 h-3.5 text-emerald-400" />}
                    {context.role === 'admin' ? 'Admin' : 'User'}
                </button>
            </div>

            {/* Action Buttons Right */}
            <div className="absolute right-6 flex items-center gap-3 pointer-events-auto">
                {editMode && selectedPath && (
                    <button
                        onClick={() => { onCreateVariation(); onPlaySound('ACTIVATE'); }}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all animate-in fade-in"
                        data-testid="make-variation"
                    >
                        <Split className="w-3.5 h-3.5" />
                        Make Variation
                    </button>

                )}

                <button
                    onClick={() => { setShowCode(!showCode); onPlaySound('CLICK'); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all backdrop-blur-md ${showCode ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-black/30 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
                    data-testid="export-code"
                >
                    <Code2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Export Code</span>
                </button>
            </div>
        </div>
    );
};
