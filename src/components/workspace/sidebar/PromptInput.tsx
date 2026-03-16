import React from 'react';
import { ArrowUp, Square, Command, Wand2 } from 'lucide-react';
import { UserContext } from '@/types';

interface PromptInputProps {
    input: string;
    setInput: (value: string) => void;
    loading: boolean;
    isGenerating: boolean;
    editMode: boolean;
    selectedPath: string | null;
    selectedName: string;
    context: UserContext;
    onSubmit: (e: React.FormEvent) => void;
    onPlaySound: (sound: string) => void;
    canCancel?: boolean;
    onCancel?: () => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({
    input,
    setInput,
    loading,
    isGenerating,
    editMode,
    selectedPath,
    selectedName,
    context,
    onSubmit,
    onPlaySound,
    canCancel,
    onCancel
}) => (
    <form onSubmit={onSubmit} className="relative group">
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${editMode ? 'from-indigo-600 via-purple-600 to-pink-600' : 'from-indigo-500/50 via-purple-500/50 to-pink-500/50'} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-md`} />
        <div className="relative flex items-center bg-zinc-900/90 border border-white/10 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-2xl">
            <div className="pl-4 text-slate-500">
                {editMode && selectedPath ? (
                    <Wand2 className="w-4 h-4 text-indigo-400 animate-pulse" />
                ) : (
                    <Command className="w-4 h-4 text-zinc-500" />
                )}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => { setInput(e.target.value); onPlaySound('TYPE'); }}
                placeholder={editMode && selectedPath ? `Refine this ${selectedName}...` : context.mode === 'galgame' ? "Set the scene or dialogue..." : context.mode === 'svg_animation' ? "Describe a tutorial or scene..." : "Describe your UI..."}
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 py-4 px-3 focus:outline-none font-medium"
                data-testid="prompt-input"
                disabled={loading || isGenerating}
            />
            {canCancel ? (
                <button
                    type="button"
                    onClick={onCancel}
                    data-testid="prompt-cancel"
                    className="mr-2 p-2 rounded-lg transition-all duration-300 bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20"
                >
                    <Square className="w-4 h-4" />
                </button>
            ) : (
                <button
                    type="submit"
                    disabled={!input.trim() || loading || isGenerating}
                    data-testid="prompt-submit"
                    className={`mr-2 p-2 rounded-lg transition-all duration-300 ${input.trim()
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 translate-x-0 opacity-100'
                            : 'bg-white/5 text-zinc-600 translate-x-2 opacity-50'
                        }`}
                >
                    <ArrowUp className="w-4 h-4" />
                </button>
            )}
        </div>
    </form>
);
