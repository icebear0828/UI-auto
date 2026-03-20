
import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, Type, Layout, MousePointer2, Box, Layers } from 'lucide-react';
import { UINode, UIAction } from '@/types';
import { getByPath } from './ui/renderUtils';

interface InspectorPanelProps {
  rootNode: UINode;
  selectedPath: string;
  onClose: () => void;
  onAction: (action: UIAction) => void;
}

// Internal Debounced Input to prevent history spamming
const DebouncedInput = ({ value, onChange, type = 'text' }: { value: string | number, onChange: (val: string | number) => void, type?: 'text' | 'number' }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChange(type === 'number' ? Number(localValue) : localValue);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(handler);
  }, [localValue, onChange, value, type]);

  return (
    <input 
      type={type}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500"
    />
  );
};

// Internal Debounced Textarea
const DebouncedTextarea = ({ value, onChange }: { value: string | number, onChange: (val: string | number) => void }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [localValue, onChange, value]);

  return (
    <textarea 
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 min-h-[80px] custom-scrollbar"
    />
  );
};

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ rootNode, selectedPath, onClose, onAction }) => {
  // 1. Resolve props from the tree
  // selectedPath points to the props object (e.g. "root.container.children.0.button")
  const currentProps = getByPath(rootNode, selectedPath);
  
  if (!currentProps) return null;

  // 2. Identify Component Type from path suffix
  // "root.container" -> "container"
  // "root.container.children.0.button" -> "button"
  const pathSegments = selectedPath.split('.');
  const componentType = pathSegments[pathSegments.length - 1];
  const props = currentProps;

  // 3. Handlers for Direct Manipulation
  const handlePropChange = (key: string, value: string | number | boolean) => {
    // We send a PATCH_STATE action to the specific property path.
    // Since selectedPath points to props, we send payload matching partial props.
    onAction({
      type: 'PATCH_STATE',
      path: selectedPath,
      payload: { [key]: value }
    });
  };

  const renderField = (key: string, value: unknown) => {
    if (key === 'children') return null; 
    
    const label = key.replace(/([A-Z])/g, ' $1').toLowerCase();
    
    if (typeof value === 'boolean') {
      return (
        <div key={key} className="flex items-center justify-between py-2">
          <label className="text-xs font-medium text-slate-400 capitalize">{label}</label>
          <button 
            onClick={() => handlePropChange(key, !value)}
            className={`w-10 h-5 rounded-full relative transition-colors ${value ? 'bg-indigo-500' : 'bg-zinc-700'}`}
          >
            <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      );
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const isLongText = String(value).length > 30;
      return (
        <div key={key} className="space-y-1.5 py-2">
           <label className="text-xs font-medium text-slate-400 capitalize flex items-center gap-1.5">
             {key === 'label' || key === 'title' || key === 'content' ? <Type className="w-3 h-3" /> : <Box className="w-3 h-3" />}
             {label}
           </label>
           {isLongText ? (
             <DebouncedTextarea 
                value={value}
                onChange={(val) => handlePropChange(key, val)}
             />
           ) : (
             <DebouncedInput 
                type={typeof value === 'number' ? 'number' : 'text'}
                value={value}
                onChange={(val) => handlePropChange(key, val)}
             />
           )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="w-80 h-full border-l border-white/5 bg-zinc-950/80 backdrop-blur-xl flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-white/5 bg-zinc-900/50">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400">
            <Layout className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-sm text-slate-200 uppercase tracking-wide">{componentType}</span>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
        <div className="space-y-6">
           
           {/* Section: Properties */}
           <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Layers className="w-3 h-3" /> Properties
              </h4>
              <div className="divide-y divide-zinc-800/50 border-y border-zinc-800/50">
                 {Object.entries(props).map(([k, v]) => renderField(k, v))}
                 {Object.keys(props).length === 0 && (
                   <div className="py-4 text-xs text-zinc-500 italic text-center">No editable properties</div>
                 )}
              </div>
           </div>

           {/* Section: Hierarchy info */}
           <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Selected Path</h4>
              <div className="flex items-center gap-2 text-[10px] font-mono text-indigo-300 break-all leading-relaxed bg-black/20 p-2 rounded">
                 <MousePointer2 className="w-3 h-3 flex-shrink-0" />
                 {selectedPath}
              </div>
           </div>

        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-5 border-t border-white/5 bg-zinc-900/50">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-all opacity-50 cursor-not-allowed" title="Coming in Phase 3.4">
           <Trash2 className="w-3.5 h-3.5" /> Delete Component
        </button>
      </div>
    </div>
  );
};
