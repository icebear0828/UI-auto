import { z } from "zod";
import { AnimationSchema, NodeArray } from "./helpers";

// 1. Container
export const ContainerPropsSchema = z.object({
  layout: z.string().optional(),
  gap: z.string().optional(),
  padding: z.boolean().optional(),
  background: z.string().optional(),
  bgImage: z.string().optional(),
  className: z.string().optional(),
  animation: AnimationSchema.optional(),
  children: NodeArray,
}).passthrough();
export const ContainerNode = z.object({ container: ContainerPropsSchema });
export type ContainerProps = z.infer<typeof ContainerPropsSchema>;

// 2. Hero
export const HeroPropsSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  gradient: z.string().optional(),
  align: z.string().optional(),
  animation: AnimationSchema.optional(),
  children: NodeArray,
}).passthrough();
export const HeroNode = z.object({ hero: HeroPropsSchema });
export type HeroProps = z.infer<typeof HeroPropsSchema>;

// 5. Card
export const CardPropsSchema = z.object({
  title: z.string().optional(),
  variant: z.string().optional(),
  animation: AnimationSchema.optional(),
  children: NodeArray,
}).passthrough();
export const CardNode = z.object({ card: CardPropsSchema });
export type CardProps = z.infer<typeof CardPropsSchema>;

// 19. Bento Grid
export const BentoContainerPropsSchema = z.object({
  children: NodeArray,
  animation: AnimationSchema.optional(),
}).passthrough();
export const BentoContainerNode = z.object({ bento_container: BentoContainerPropsSchema });
export type BentoContainerProps = z.infer<typeof BentoContainerPropsSchema>;

export const BentoCardPropsSchema = z.object({
  title: z.string().optional(),
  colSpan: z.number().optional(),
  rowSpan: z.number().optional(),
  bgImage: z.string().optional(),
  children: NodeArray,
  animation: AnimationSchema.optional(),
}).passthrough();
export const BentoCardNode = z.object({ bento_card: BentoCardPropsSchema });
export type BentoCardProps = z.infer<typeof BentoCardPropsSchema>;

// 27. SplitPane
export const SplitPanePropsSchema = z.object({
  direction: z.enum(['ROW', 'COL']).optional(),
  initialSize: z.number().optional(),
  children: NodeArray,
  animation: AnimationSchema.optional(),
}).passthrough();
export const SplitPaneNode = z.object({ split_pane: SplitPanePropsSchema });
export type SplitPaneProps = z.infer<typeof SplitPanePropsSchema>;
