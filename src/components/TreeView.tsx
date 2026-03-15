import React, { useState } from 'react';
import { useEditor } from './EditorContext';
import { 
  Box, Type, MousePointerClick, CreditCard, LayoutTemplate, 
  Image as ImageIcon, BarChart3, Grip, ChevronRight, ChevronDown,
  Layers, Square, AlignJustify, Minus, Hash, AlertCircle, CircleUser, Map
} from 'lucide-react';
import { UINode } from '@/types';

interface TreeViewProps {
  node: UINode;
}

const getComponentIcon = (type: string) => {
  const map: Record<string, any> = {
    container: Box,
    text: Type,
    button: MousePointerClick,
    card: CreditCard,
    hero: LayoutTemplate,
    image: ImageIcon,
    chart: BarChart3,
    bento_container: Grip,
    bento_card: Square,
    kanban: AlignJustify,
    separator: Minus,
    stat: Hash,
    alert: AlertCircle,
    avatar: CircleUser,
    map: Map,
    table: LayoutTemplate,
  };
  return map[type.toLowerCase()] || Layers;
};

interface TreeNodeProps {
  node: UINode;
  path: string;
  depth?: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, path, depth = 0 }) => {
  const { selectedPath, hoveredPath, onSelect, onHover } = useEditor();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Extract component type and data
  const type = Object.keys(node)[0];
  if (!type) return null;

  const data = node[type] || {};
  const children = data.children;
  const hasChildren = Array.isArray(children) && children.length > 0;
  
  // Resolve Icon
  const Icon = getComponentIcon(type);

  // Interaction States
  // path logic: root.container.children.0.card
  const isSelected = selectedPath === path;
  const isHovered = hoveredPath === path;
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(isSelected ? null : path);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    onHover(path);
  };

  const handleMouseLeave = () => {
    onHover(null);
  };

  return (
    <div className="select-none">
      <div 
        className={`
          flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-150 relative group
          ${isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}
          ${isHovered && !isSelected ? 'bg-white/5 text-slate-200' : ''}
        `}
        style={{ marginLeft: depth * 12 }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Toggle Collapse */}
        <div 
          onClick={(e) => { e.stopPropagation(); setIsCollapsed(!isCollapsed); }}
          className={`p-0.5 rounded hover:bg-black/20 transition-colors ${!hasChildren ? 'opacity-0 pointer-events-none' : ''}`}
        >
           {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </div>

        {/* Icon & Label */}
        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-200' : 'text-slate-500 group-hover:text-slate-400'}`} />
        <span className="text-xs font-medium truncate flex-1">
          {type}
          {data.label && <span className="ml-2 opacity-50 font-normal">"{data.label}"</span>}
          {data.title && <span className="ml-2 opacity-50 font-normal">"{data.title}"</span>}
        </span>
        
        {/* Indentation Guide Line */}
        {depth > 0 && (
          <div className="absolute left-[-12px] top-0 bottom-0 w-px bg-white/5 group-hover:bg-white/10" />
        )}
      </div>

      {/* Recursive Children */}
      {!isCollapsed && hasChildren && (
        <div className="flex flex-col border-l border-white/5 ml-[19px]">
          {children.map((child: UINode, idx: number) => (
            <TreeNode 
              key={idx} 
              node={child} 
              path={`${path}.children.${idx}.${Object.keys(child)[0]}`} 
              depth={0} // We handle indentation via margin-left in the parent styling mostly, or reset here
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const TreeView: React.FC<TreeViewProps> = ({ node }) => {
  if (!node) return (
    <div className="p-8 text-center text-xs text-zinc-600 italic">
      No component selected
    </div>
  );
  
  // Resolve root key
  const rootType = Object.keys(node)[0];

  return (
    <div className="w-full flex flex-col gap-1 pb-10">
      <TreeNode node={node} path={`root.${rootType}`} depth={0} />
    </div>
  );
};