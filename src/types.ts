// Re-export typed schemas for type-safe usage
export type {
  TypedUINode,
  ValidComponentType,
  ValidationResult,
  // Component Props
  ContainerProps,
  HeroProps,
  TextProps,
  ButtonProps,
  CardProps,
  TableProps,
  StatProps,
  ProgressProps,
  AlertProps,
  AvatarProps,
  ChartProps,
  AccordionProps,
  ImageProps,
  MapProps,
  InputProps,
  TextareaProps,
  BadgeProps,
  SeparatorProps,
  BentoContainerProps,
  BentoCardProps,
  KanbanProps,
  SwitchProps,
  SliderProps,
  TabsProps,
  StepperProps,
  TimelineProps,
  CodeBlockProps,
  SplitPaneProps,
  CalendarProps,
  VNStageProps,
  SvgAnimationProps,
  SvgCharacter,
  SvgStep,
  SvgSide,
  SvgEvent,
  // Sub-types
  AnimationType,
  ValidationConfig,
  ChartDataPoint,
  MapMarker,
  TabItem,
  StepperItem,
  TimelineItem,
  KanbanColumn,
  KanbanItem,
  AccordionItem,
  VNCharacter,
  VNDialogue,
  VNChoice,
  ImageAsset,
} from './services/schemas';

// 3.1 Recursive Data Structure & 3.2 Action Protocol
export interface UIAction {
  type: string;
  payload?: Record<string, unknown>;
  // For local state updates
  path?: string; // Dot notation path e.g. "0.children.1.input.value"
}

/**
 * UINode - Loose type used for streaming/unvalidated contexts where the JSON
 * structure is incomplete or not yet validated (e.g., during streaming parse,
 * in DynamicRenderer, or in AI provider return types).
 *
 * For post-validation code, use TypedUINode from './services/schemas'
 * which provides a fully discriminated union with typed props.
 */
export type UINode = Record<string, unknown>;

/** Props injected by DynamicRenderer into every component */
export interface RendererInjectedProps {
  onAction?: (action: UIAction) => void;
  path?: string;
  onError?: (error: Error, node: UINode, path: string) => void;
}

// User Context for 1.1 Implicit Input
export interface UserContext {
  role: 'admin' | 'user';
  device: 'desktop' | 'mobile';
  theme: 'dark' | 'light';
  mode?: 'default' | 'galgame' | 'svg_animation' | 'presentation';
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  uiNode?: UINode; // The structured UI payload
}

