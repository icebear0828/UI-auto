import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

interface ToastItemProps {
  toast: ToastMessage;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const icons = {
    SUCCESS: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    ERROR: <XCircle className="w-5 h-5 text-rose-400" />,
    WARNING: <AlertTriangle className="w-5 h-5 text-orange-400" />,
    INFO: <Info className="w-5 h-5 text-blue-400" />,
  };

  const bgStyles = {
    SUCCESS: 'bg-zinc-900 border-emerald-500/20 shadow-emerald-500/10',
    ERROR: 'bg-zinc-900 border-rose-500/20 shadow-rose-500/10',
    WARNING: 'bg-zinc-900 border-orange-500/20 shadow-orange-500/10',
    INFO: 'bg-zinc-900 border-blue-500/20 shadow-blue-500/10',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`pointer-events-auto w-80 p-4 rounded-xl border shadow-lg backdrop-blur-md flex items-start gap-3 relative overflow-hidden group ${bgStyles[toast.type]}`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-200 leading-tight">{toast.title}</h4>
        {toast.description && (
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{toast.description}</p>
        )}
      </div>
      <button 
        onClick={onClose}
        className="text-zinc-500 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      
      {/* Progress Bar (Visual flair) */}
      <motion.div 
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 4, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-0.5 opacity-30 ${
            toast.type === 'SUCCESS' ? 'bg-emerald-500' : 
            toast.type === 'ERROR' ? 'bg-rose-500' : 
            toast.type === 'WARNING' ? 'bg-orange-500' : 'bg-blue-500'
        }`}
      />
    </motion.div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(({ title, description, type }: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    
    // Auto dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-0 right-0 p-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};