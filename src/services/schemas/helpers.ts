import { z } from "zod";

// ----------------------------------------------------------------------
// RECURSIVE SCHEMA REGISTRATION
// ----------------------------------------------------------------------

let _uiNodeSchema: z.ZodType<any> | null = null;

export function registerUINodeSchema(schema: z.ZodType<any>) {
  _uiNodeSchema = schema;
}

export function getUINodeSchema(): z.ZodType<any> {
  if (!_uiNodeSchema) throw new Error("UINodeSchema not registered");
  return _uiNodeSchema;
}

// ----------------------------------------------------------------------
// HELPER SCHEMAS
// ----------------------------------------------------------------------

// Action Schema for buttons, clickable areas, etc.
export const ActionSchema = z.object({
  type: z.string(),
  payload: z.any().optional(),
  path: z.string().optional(),
}).passthrough();

export type UIActionType = z.infer<typeof ActionSchema>;

// Animation Schema
export const AnimationSchema = z.object({
  type: z.enum([
    'FADE_IN', 'FADE_IN_UP', 'SLIDE_FROM_LEFT', 'SLIDE_FROM_RIGHT', 'SCALE_IN',
    'SCALE_ELASTIC', 'BLUR_IN', 'STAGGER_CONTAINER', 'PULSE', 'SHIMMER',
    'SHAKE', 'GLOW', 'BOUNCE',
    'TYPEWRITER', 'SCRAMBLE', 'GRADIENT_FLOW',
    'WIGGLE', 'POP', 'HOVER_GROW',
    'NONE'
  ]).optional(),
  duration: z.enum(['FAST', 'NORMAL', 'SLOW']).optional(),
  delay: z.number().optional(),
  trigger: z.enum(['ON_MOUNT', 'ON_HOVER', 'ON_VIEW']).optional(),
}).passthrough();

export type AnimationType = z.infer<typeof AnimationSchema>;

// Recursive definition wrappers using lazy references
export const NodeArray = z.array(z.lazy(() => getUINodeSchema())).optional().default([]);

// Flexible content: accepts string, single UINode, or UINode[] (AI generates all three forms)
export const FlexContent = z.union([
  z.array(z.lazy(() => getUINodeSchema())),
  z.lazy(() => getUINodeSchema()).transform((node: any) => [node]),
  z.string().transform((s: string) => [{ text: { content: s } }]),
]).optional().default([]);
