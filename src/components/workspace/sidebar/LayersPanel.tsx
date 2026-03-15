import React from 'react';
import { Layers } from 'lucide-react';
import { TreeView } from '@/components/TreeView';
import { UINode } from '@/types';

interface LayersPanelProps {
    activeNode: UINode | null;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({ activeNode }) => (
    <div className="p-4">
        {activeNode ? (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="mb-4 px-2 py-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">DOM Tree</span>
                    <div className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] text-zinc-400 font-mono">
                        ROOT
                    </div>
                </div>
                <TreeView node={activeNode} />
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-600">
                <Layers className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs">No active component</span>
            </div>
        )}
    </div>
);
