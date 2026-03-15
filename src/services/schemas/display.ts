import { z } from "zod";
import { AnimationSchema } from "./helpers";

// 3. Text
export const TextPropsSchema = z.object({
  content: z.string().optional().default(""),
  variant: z.string().optional(),
  color: z.string().optional(),
  font: z.string().optional(),
  animation: AnimationSchema.optional(),
}).passthrough();
export const TextNode = z.object({ text: TextPropsSchema });
export type TextProps = z.infer<typeof TextPropsSchema>;

// 7. Stat
export const StatPropsSchema = z.object({
  label: z.string().optional(),
  value: z.string().optional(),
  trend: z.string().optional(),
  trendDirection: z.enum(['UP', 'DOWN', 'NEUTRAL']).optional(),
  animation: AnimationSchema.optional(),
}).passthrough();
export const StatNode = z.object({ stat: StatPropsSchema });
export type StatProps = z.infer<typeof StatPropsSchema>;

// 8. Progress
export const ProgressPropsSchema = z.object({
  label: z.string().optional(),
  value: z.number().optional().default(0),
  color: z.string().optional(),
  animation: AnimationSchema.optional(),
}).passthrough();
export const ProgressNode = z.object({ progress: ProgressPropsSchema });
export type ProgressProps = z.infer<typeof ProgressPropsSchema>;

// 9. Alert
export const AlertPropsSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  variant: z.string().optional(),
  animation: AnimationSchema.optional(),
}).passthrough();
export const AlertNode = z.object({ alert: AlertPropsSchema });
export type AlertProps = z.infer<typeof AlertPropsSchema>;

// 10. Avatar
export const AvatarPropsSchema = z.object({
  initials: z.string().optional(),
  src: z.string().optional(),
  status: z.string().optional(),
  animation: AnimationSchema.optional(),
}).passthrough();
export const AvatarNode = z.object({ avatar: AvatarPropsSchema });
export type AvatarProps = z.infer<typeof AvatarPropsSchema>;

// 17. Badge
export const BadgePropsSchema = z.object({
  label: z.string().optional(),
  color: z.string().optional(),
  animation: AnimationSchema.optional(),
}).passthrough();
export const BadgeNode = z.object({ badge: BadgePropsSchema });
export type BadgeProps = z.infer<typeof BadgePropsSchema>;

// 18. Separator
export const SeparatorPropsSchema = z.object({}).passthrough();
export const SeparatorNode = z.object({ separator: SeparatorPropsSchema });
export type SeparatorProps = z.infer<typeof SeparatorPropsSchema>;

// 13. Image
export const ImagePropsSchema = z.object({
  src: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  aspectRatio: z.string().optional(),
  animation: AnimationSchema.optional(),
}).passthrough();
export const ImageNode = z.object({ image: ImagePropsSchema });
export type ImageProps = z.infer<typeof ImagePropsSchema>;
