
import React, { Suspense, createContext, useContext } from 'react';
import { UINode, UIAction } from '@/types';

const StreamingContext = createContext(false);
export const StreamingProvider = StreamingContext.Provider;
export const useIsStreaming = () => useContext(StreamingContext);

// BREAKING CIRCULAR DEPENDENCY:
// DynamicRenderer imports Registry -> Registry imports Container -> Container imports renderUtils -> renderUtils imports DynamicRenderer
// By lazy loading DynamicRenderer here, we break the static analysis cycle.
const DynamicRenderer = React.lazy(() => import('../DynamicRenderer'));

export const RenderChildren = ({ children, onAction, parentPath }: { children: UINode[], onAction: (action: UIAction) => void, parentPath?: string }) => {
  if (!children || !Array.isArray(children)) return null;
  
  // Filter out nulls, undefined, and empty objects ({}) which cause rendering errors
  const validChildren = children.filter(child => 
    child && 
    typeof child === 'object' && 
    Object.keys(child).length > 0
  );

  return (
    <Suspense fallback={<div className="w-full h-4 bg-white/5 animate-pulse rounded" />}>
      {validChildren.map((child: UINode, i: number) => {
        // We use the index from the filtered array, which might differ from original data index,
        // but for path construction in a read-only view, this is acceptable.
        // For strict editing, we might need to preserve original indices, but filtering is safer for display.
        const childPath = parentPath ? `${parentPath}.children.${i}` : undefined;
        return (
          <DynamicRenderer
            key={i}
            index={i}
            node={child}
            onAction={onAction}
            path={childPath}
          />
        );
      })}
    </Suspense>
  );
};

export function getByPath(obj: any, path: string): any {
  if (!path) return undefined;
  if (path === 'root') return obj;
  
  const cleanPath = path.startsWith('root.') ? path.substring(5) : path;
  
  const segments = cleanPath.split('.');
  let current = obj;
  
  for (const key of segments) {
    if (current === undefined || current === null) return undefined;
    current = current[key];
  }
  return current;
}

export function setByPath<T>(obj: T, path: string, value: any): T {
  if (!path) return value as unknown as T;
  
  const cleanPath = path.startsWith('root.') ? path.substring(5) : path;
  if (!cleanPath) return value; 

  const segments = cleanPath.split('.');

  const update = (current: any, depth: number): any => {
    if (depth === segments.length) return value;
    const key = segments[depth];
    
    let clone: any;
    if (Array.isArray(current)) {
      clone = [...current];
    } else if (current && typeof current === 'object') {
      clone = { ...current };
    } else {
      const isIndex = !isNaN(Number(key));
      clone = isIndex ? [] : {};
    }

    clone[key] = update(current ? current[key] : undefined, depth + 1);
    return clone;
  };

  return update(obj, 0) as T;
}
