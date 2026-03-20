import { z } from "zod";
import type { TypedUINode, ValidComponentType } from "./index";

// ----------------------------------------------------------------------
// EXPORTED VALIDATOR
// ----------------------------------------------------------------------

export interface ValidationResult<T = TypedUINode> {
  success: boolean;
  data?: T;
  error?: string | z.ZodError;
}

export const validateNode = (node: unknown, UINodeSchema: z.ZodType<Record<string, unknown>>): ValidationResult => {
  if (!node) return { success: false, error: "Node is null" };

  const result = UINodeSchema.safeParse(node);

  if (result.success) {
    return { success: true, data: result.data as TypedUINode };
  } else {
    return { success: false, error: result.error };
  }
};

/**
 * Type guard to check if a node is a specific component type
 */
export function isComponentType<T extends ValidComponentType>(
  node: TypedUINode,
  type: T
): node is Extract<TypedUINode, { [K in T]: unknown }> {
  return type in node;
}

/**
 * Map each component type to its props type
 */
type ComponentPropsMap = {
  [K in ValidComponentType]: Extract<TypedUINode, Record<K, unknown>> extends Record<K, infer P> ? P : never;
};

/**
 * Get component props from a typed node
 */
export function getComponentProps<T extends ValidComponentType>(
  node: TypedUINode,
  type: T
): ComponentPropsMap[T] {
  return (node as Record<string, unknown>)[type] as ComponentPropsMap[T];
}
