
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeContext';
import { motion } from 'framer-motion';
import type { SwitchProps } from '@/services/schemas';
import type { RendererInjectedProps } from '@/types';

export const Switch = ({ label, value = false, onAction, path, ariaLabel }: SwitchProps & RendererInjectedProps) => {
  const { theme } = useTheme();
  const [isOn, setIsOn] = useState(value);

  // Generate unique ID for label association
  const switchId = React.useId();

  useEffect(() => {
    setIsOn(value);
  }, [value]);

  const toggle = (e: React.MouseEvent) => {
    // Critical: Stop click from bubbling to parent Card (which handles selection)
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    const newState = !isOn;
    setIsOn(newState);

    if (onAction && path) {
      onAction({
        type: 'PATCH_STATE',
        path,
        payload: { value: newState }
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Toggle on Space or Enter
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle(e as unknown as React.MouseEvent);
    }
  };

  const accessibleLabel = ariaLabel || label || 'Toggle switch';

  return (
    <div
      className={theme.switch.base}
      onClick={(e) => { e.stopPropagation(); }} // Also block container clicks
    >
      {label && (
        <label
          id={`${switchId}-label`}
          className={theme.switch.label}
          onClick={toggle}
        >
          {label}
        </label>
      )}
      <button
        role="switch"
        aria-checked={isOn}
        aria-label={accessibleLabel}
        aria-labelledby={label ? `${switchId}-label` : undefined}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${isOn ? 'bg-indigo-600' : 'bg-zinc-700'}`}
      >
        <motion.div
          layout
          className="bg-white w-4 h-4 rounded-full shadow-md"
          animate={{ x: isOn ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
};
