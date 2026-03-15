import { z } from "zod";
import { ActionSchema, AnimationSchema } from "./helpers";

// 4. Button
export const ButtonPropsSchema = z.object({
  label: z.string().optional(),
  variant: z.string().optional(),
  icon: z.string().optional(),
  disabled: z.boolean().optional(),
  action: ActionSchema.optional(),
  animation: AnimationSchema.optional(),
}).passthrough();
export const ButtonNode = z.object({ button: ButtonPropsSchema });
export type ButtonProps = z.infer<typeof ButtonPropsSchema>;

// 15. Input
export const ValidationSchema = z.object({
  required: z.boolean().optional(),
  pattern: z.string().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  errorMessage: z.string().optional(),
}).passthrough();
export type ValidationConfig = z.infer<typeof ValidationSchema>;

export const InputPropsSchema = z.object({
  label: z.string().optional(),
  placeholder: z.string().optional(),
  inputType: z.string().optional(),
  value: z.string().optional(),
  validation: ValidationSchema.optional(),
  animation: AnimationSchema.optional(),
}).passthrough();
export const InputNode = z.object({ input: InputPropsSchema });
export type InputProps = z.infer<typeof InputPropsSchema>;

// 16. Textarea
export const TextareaPropsSchema = z.object({
  label: z.string().optional(),
  placeholder: z.string().optional(),
  value: z.string().optional(),
  animation: AnimationSchema.optional(),
}).passthrough();
export const TextareaNode = z.object({ textarea: TextareaPropsSchema });
export type TextareaProps = z.infer<typeof TextareaPropsSchema>;

// 21. Switch
export const SwitchPropsSchema = z.object({
  label: z.string().optional(),
  value: z.boolean().optional().default(false),
  animation: AnimationSchema.optional(),
}).passthrough();
export const SwitchNode = z.object({ switch: SwitchPropsSchema });
export type SwitchProps = z.infer<typeof SwitchPropsSchema>;

// 22. Slider
export const SliderPropsSchema = z.object({
  label: z.string().optional(),
  min: z.number().optional().default(0),
  max: z.number().optional().default(100),
  value: z.number().optional().default(50),
  step: z.number().optional().default(1),
  animation: AnimationSchema.optional(),
}).passthrough();
export const SliderNode = z.object({ slider: SliderPropsSchema });
export type SliderProps = z.infer<typeof SliderPropsSchema>;

// 28. Calendar
export const CalendarPropsSchema = z.object({
  label: z.string().optional(),
  selectedDate: z.string().optional(),
  animation: AnimationSchema.optional(),
}).passthrough();
export const CalendarNode = z.object({ calendar: CalendarPropsSchema });
export type CalendarProps = z.infer<typeof CalendarPropsSchema>;
