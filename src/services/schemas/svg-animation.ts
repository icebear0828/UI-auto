import { z } from "zod";

const SvgCharacterSchema = z.object({
  pose: z.enum(['stand', 'walk', 'wave', 'point', 'sit', 'think']).optional().default('stand'),
  label: z.string().optional(),
  dialog: z.string().optional(),
}).passthrough();

const SvgStepSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
}).passthrough();

const SvgSideSchema = z.object({
  title: z.string(),
  points: z.array(z.string()).optional().default([]),
}).passthrough();

const SvgEventSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
}).passthrough();

export const SvgAnimationPropsSchema = z.object({
  template: z.enum([
    'tutorial_step',
    'comparison',
    'flowchart',
    'dialog_scene',
    'highlight_concept',
    'timeline',
  ]),
  title: z.string().optional(),
  background: z.string().optional(),
  sequence: z.boolean().optional().default(true),

  // Content slots (each template uses a subset)
  character: SvgCharacterSchema.optional(),
  characters: z.array(SvgCharacterSchema).optional(),
  content: z.string().optional(),
  step: z.string().optional(),
  icon: z.string().optional(),
  left: SvgSideSchema.optional(),
  right: SvgSideSchema.optional(),
  steps: z.array(SvgStepSchema).optional(),
  events: z.array(SvgEventSchema).optional(),
  concept: z.string().optional(),
  description: z.string().optional(),
  points: z.array(z.string()).optional(),
}).passthrough();

export const SvgAnimationNode = z.object({ svg_animation: SvgAnimationPropsSchema });
export type SvgAnimationProps = z.infer<typeof SvgAnimationPropsSchema>;

// Re-export sub-types for component use
export type SvgCharacter = z.infer<typeof SvgCharacterSchema>;
export type SvgStep = z.infer<typeof SvgStepSchema>;
export type SvgSide = z.infer<typeof SvgSideSchema>;
export type SvgEvent = z.infer<typeof SvgEventSchema>;
