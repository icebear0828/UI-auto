
import React, { useState, useRef, useEffect } from 'react';
import { RenderChildren } from './renderUtils';
import { useTheme } from '@/components/ThemeContext';
import { useDeviceContext } from '@/components/DeviceContext';
import { UINode } from '@/types';

interface SplitPaneProps {
  direction?: 'ROW' | 'COL';
  initialSize?: number; // Percentage (0-100)
  children: UINode[];
  onAction?: any;
  path?: string;
}

export const SplitPane = ({ direction = 'ROW', initialSize = 50, children = [], onAction, path }: SplitPaneProps) => {
  const { theme } = useTheme();
  const { isMobile } = useDeviceContext();

  // 🔧 Mobile: always use COL (vertical stacking)
  const adaptedDirection = isMobile ? 'COL' : direction;

  const [size, setSize] = useState(initialSize);
  const containerRef = useRef<HTMLDivElement>(null);
  const isRow = adaptedDirection === 'ROW';

  const handleDrag = (e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    let newSize = 50;
    if (isRow) {
      const offsetX = e.clientX - rect.left;
      newSize = (offsetX / rect.width) * 100;
    } else {
      const offsetY = e.clientY - rect.top;
      newSize = (offsetY / rect.height) * 100;
    }

    // Clamp between 10% and 90%
    newSize = Math.max(10, Math.min(90, newSize));
    setSize(newSize);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = isRow ? 'col-resize' : 'row-resize';
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'default';
  };

  // Ensure we have exactly 2 children (or groups) for the split
  const firstChild = children[0] ? [children[0]] : [];
  const secondChild = children[1] ? [children[1]] : [];

  return (
    <div
      ref={containerRef}
      className={`${theme.splitPane.container} ${isRow ? 'flex-row' : 'flex-col'}`}
      style={{ minHeight: '300px' }} // Default min height ensuring visibility
    >
      {/* Pane 1 */}
      <div style={{ flexBasis: `${size}%` }} className="overflow-auto custom-scrollbar relative">
        <RenderChildren children={firstChild} onAction={onAction} parentPath={path ? `${path}.children.0` : undefined} />
      </div>

      {/* Divider */}
      <div
        onMouseDown={handleMouseDown}
        className={`${theme.splitPane.divider} ${isRow ? 'w-1 cursor-col-resize h-full' : 'h-1 cursor-row-resize w-full'}`}
      >
        <div className={`${theme.splitPane.handle} ${isRow ? 'h-8 w-1' : 'w-8 h-1'}`} />
      </div>

      {/* Pane 2 */}
      <div style={{ flexBasis: `${100 - size}%` }} className="overflow-auto custom-scrollbar relative">
        <RenderChildren children={secondChild} onAction={onAction} parentPath={path ? `${path}.children.1` : undefined} />
      </div>
    </div>
  );
};
