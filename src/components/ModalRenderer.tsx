import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { UINode } from '@/types';
import DynamicRenderer from './DynamicRenderer';
import { UIAction } from '@/types';

interface ModalRendererProps {
  node: { title?: string, content: UINode } | null;
  onClose: () => void;
  onAction: (action: UIAction) => void;
  onError?: (error: Error, node: UINode, path: string) => void;
}

export const ModalRenderer: React.FC<ModalRendererProps> = ({ node, onClose, onAction, onError }) => {
  return (
    <AnimatePresence>
      {node && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ring-1 ring-white/10 z-[1001]"
          >
             {/* Header */}
             <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                <h3 className="font-semibold text-slate-200 tracking-tight">{node.title || 'Details'}</h3>
                <button 
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
             </div>

             {/* Body */}
             <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="w-full">
                  <DynamicRenderer 
                    node={node.content} 
                    onAction={onAction} 
                    path="modal_root" 
                    onError={onError} 
                  />
                </div>
             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};