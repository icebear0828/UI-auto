import { z } from "zod";
import { registerUINodeSchema } from "./helpers";

// Import all node schemas
import { ContainerNode, HeroNode, CardNode, BentoContainerNode, BentoCardNode, SplitPaneNode } from "./layout";
import { ButtonNode, InputNode, TextareaNode, SwitchNode, SliderNode, CalendarNode } from "./form";
import { TextNode, StatNode, ProgressNode, AlertNode, AvatarNode, BadgeNode, SeparatorNode, ImageNode } from "./display";
import {
  TableNode, ChartNode, AccordionNode, MapNode, KanbanNode,
  TabsNode, StepperNode, TimelineNode, CodeBlockNode,
} from "./composite";
import { VNStageNode } from "./vn-stage";
import { SvgAnimationNode } from "./svg-animation";
import { PresentationNode } from "./presentation";

// Import types needed for TypedUINode
import type { ContainerProps } from "./layout";
import type { HeroProps } from "./layout";
import type { CardProps } from "./layout";
import type { BentoContainerProps, BentoCardProps, SplitPaneProps } from "./layout";
import type { ButtonProps, InputProps, TextareaProps, SwitchProps, SliderProps, CalendarProps } from "./form";
import type { TextProps, StatProps, ProgressProps, AlertProps, AvatarProps, BadgeProps, SeparatorProps, ImageProps } from "./display";
import type {
  TableProps, ChartProps, AccordionProps, MapProps, KanbanProps,
  TabsProps, StepperProps, TimelineProps, CodeBlockProps,
} from "./composite";
import type { VNStageProps } from "./vn-stage";
import type { SvgAnimationProps } from "./svg-animation";
import type { PresentationProps } from "./presentation";

// Import validateNode factory and re-export with bound schema
import { validateNode as _validateNode, isComponentType, getComponentProps } from "./validation";
export type { ValidationResult } from "./validation";
export { isComponentType, getComponentProps };

// ----------------------------------------------------------------------
// ASSEMBLE UINodeSchema UNION
// ----------------------------------------------------------------------

export const UINodeSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    ContainerNode,
    HeroNode,
    TextNode,
    ButtonNode,
    CardNode,
    TableNode,
    StatNode,
    ProgressNode,
    AlertNode,
    AvatarNode,
    ChartNode,
    AccordionNode,
    ImageNode,
    MapNode,
    InputNode,
    TextareaNode,
    BadgeNode,
    SeparatorNode,
    BentoContainerNode,
    BentoCardNode,
    KanbanNode,
    SwitchNode,
    SliderNode,
    TabsNode,
    StepperNode,
    TimelineNode,
    CodeBlockNode,
    SplitPaneNode,
    CalendarNode,
    VNStageNode,
    SvgAnimationNode,
    PresentationNode,
  ])
);

// Register the assembled schema so lazy references in helpers resolve correctly
registerUINodeSchema(UINodeSchema);

// Bind validateNode to the assembled schema
export const validateNode = (node: unknown) => _validateNode(node, UINodeSchema);

// ----------------------------------------------------------------------
// TYPED UINODE - Discriminated Union for Type Safety
// ----------------------------------------------------------------------

export type TypedUINode =
  | { container: ContainerProps }
  | { hero: HeroProps }
  | { text: TextProps }
  | { button: ButtonProps }
  | { card: CardProps }
  | { table: TableProps }
  | { stat: StatProps }
  | { progress: ProgressProps }
  | { alert: AlertProps }
  | { avatar: AvatarProps }
  | { chart: ChartProps }
  | { accordion: AccordionProps }
  | { image: ImageProps }
  | { map: MapProps }
  | { input: InputProps }
  | { textarea: TextareaProps }
  | { badge: BadgeProps }
  | { separator: SeparatorProps }
  | { bento_container: BentoContainerProps }
  | { bento_card: BentoCardProps }
  | { kanban: KanbanProps }
  | { switch: SwitchProps }
  | { slider: SliderProps }
  | { tabs: TabsProps }
  | { stepper: StepperProps }
  | { timeline: TimelineProps }
  | { codeblock: CodeBlockProps }
  | { split_pane: SplitPaneProps }
  | { calendar: CalendarProps }
  | { vn_stage: VNStageProps }
  | { svg_animation: SvgAnimationProps }
  | { presentation: PresentationProps };

export type ComponentTypeKey = keyof TypedUINode extends infer K
  ? K extends string ? K : never
  : never;

export type ValidComponentType =
  | 'container' | 'hero' | 'text' | 'button' | 'card'
  | 'table' | 'stat' | 'progress' | 'alert' | 'avatar'
  | 'chart' | 'accordion' | 'image' | 'map' | 'input'
  | 'textarea' | 'badge' | 'separator' | 'bento_container'
  | 'bento_card' | 'kanban' | 'switch' | 'slider' | 'tabs'
  | 'stepper' | 'timeline' | 'codeblock' | 'split_pane'
  | 'calendar' | 'vn_stage' | 'svg_animation' | 'presentation';

// ----------------------------------------------------------------------
// RE-EXPORT ALL from sub-modules
// ----------------------------------------------------------------------

export {
  ActionSchema, AnimationSchema, NodeArray, FlexContent,
  registerUINodeSchema, getUINodeSchema,
} from "./helpers";
export type { UIActionType, AnimationType } from "./helpers";

export {
  ContainerPropsSchema, HeroPropsSchema, CardPropsSchema,
  BentoContainerPropsSchema, BentoCardPropsSchema, SplitPanePropsSchema,
} from "./layout";
export type { ContainerProps, HeroProps, CardProps, BentoContainerProps, BentoCardProps, SplitPaneProps } from "./layout";

export {
  ButtonPropsSchema, ValidationSchema, InputPropsSchema, TextareaPropsSchema,
  SwitchPropsSchema, SliderPropsSchema, CalendarPropsSchema,
} from "./form";
export type { ButtonProps, ValidationConfig, InputProps, TextareaProps, SwitchProps, SliderProps, CalendarProps } from "./form";

export {
  TextPropsSchema, StatPropsSchema, ProgressPropsSchema, AlertPropsSchema,
  AvatarPropsSchema, BadgePropsSchema, SeparatorPropsSchema, ImagePropsSchema,
} from "./display";
export type { TextProps, StatProps, ProgressProps, AlertProps, AvatarProps, BadgeProps, SeparatorProps, ImageProps } from "./display";

export {
  TableCellSchema, TablePropsSchema, ChartDataPointSchema, ChartPropsSchema,
  AccordionItemSchema, AccordionPropsSchema, MapMarkerSchema, MapPropsSchema,
  KanbanItemSchema, KanbanColumnSchema, KanbanPropsSchema,
  TabItemSchema, TabsPropsSchema, StepperItemSchema, StepperPropsSchema,
  TimelineItemSchema, TimelinePropsSchema, CodeBlockPropsSchema,
} from "./composite";
export type {
  TableCell, TableProps, ChartDataPoint, ChartProps,
  AccordionItem, AccordionProps, MapMarker, MapProps,
  KanbanItem, KanbanColumn, KanbanProps,
  TabItem, TabsProps, StepperItem, StepperProps,
  TimelineItem, TimelineProps, CodeBlockProps,
} from "./composite";

export {
  ImageAssetSchema, FlexImageAssetSchema, VNCharacterSchema,
  VNDialogueSchema, VNChoiceSchema, VNStagePropsSchema,
} from "./vn-stage";
export type { ImageAsset, VNCharacter, VNDialogue, VNChoice, VNStageProps } from "./vn-stage";

export { SvgAnimationPropsSchema, SceneElementSchema } from "./svg-animation";
export type { SvgAnimationProps, SvgCharacter, SvgStep, SvgSide, SvgEvent, SceneElement } from "./svg-animation";

export { PresentationPropsSchema } from "./presentation";
export type { PresentationProps, Slide } from "./presentation";
