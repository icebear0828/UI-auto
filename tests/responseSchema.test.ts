import { describe, it, expect } from 'vitest';
import { getUINodeJsonSchema } from '@/services/ai/responseSchema';

describe('getUINodeJsonSchema', () => {
  it('should not contain prefixItems anywhere in the output', () => {
    const schema = getUINodeJsonSchema();
    const str = JSON.stringify(schema);
    expect(str).not.toContain('prefixItems');
  });

  it('should not contain allOf anywhere in the output', () => {
    const schema = getUINodeJsonSchema();
    const str = JSON.stringify(schema);
    expect(str).not.toContain('"allOf"');
  });

  it('should have type "object" at root', () => {
    const schema = getUINodeJsonSchema();
    expect(schema.type).toBe('object');
  });

  it('should include svg_animation in properties', () => {
    const schema = getUINodeJsonSchema();
    const props = schema.properties as Record<string, unknown>;
    expect(props).toHaveProperty('svg_animation');
  });

  it('should dump full schema for inspection', () => {
    const schema = getUINodeJsonSchema();
    const str = JSON.stringify(schema, null, 2);
    // Find any array values that look like tuple schemas: [{"type":"number"},{"type":"number"}]
    const tuplePattern = /\[\s*\{\s*"type"\s*:\s*"number"\s*\}\s*,\s*\{\s*"type"\s*:\s*"number"\s*\}\s*\]/;
    expect(tuplePattern.test(str)).toBe(false);
  });
});
