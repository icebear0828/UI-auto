
import React, { useState, useEffect } from 'react';
import { Reorder } from 'framer-motion';
import { Plus, MoreHorizontal, GripVertical } from 'lucide-react';

interface KanbanItem {
  id: string;
  content: string;
  tag?: string;
}

interface KanbanColumn {
  title: string;
  color: string;
  items: (string | KanbanItem)[];
}

export const Kanban = ({ columns = [], onAction, path }: { columns: KanbanColumn[], onAction?: any, path?: string }) => {
  
  // Local state to manage columns immediately during drag
  // We wrap items in an object with a guaranteed ID to satisfy Reorder requirements
  const [localColumns, setLocalColumns] = useState<any[]>([]);

  useEffect(() => {
    // Transform props to stable local state with IDs
    const transformed = columns.map(col => ({
      ...col,
      items: (col.items || []).map((item, idx) => {
        const itemObj = typeof item === 'string' ? { content: item } : item;
        // Ensure ID exists for Reorder key
        return {
          ...itemObj,
          _dragId: (itemObj as any).id || `item-${Math.random().toString(36).substr(2, 9)}-${idx}`
        };
      })
    }));
    setLocalColumns(transformed);
  }, [columns]);

  const handleReorder = (colIndex: number, newItems: any[]) => {
    // 1. Update Local State (Immediate Visual Feedback)
    const newColumns = [...localColumns];
    newColumns[colIndex] = { ...newColumns[colIndex], items: newItems };
    setLocalColumns(newColumns);

    // 2. Dispatch Patch (Debounced or Immediate)
    // We strip the transient _dragId before sending back to global state
    if (onAction && path) {
      const cleanItems = newItems.map(({ _dragId, ...rest }) => {
        // Return to original shape (string or object)
        // If it was originally a string, we can't easily revert to string if we mutated it, 
        // but here we only reordered. 
        // Heuristic: If it has only 'content' and no tag/id, it might have been a string.
        // But safer to send back the object structure which the schema supports.
        return rest;
      });

      onAction({
        type: 'PATCH_STATE',
        path: `${path}.columns.${colIndex}.items`,
        payload: cleanItems
      });
    }
  };

  return (
    <div className="flex w-full overflow-x-auto gap-6 pb-4 snap-x">
      {localColumns.map((col, colIdx) => {
        const borderColor = col.color ? `border-${col.color.toLowerCase()}-500/30` : 'border-zinc-700';
        
        return (
          <div key={colIdx} className="flex-none w-80 flex flex-col gap-4 snap-start">
            {/* Column Header */}
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ring-2 ring-white/10 ${col.color === 'BLUE' ? 'bg-indigo-500' : col.color === 'GREEN' ? 'bg-emerald-500' : col.color === 'ORANGE' ? 'bg-orange-500' : 'bg-zinc-500'}`} />
                  <span className="font-semibold text-sm text-slate-200">{col.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-500 font-mono">{col.items.length}</span>
               </div>
               <button className="text-zinc-600 hover:text-zinc-400">
                  <Plus className="w-4 h-4" />
               </button>
            </div>

            {/* Column Body (Droppable Area) */}
            <div className={`flex-1 min-h-[400px] rounded-2xl bg-zinc-900/40 border border-white/5 p-3 flex flex-col gap-3 backdrop-blur-sm`}>
               
               <Reorder.Group 
                 axis="y" 
                 values={col.items} 
                 onReorder={(newItems) => handleReorder(colIdx, newItems)}
                 className="flex flex-col gap-3"
               >
                 {col.items.map((item: any) => (
                    <Reorder.Item 
                        key={item._dragId} 
                        value={item}
                        className="group relative bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm hover:border-zinc-600 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
                        whileDrag={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.5)", zIndex: 50 }}
                    >
                        <div className="flex justify-between items-start mb-2">
                           {item.tag ? (
                               <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-zinc-800 text-zinc-400`}>{item.tag}</span>
                           ) : <div />}
                           <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500" />
                              <button className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-zinc-400 transition-opacity">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                           </div>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed font-medium select-none">
                           {item.content}
                        </p>
                        
                        {/* Fake Avatar Stack for visual polish */}
                        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                           <div className="flex -space-x-2">
                              {[...Array(Math.floor(Math.random() * 3) + 1)].map((_, i) => (
                                <div key={i} className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-900 ring-1 ring-white/10" />
                              ))}
                           </div>
                        </div>
                    </Reorder.Item>
                 ))}
               </Reorder.Group>
               
               <button className="w-full py-2 rounded-lg border border-dashed border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:bg-white/5 hover:border-zinc-700 transition-all text-xs font-medium flex items-center justify-center gap-2 mt-2">
                  <Plus className="w-3 h-3" /> Add Task
               </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
