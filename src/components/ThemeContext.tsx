
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { DEFAULT_THEME, ThemeType } from './ui/theme';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: Partial<ThemeType>) => void;
  resetTheme: () => void;
  isGenerating: boolean;
  setIsGenerating: (is: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
  resetTheme: () => {},
  isGenerating: false,
  setIsGenerating: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setInternalTheme] = useState<ThemeType>(DEFAULT_THEME);
  const [isGenerating, setIsGenerating] = useState(false);

  const setTheme = useCallback((newTheme: Partial<ThemeType>) => {
    setInternalTheme(prev => ({ ...prev, ...newTheme }));
  }, []);

  const resetTheme = useCallback(() => {
    setInternalTheme(DEFAULT_THEME);
  }, []);

  const value = useMemo(() => ({
    theme, setTheme, resetTheme, isGenerating, setIsGenerating
  }), [theme, setTheme, resetTheme, isGenerating]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
