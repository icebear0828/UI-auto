
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeContext';
import { useDebounce } from '@/hooks/useDebounce';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TextareaProps } from '@/services/schemas';
import type { RendererInjectedProps } from '@/types';

export const Textarea = ({ label, placeholder, value = '', validation, onAction, path }: TextareaProps & RendererInjectedProps) => {
  const { theme } = useTheme();
  const [localValue, setLocalValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const debouncedValue = useDebounce(localValue, 400);

  useEffect(() => {
    if (debouncedValue !== value && path && onAction) {
      onAction({
        type: 'PATCH_STATE',
        path,
        payload: { value: debouncedValue }
      });
    }
  }, [debouncedValue, onAction, path, value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
  };

  return (
    <div className={theme.textarea.base}>
      {label && <label className={theme.input.label}>{label}</label>}
      <div className="relative">
        <textarea 
          className={`${theme.textarea.field} ${error ? theme.input.error : ''}`}
          placeholder={placeholder}
          value={localValue}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};
