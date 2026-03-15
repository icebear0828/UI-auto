import React from 'react';
import { Target, X, ChevronRight } from 'lucide-react';

interface RefinementBarProps {
    selectedPath: string | null;
    setSelectedPath: (path: string | null) => void;
}

export const RefinementBar: React.FC<RefinementBarProps> = ({
    selectedPath,
    setSelectedPath
}) => {
    const breadcrumbs = selectedPath
        ? selectedPath.split('.').filter(p => isNaN(Number(p)) && p !== 'children' && p !== 'root')
        : [];

    return (
        <div className={`transition-all duration-300 ease-out transform origin-bottom ${selectedPath ? 'h-auto opacity-100 mb-3' : 'h-0 opacity-0 overflow-hidden'}`}>
            <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-lg backdrop-blur-md">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="p-1.5 rounded-md bg-indigo-500/20 text-indigo-300">
                        <Target className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-indigo-200/60 overflow-hidden whitespace-nowrap">
                        {breadcrumbs.map((crumb, i) => (
                            <React.Fragment key={i}>
                                <span className="hover:text-white transition-colors cursor-default capitalize">{crumb}</span>
                                {i < breadcrumbs.length - 1 && <ChevronRight className="w-3 h-3 opacity-50" />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                <button onClick={() => setSelectedPath(null)} className="text-indigo-400 hover:text-white p-1 hover:bg-indigo-500/20 rounded transition-colors">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
};
