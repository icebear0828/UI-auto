import { z } from "zod";

// ============================================================
// Scene Element — the atomic unit of the orchestration engine
// ============================================================

export const SceneElementSchema = z.object({
  asset: z.string(),
  position: z.string().optional(),
  anchor: z.string().optional(),
  pose: z.string().optional(),
  label: z.string().optional(),
  text: z.string().optional(),
  animate: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  style: z.string().optional(),
  size: z.string().optional(),
}).passthrough();

export type SceneElement = z.infer<typeof SceneElementSchema>;

// ============================================================
// Legacy sub-schemas (backward compat for old template data)
// ============================================================

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

// ============================================================
// Main Props Schema — new elements-based + legacy template fields
// ============================================================

export const SvgAnimationPropsSchema = z.object({
  title: z.string().optional(),
  background: z.string().optional(),
  sequence: z.boolean().optional().default(true),

  // New: raw SVG code (AI-generated)
  svg_code: z.string().optional(),

  // Scene orchestration (elements-based)
  elements: z.array(SceneElementSchema).optional().default([]),

  // Legacy: template-based (backward compat)
  template: z.string().optional(),
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
