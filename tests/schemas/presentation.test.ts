import { describe, it, expect } from 'vitest';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  PresentationNode,
  PresentationPropsSchema,
} from '@/services/schemas/presentation';

// ============================================================
// JSON Schema compatibility (MUST pass — API rejects otherwise)
// ============================================================

describe('JSON Schema compatibility', () => {
  it('should not contain prefixItems (tuple schema)', () => {
    const jsonSchema = JSON.stringify(zodToJsonSchema(PresentationPropsSchema, { $refStrategy: 'none' }));
    expect(jsonSchema).not.toContain('prefixItems');
  });

  it('should not contain allOf (intersection schema)', () => {
    const jsonSchema = JSON.stringify(zodToJsonSchema(PresentationPropsSchema, { $refStrategy: 'none' }));
    expect(jsonSchema).not.toContain('"allOf"');
  });
});

// ============================================================
// Presentation schema
// ============================================================

describe('PresentationPropsSchema', () => {
  it('should parse a presentation with multiple slides', () => {
    const result = PresentationNode.safeParse({
      presentation: {
        title: 'Microservices 101',
        slides: [
          { title: 'What are Microservices?', svg_code: '<svg viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#0a0f1a"/></svg>' },
          { title: 'Benefits', svg_code: '<svg viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#0a1628"/></svg>' },
          { title: 'Challenges', svg_code: '<svg viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#1a0a0a"/></svg>' },
        ],
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.presentation.slides).toHaveLength(3);
      expect(result.data.presentation.slides[0].title).toBe('What are Microservices?');
      expect(result.data.presentation.slides[0].svg_code).toContain('<svg');
    }
  });

  it('should accept empty slides array', () => {
    const result = PresentationPropsSchema.safeParse({
      title: 'Empty Deck',
      slides: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slides).toEqual([]);
    }
  });

  it('should default slides to empty array', () => {
    const result = PresentationPropsSchema.safeParse({
      title: 'No slides',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slides).toEqual([]);
    }
  });

  it('should accept slide with only svg_code (no title)', () => {
    const result = PresentationPropsSchema.safeParse({
      slides: [{ svg_code: '<svg></svg>' }],
    });
    expect(result.success).toBe(true);
  });

  it('should reject slide missing svg_code', () => {
    const result = PresentationPropsSchema.safeParse({
      slides: [{ title: 'No SVG' }],
    });
    expect(result.success).toBe(false);
  });

  it('should tolerate extra fields via passthrough', () => {
    const result = PresentationPropsSchema.safeParse({
      title: 'Deck',
      slides: [{ svg_code: '<svg></svg>', notes: 'speaker notes' }],
      customField: true,
    });
    expect(result.success).toBe(true);
  });

  it('should accept slide with notes field', () => {
    const result = PresentationPropsSchema.safeParse({
      slides: [
        { title: 'Slide 1', svg_code: '<svg></svg>', notes: 'Talk about X' },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slides[0].notes).toBe('Talk about X');
    }
  });
});
