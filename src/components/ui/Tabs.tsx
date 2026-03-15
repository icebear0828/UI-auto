
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RenderChildren } from './renderUtils';
import { useTheme } from '@/components/ThemeContext';

export const Tabs = ({ items = [], defaultValue, variant = 'DEFAULT', onAction, path }: any) => {
  const { theme } = useTheme();
  // Default to first item ID if no default provided
  const [activeTab, setActiveTab] = useState(defaultValue || (items[0] ? items[0].id : null));

  if (!items || items.length === 0) return null;

  const variantStyles = theme.tabs.variants[variant as keyof typeof theme.tabs.variants] || theme.tabs.variants.DEFAULT;

  return (
    <div className="w-full flex flex-col">
      {/* Tab List */}
      <div className={`flex gap-1 overflow-x-auto no-scrollbar ${variant === 'UNDERLINE' ? 'border-b border-white/10' : ''}`}>
        {items.map((item: any) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                relative px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap
                ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}
                ${variant === 'PILLS' ? 'rounded-full' : 'rounded-t-lg'}
              `}
            >
              <span className="relative z-10">{item.label}</span>
              
              {isActive && variant === 'DEFAULT' && (
                <motion.div
                  layoutId={`tab-bg-${path}`} // Scoped by path to prevent collision
                  className="absolute inset-0 bg-white/10 rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              {isActive && variant === 'PILLS' && (
                <motion.div
                  layoutId={`tab-bg-${path}`}
                  className="absolute inset-0 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/30"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              {isActive && variant === 'UNDERLINE' && (
                <motion.div
                  layoutId={`tab-line-${path}`}
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-4 min-h-[100px] relative">
        <AnimatePresence mode="wait">
          {items.map((item: any) => {
            if (item.id !== activeTab) return null;
            
            // Construct path for children to enable editing inside tabs
            const itemIndex = items.findIndex((i: any) => i.id === item.id);
            const contentPath = path ? `${path}.items.${itemIndex}.content` : undefined;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <RenderChildren children={item.content} onAction={onAction} parentPath={contentPath} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
