import { z } from "zod";
import { ActionSchema } from "./helpers";

// 29. Visual Novel Stage (Galgame)
export const ImageAssetSchema = z.object({
  source: z.enum(['EXTERNAL_URL', 'GENERATED']),
  value: z.string(),
  style: z.string().optional(),
});
export type ImageAsset = z.infer<typeof ImageAssetSchema>;

// Accepts both plain URL string and structured ImageAsset object
export const FlexImageAssetSchema = z.union([
  ImageAssetSchema,
  z.string().transform((url: string) => ({ source: 'EXTERNAL_URL' as const, value: url })),
]);

export const VNCharacterSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  avatar: FlexImageAssetSchema.optional(),
  image: z.string().optional(),
  position: z.enum(['LEFT', 'CENTER', 'RIGHT', 'CLOSE_UP']),
  expression: z.enum(['NEUTRAL', 'SMILE', 'ANGRY', 'BLUSH', 'SAD', 'SHOCKED']).optional(),
  animation: z.object({
    type: z.string(),
    delay: z.number().optional()
  }).optional()
}).passthrough();
export type VNCharacter = z.infer<typeof VNCharacterSchema>;

export const VNDialogueSchema = z.object({
  speaker: z.string(),
  content: z.string().optional(),
  text: z.string().optional(),
  voice_id: z.string().optional(),
  speed: z.enum(['SLOW', 'NORMAL', 'FAST']).optional()
}).passthrough();
export type VNDialogue = z.infer<typeof VNDialogueSchema>;

export const VNChoiceSchema = z.object({
  label: z.string().optional(),
  text: z.string().optional(),
  action: ActionSchema,
  style: z.string().optional()
}).passthrough();
export type VNChoice = z.infer<typeof VNChoiceSchema>;

export const VNStagePropsSchema = z.object({
  background: FlexImageAssetSchema,
  bgm: z.string().optional(),
  sfx: z.string().optional(),
  characters: z.array(VNCharacterSchema).optional().default([]),
  dialogue: VNDialogueSchema,
  choices: z.array(VNChoiceSchema).optional(),
}).passthrough();
export const VNStageNode = z.object({ vn_stage: VNStagePropsSchema });
export type VNStageProps = z.infer<typeof VNStagePropsSchema>;
