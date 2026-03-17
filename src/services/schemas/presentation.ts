import { z } from "zod";

const SlideSchema = z.object({
  title: z.string().optional(),
  svg_code: z.string(),
  notes: z.string().optional(),
}).passthrough();

export const PresentationPropsSchema = z.object({
  title: z.string().optional(),
  slides: z.array(SlideSchema).optional().default([]),
}).passthrough();

export const PresentationNode = z.object({ presentation: PresentationPropsSchema });
export type PresentationProps = z.infer<typeof PresentationPropsSchema>;
export type Slide = z.infer<typeof SlideSchema>;
