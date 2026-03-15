
import React, { useState, useEffect, memo } from 'react';
import { useTheme } from '@/components/ThemeContext';
import { useDebounce } from '@/hooks/useDebounce';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { safeRegexTest, getSafePattern } from '@/services/safeRegex';
import { UIAction, AnimationType } from '@/types';

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';

interface InputValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  errorMessage?: string;
}

interface InputComponentProps {
  label?: string;
  placeholder?: string;
  inputType?: InputType;
  value?: string;
  validation?: InputValidation;
  onAction?: (action: UIAction) => void;
  path?: string;
  ariaLabel?: string;
  animation?: AnimationType;
}

export const Input = memo<InputComponentProps>(function Input({ label, placeholder, inputType = 'text', value = '', validation, onAction, path, ariaLabel }) {
  const { theme } = useTheme();

  // Generate unique IDs for accessibility
  const inputId = React.useId();
  const errorId = `${inputId}-error`;

  // Local state
  const [localValue, setLocalValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [isTouched, setIsTouched] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const debouncedValue = useDebounce(localValue, 300);

  // Validation Logic
  const validate = (val: string) => {
    if (!validation) return null;

    if (validation.required && !val.trim()) {
      return validation.errorMessage || "This field is required";
    }

    if (validation.minLength && val.length < validation.minLength) {
      return `Minimum ${validation.minLength} characters required`;
    }

    if (validation.maxLength && val.length > validation.maxLength) {
      return `Maximum ${validation.maxLength} characters allowed`;
    }

    if (validation.pattern) {
      // Use safe regex testing to prevent ReDoS attacks
      const result = safeRegexTest(val, validation.pattern);

      if (!result.success) {
        // Pattern was rejected for safety reasons - skip validation
        console.warn("[Input] Regex validation skipped:", result.error);
      } else if (!result.matched) {
        return validation.errorMessage || "Invalid format";
      }
    }

    return null;
  };

  useEffect(() => {
    // Dispatch patch only if value changed
    if (debouncedValue !== value && path && onAction) {
      onAction({
        type: 'PATCH_STATE',
        path,
        payload: { value: debouncedValue }
      });
    }
  }, [debouncedValue, onAction, path, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    if (isTouched) {
      setError(validate(e.target.value));
    }
  };

  const handleBlur = () => {
    setIsTouched(true);
    setError(validate(localValue));
  };

  const accessibleLabel = ariaLabel || label || placeholder || 'Input field';

  return (
    <div className={theme.input.base}>
      <label htmlFor={inputId} className={theme.input.label}>
        {label}
        {validation?.required && <span className="text-rose-400 ml-1" aria-hidden="true">*</span>}
      </label>

      <div className="relative">
        <input
          id={inputId}
          type={inputType}
          className={`${theme.input.field} ${error ? theme.input.error : ''}`}
          placeholder={placeholder}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-label={accessibleLabel}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          aria-required={validation?.required}
        />
        
        <AnimatePresence>
          {error && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.8 }}
               className="absolute right-3 top-3.5 text-rose-500"
            >
               <AlertCircle className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            id={errorId}
            role="alert"
            aria-live="polite"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={theme.input.errorMessage}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
