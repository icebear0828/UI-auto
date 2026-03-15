import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeContext';

export const Slider = ({ label, min = 0, max = 100, value = 50, step = 1, onAction, path, ariaLabel }: any) => {
  const { theme } = useTheme();
  const [localValue, setLocalValue] = useState(value);

  // Generate unique ID for label association
  const sliderId = React.useId();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(Number(e.target.value));
  };

  const handleCommit = () => {
    if (onAction && path) {
      onAction({
        type: 'PATCH_STATE',
        path,
        payload: { value: localValue }
      });
    }
  };

  const percentage = ((localValue - min) / (max - min)) * 100;
  const accessibleLabel = ariaLabel || label || 'Slider';

  return (
    <div className={theme.slider.base} role="group" aria-labelledby={label ? `${sliderId}-label` : undefined}>
      {label && (
        <div className={theme.slider.label}>
          <label id={`${sliderId}-label`} htmlFor={sliderId}>{label}</label>
          <span className="text-slate-300 font-mono" aria-live="polite">{localValue}</span>
        </div>
      )}
      <div className="relative w-full h-4 flex items-center">
        <div className="absolute w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
             <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-75 ease-out"
                style={{ width: `${percentage}%` }}
             />
        </div>
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
          onKeyUp={handleCommit}
          aria-label={accessibleLabel}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={localValue}
          aria-valuetext={`${localValue} out of ${max}`}
          className="absolute w-full h-full opacity-0 cursor-pointer focus:ring-2 focus:ring-indigo-500"
        />
        <div
            className="pointer-events-none absolute h-4 w-4 bg-white rounded-full shadow-md border border-zinc-200 transition-all duration-75"
            style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
};
