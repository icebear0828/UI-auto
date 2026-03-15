import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface EditorContextType {
  isEditing: boolean;
  selectedPath: string | null;
  hoveredPath: string | null;
  onSelect: (path: string | null) => void;
  onHover: (path: string | null) => void;
}

const EditorContext = createContext<EditorContextType>({
  isEditing: false,
  selectedPath: null,
  hoveredPath: null,
  onSelect: () => {},
  onHover: () => {},
});

export const EditorProvider: React.FC<{ 
  value: Omit<EditorContextType, 'hoveredPath' | 'onHover'>, 
  children: React.ReactNode 
}> = ({ value, children }) => {
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const handleHover = useCallback((path: string | null) => {
    setHoveredPath(path);
  }, []);

  const contextValue = useMemo<EditorContextType>(() => ({
    ...value,
    hoveredPath,
    onHover: handleHover,
    onSelect: value.onSelect
  }), [value.isEditing, value.selectedPath, value.onSelect, hoveredPath, handleHover]);

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => useContext(EditorContext);