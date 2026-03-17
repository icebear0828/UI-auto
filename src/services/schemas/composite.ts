import { z } from "zod";
import { AnimationSchema, FlexContent, getUINodeSchema } from "./helpers";

// 6. Table
export const TableCellSchema = z.union([z.string(), z.number(), z.lazy(() => getUINodeSchema()), z.null()]);
export const TablePropsSchema = z.object({
  headers: z.array(z.string()).optional(),
  rows: z.array(z.array(TableCellSchema)).optional(),
  animation: AnimationSchema.optional(),
}).passthrough();
export const TableNode = z.object({ table: TablePropsSchema });
export type TableCell = z.infer<typeof TableCellSchema>;
export type TableProps = z.infer<typeof TablePropsSchema>;

// 11. Chart
export const ChartDataPointSchema = z.object({
  name: z.string().optional(),
}).passthrough();
export const ChartPropsSchema = z.object({
  title: z.string().optional(),
  type: z.string().optional(),
  color: z.string().optional(),
  colors: z.array(z.string()).optional(),
  series: z.array(z.string()).optional(),
  data: z.array(ChartDataPointSchema).optional().default([]),
  animation: AnimationSchema.optional(),
}).passthrough();
export const ChartNode = z.object({ chart: ChartPropsSchema });
export type ChartDataPoint = z.infer<typeof ChartDataPointSchema>;
export type ChartProps = z.infer<typeof ChartPropsSchema>;

// 12. Accordion
export const AccordionItemSchema = z.object({
  title: z.string(),
  content: FlexContent,
}).passthrough();
export const AccordionPropsSchema = z.object({
  variant: z.string().optional(),
  items: z.array(AccordionItemSchema).optional().default([]),
  animation: AnimationSchema.optional(),
}).passthrough();
export const AccordionNode = z.object({ accordion: AccordionPropsSchema });
export type AccordionItem = z.infer<typeof AccordionItemSchema>;
export type AccordionProps = z.infer<typeof AccordionPropsSchema>;

// 14. Map
export const MapMarkerSchema = z.object({
  title: z.string().optional(),
  label: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
}).passthrough();
export const MapPropsSchema = z.object({
  label: z.string().optional(),
  defaultZoom: z.number().optional(),
  style: z.string().optional(),
  markers: z.array(MapMarkerSchema).optional().default([]),
  animation: AnimationSchema.optional(),
}).passthrough();
export const MapNode = z.object({ map: MapPropsSchema });
export type MapMarker = z.infer<typeof MapMarkerSchema>;
export type MapProps = z.infer<typeof MapPropsSchema>;

// 20. Kanban
export const KanbanItemSchema = z.union([
  z.string(),
  z.object({ id: z.string().optional(), content: z.string(), tag: z.string().optional() }).passthrough(),
  z.object({ title: z.string(), description: z.string().optional() }).passthrough()
]);
export type KanbanItem = z.infer<typeof KanbanItemSchema>;

export const KanbanColumnSchema = z.object({
  title: z.string(),
  color: z.string().optional(),
  items: z.array(KanbanItemSchema).optional().default([]),
}).passthrough();
export type KanbanColumn = z.infer<typeof KanbanColumnSchema>;

export const KanbanPropsSchema = z.object({
  columns: z.array(KanbanColumnSchema).optional().default([]),
  animation: AnimationSchema.optional(),
}).passthrough();
export const KanbanNode = z.object({ kanban: KanbanPropsSchema });
export type KanbanProps = z.infer<typeof KanbanPropsSchema>;

// 23. Tabs
export const TabItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  content: FlexContent
}).passthrough();
export type TabItem = z.infer<typeof TabItemSchema>;

export const TabsPropsSchema = z.object({
  defaultValue: z.string().optional(),
  variant: z.string().optional(),
  items: z.array(TabItemSchema).optional().default([]),
  animation: AnimationSchema.optional(),
}).passthrough();
export const TabsNode = z.object({ tabs: TabsPropsSchema });
export type TabsProps = z.infer<typeof TabsPropsSchema>;

// 24. Stepper
export const StepperItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: FlexContent
}).passthrough();
export type StepperItem = z.infer<typeof StepperItemSchema>;

export const StepperPropsSchema = z.object({
  currentStep: z.number().optional().default(0),
  items: z.array(StepperItemSchema).optional().default([]),
  animation: AnimationSchema.optional(),
}).passthrough();
export const StepperNode = z.object({ stepper: StepperPropsSchema });
export type StepperProps = z.infer<typeof StepperPropsSchema>;

// 25. Timeline
export const TimelineItemSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  time: z.string().optional(),
  status: z.enum(['COMPLETED', 'ACTIVE', 'PENDING']).optional(),
  icon: z.string().optional(),
}).passthrough();
export type TimelineItem = z.infer<typeof TimelineItemSchema>;

export const TimelinePropsSchema = z.object({
  items: z.array(TimelineItemSchema).optional().default([]),
  variant: z.string().optional(),
  animation: AnimationSchema.optional(),
}).passthrough();
export const TimelineNode = z.object({ timeline: TimelinePropsSchema });
export type TimelineProps = z.infer<typeof TimelinePropsSchema>;

// 26. CodeBlock
export const CodeBlockPropsSchema = z.object({
  code: z.string(),
  language: z.string().optional(),
  filename: z.string().optional(),
  animation: AnimationSchema.optional(),
}).passthrough();
export const CodeBlockNode = z.object({ codeblock: CodeBlockPropsSchema });
export type CodeBlockProps = z.infer<typeof CodeBlockPropsSchema>;
