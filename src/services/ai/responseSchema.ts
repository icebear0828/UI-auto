import { zodToJsonSchema } from 'zod-to-json-schema';
import { UINodeSchema } from '@/services/schemas';

let _cachedSchema: Record<string, unknown> | null = null;

export function getUINodeJsonSchema(): Record<string, unknown> {
  if (_cachedSchema) return _cachedSchema;

  const raw = zodToJsonSchema(UINodeSchema, {
    name: 'UINode',
    $refStrategy: 'none',
  }) as Record<string, unknown>;

  const defs = (raw.definitions ?? raw.$defs) as Record<string, Record<string, unknown>> | undefined;
  const inner = defs?.UINode ?? raw;

  const variants = (inner.anyOf ?? inner.oneOf) as Record<string, unknown>[] | undefined;
  if (variants) {
    const mergedProperties: Record<string, unknown> = {};
    for (const variant of variants) {
      const props = variant.properties as Record<string, unknown> | undefined;
      if (props) {
        for (const [key, val] of Object.entries(props)) {
          const propSchema = val as Record<string, unknown>;
          // Remove nested anyOf from children items (recursive refs become {})
          // and strip additionalProperties to keep schema clean
          mergedProperties[key] = cleanSchema(propSchema);
        }
      }
    }
    _cachedSchema = {
      type: 'object',
      properties: mergedProperties,
      additionalProperties: false,
    };
  } else {
    _cachedSchema = { type: 'object' };
  }

  return _cachedSchema;
}

const BANNED_KEYS = new Set(['additionalProperties', 'prefixItems', '$schema']);

function cleanSchema(schema: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(schema)) {
    if (BANNED_KEYS.has(k)) continue;
    if (Array.isArray(v)) {
      result[k] = v.map(item =>
        item && typeof item === 'object' && !Array.isArray(item)
          ? cleanSchema(item as Record<string, unknown>)
          : item
      );
    } else if (v && typeof v === 'object') {
      result[k] = cleanSchema(v as Record<string, unknown>);
    } else {
      result[k] = v;
    }
  }
  return result;
}
