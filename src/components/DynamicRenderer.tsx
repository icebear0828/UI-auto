
import React, { useRef } from 'react';
import { UINode, UIAction } from '@/types';
import { ComponentRegistry } from './ui/Registry';
import { cachedValidateNode } from '@/services/validationCache';
import { getCachedVariants } from '@/services/animationCache';
import { telemetry } from '@/services/telemetry';
import { useEditor } from './EditorContext';
import { AlertCircle, RefreshCw, Edit3, MousePointer2, GitCommit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimationConfig } from './ui/animations';
import { useIsStreaming } from './ui/renderUtils';


interface RendererProps {
  node: UINode;
  onAction: (action: UIAction) => void;
  index?: number;
  path?: string;
  onError?: (error: Error, node: UINode, path: string) => void;
}

interface ErrorBoundaryProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  node: UINode;
  path: string;
  onError?: (error: Error, node: UINode, path: string) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[DynamicRenderer] Caught Error:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, this.props.node, this.props.path);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-lg border border-red-500/30 bg-red-900/10 flex items-center gap-3 animate-pulse">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-red-400">Rendering Failed</h4>
            <p className="text-xs text-red-300/70">Attempting auto-repair...</p>
          </div>
          <RefreshCw className="w-4 h-4 text-red-400 animate-spin" />
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * THE INTERACTIVE RENDERER
 * Handles Schema Validation, Rendering, Editor Interaction, and Self-Healing
 */
const DynamicRenderer: React.FC<RendererProps> = ({ node, onAction, index = 0, path = 'root', onError }) => {
  const { isEditing, selectedPath, hoveredPath, onSelect, onHover } = useEditor();
  const isStreaming = useIsStreaming();
  const elementRef = useRef<HTMLDivElement>(null);
  const lastValidNodeRef = useRef<Record<string, unknown> | null>(null);

  // 1. Validation Layer
  if (!node || typeof node !== 'object') return null;
  if ('$$typeof' in node) return null;

  // SILENT FAIL: If node is empty object {}, just return null.
  // This happens often with trailing commas or imperfect parsing.
  if (Object.keys(node).length === 0) return null;

  const { success, data: validNode, error } = cachedValidateNode(node);

  // Cache last valid node for streaming stability
  if (success && validNode) {
    lastValidNodeRef.current = validNode;
  }

  // Use cached valid node during streaming to prevent flicker
  const effectiveNode = (success && validNode) ? validNode : (isStreaming ? lastValidNodeRef.current : null);

  if (!effectiveNode) {
    if (!isStreaming && Object.keys(node).length > 0) {
      const errString = error
        ? (typeof error === 'string' ? error : JSON.stringify(error.format(), null, 2))
        : "Unknown Validation Error";

      return (
        <div className="p-4 my-2 border border-dashed border-yellow-500/50 bg-yellow-500/10 text-yellow-500 text-xs font-mono rounded overflow-hidden group">
          <div className="font-bold mb-1 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            ⚠️ Invalid Component Schema
          </div>
          <details className="cursor-pointer">
            <summary className="opacity-50 hover:opacity-100 transition-opacity">View Error Details</summary>
            <pre className="mt-2 text-[10px] bg-black/50 p-2 rounded overflow-x-auto whitespace-pre-wrap">
              {errString}
            </pre>
            <div className="mt-2 text-[10px] opacity-50">Node Keys: {Object.keys(node).join(', ')}</div>
          </details>
        </div>
      );
    }
    return null;
  }

  const validNode_ = effectiveNode;

  // 2. Identify Component Type
  const nodeKeys = Object.keys(validNode_);
  const componentType = nodeKeys.find(key => ComponentRegistry[key]);

  // 3. Fallback
  if (!componentType) {
    // If we have keys but none match registry, show warning
    const registryKeys = Object.keys(ComponentRegistry);
    const registryStatus = registryKeys.length === 0 ? "EMPTY (Circular Dependency Detected)" : `Loaded (${registryKeys.length} items)`;

    // Debug info
    const keyStr = nodeKeys.length > 0 ? `"${nodeKeys[0]}"` : "UNDEFINED (Parsing Error)";

    return (
      <div className="p-4 border border-dashed border-yellow-500/50 bg-yellow-500/10 text-yellow-500 text-xs font-mono rounded">
        <div className="font-bold">⚠️ Unknown Component Type: {keyStr}</div>
        <div className="mt-1 opacity-50">Registry Status: {registryStatus}</div>
        {registryKeys.length > 0 && (
          <div className="mt-1 opacity-50">Available: {registryKeys.slice(0, 5).join(', ')}...</div>
        )}
      </div>
    );
  }

  // 4. Resolve Component & Props
  const Component = ComponentRegistry[componentType];
  const props = validNode_[componentType] || {};

  // Extract Animation Prop from schema (added to all visual components)
  const { children, animation, ...restProps } = props;
  const animConfig = animation as AnimationConfig | undefined;

  // Calculate path to the props of this specific component
  const currentPath = `${path}.${componentType}`;

  // Interaction States
  const isSelected = isEditing && selectedPath === currentPath;
  const isHovered = isEditing && hoveredPath === currentPath;

  // Is this component an ancestor of the selected item?
  const isParentOfSelected = isEditing && selectedPath?.startsWith(currentPath + '.') && selectedPath !== currentPath;

  const handleInteraction = (e: React.MouseEvent) => {
    if (isEditing) {
      e.stopPropagation();
      e.preventDefault();

      // Toggle Selection
      if (isSelected) {
        onSelect(null);
      } else {
        onSelect(currentPath);
      }
    }
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (isEditing) {
      e.stopPropagation();
      onHover(currentPath);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (isEditing) {
      e.stopPropagation();
      // Only clear if we were the one being hovered
      if (hoveredPath === currentPath) {
        onHover(null);
      }
    }
  };

  // 5. Render
  // IMPORTANT: We pass 'animation' back to the component. 
  // Some components (like Typography) need to handle specific text animations (scramble, typewriter) internally.
  const content = (
    <React.Suspense fallback={<div className="w-full h-8 animate-pulse bg-white/5 rounded" />}>
      <Component
        {...restProps}
        animation={animation}
        children={children}
        onAction={onAction}
        path={currentPath} // Pass path for children path generation
        onError={onError} // Propagate error handler
      />
    </React.Suspense>
  );

  // 6. Resolve Animation Variant using cache
  const finalVariants = getCachedVariants(animConfig);

  // 7. Determine if motion wrapper is needed
  const hasAnimation = animConfig != null && animConfig.type !== 'NONE';

  // Skip motion.div for static components outside edit mode
  if (!hasAnimation && !isEditing) {
    return (
      <ErrorBoundary node={node} path={path} onError={onError}>
        {content}
      </ErrorBoundary>
    );
  }

  // 8. Motion Wrapper (only when animated or in edit mode)
  return (
    <ErrorBoundary node={node} path={path} onError={onError}>
      <motion.div
        ref={elementRef}
        onClickCapture={handleInteraction}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        variants={finalVariants}
        initial="hidden"
        animate={animConfig?.trigger === 'ON_VIEW' ? undefined : "visible"}
        whileInView={animConfig?.trigger === 'ON_VIEW' ? "visible" : undefined}
        whileHover={animConfig?.trigger === 'ON_HOVER' ? "visible" : undefined}
        viewport={{ once: true, margin: "-10%" }}
        className={`relative w-full outline-none
          ${isEditing ? 'cursor-pointer' : ''}
        `}
        style={isEditing ? { display: 'contents' } : undefined}
      >
        {/* Editor Overlay Layer */}
        {isEditing && (
          <div className={`absolute inset-0 pointer-events-none z-[50] transition-all duration-200 rounded-lg
            ${isSelected ? 'ring-2 ring-indigo-500 bg-indigo-500/10 shadow-[0_0_0_4px_rgba(99,102,241,0.1)]' : ''}
            ${isHovered && !isSelected ? 'ring-1 ring-dashed ring-indigo-400/50 bg-indigo-400/5' : ''}
            ${isParentOfSelected ? 'ring-1 ring-white/5' : ''}
          `}>
            {/* Tag Label */}
            <AnimatePresence>
              {(isSelected || isHovered) && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.9 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`absolute -top-3 left-2 z-[60] flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-xl backdrop-blur-md border pointer-events-none select-none
                      ${isSelected
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-500/50'
                      : 'bg-zinc-900/90 border-zinc-700 text-zinc-400'
                    }
                   `}
                >
                  {isSelected ? <Edit3 className="w-3 h-3" /> : (isParentOfSelected ? <GitCommit className="w-3 h-3" /> : <MousePointer2 className="w-3 h-3" />)}
                  <span>{componentType}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Content Render - Ensure z-index handling for selection */}
        <div className={isEditing ? (isSelected ? "relative z-10" : "relative z-0") : ""}>
          {content}
        </div>
      </motion.div>
    </ErrorBoundary>
  );
};

export default React.memo(DynamicRenderer);
