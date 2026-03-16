import { describe, it, expect } from 'vitest';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  SvgAnimationNode,
  SvgAnimationPropsSchema,
} from '@/services/schemas/svg-animation';

// ============================================================
// JSON Schema compatibility (MUST pass — API rejects otherwise)
// ============================================================

describe('JSON Schema compatibility', () => {
  it('should not contain prefixItems (tuple schema)', () => {
    const jsonSchema = JSON.stringify(zodToJsonSchema(SvgAnimationPropsSchema, { $refStrategy: 'none' }));
    expect(jsonSchema).not.toContain('prefixItems');
  });

  it('should not contain allOf (intersection schema)', () => {
    const jsonSchema = JSON.stringify(zodToJsonSchema(SvgAnimationPropsSchema, { $refStrategy: 'none' }));
    expect(jsonSchema).not.toContain('"allOf"');
  });
});

// ============================================================
// New scene-orchestration schema (elements-based)
// ============================================================

describe('SvgAnimationPropsSchema — elements-based', () => {
  it('should parse a scene with elements array', () => {
    const result = SvgAnimationNode.safeParse({
      svg_animation: {
        title: 'How Prompts Work',
        elements: [
          { asset: 'stickman', pose: 'point', position: 'left', label: 'User' },
          { asset: 'speech_bubble', anchor: 'above-last', text: 'Write clearly!' },
          { asset: 'arrow', from: 'left', to: 'center', style: 'flow' },
          { asset: 'gear', position: 'center', animate: 'spin', label: 'AI Core' },
          { asset: 'arrow', from: 'center', to: 'right', style: 'flow' },
          { asset: 'check', position: 'right', label: 'Output' },
          { asset: 'speech_bubble', anchor: 'above-last', text: 'Perfect result!' },
        ],
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.svg_animation.elements).toHaveLength(7);
      expect(result.data.svg_animation.elements[0].asset).toBe('stickman');
    }
  });

  it('should default elements to empty array', () => {
    const result = SvgAnimationPropsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.elements).toEqual([]);
      expect(result.data.sequence).toBe(true);
    }
  });

  it('should accept size hints on elements', () => {
    const result = SvgAnimationPropsSchema.safeParse({
      elements: [
        { asset: 'gear', position: 'center', size: 'large' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('should tolerate extra fields via passthrough', () => {
    const result = SvgAnimationPropsSchema.safeParse({
      unknownField: 'streaming',
      elements: [{ asset: 'check', customProp: true }],
    });
    expect(result.success).toBe(true);
  });

  it('should reject element missing asset field', () => {
    const result = SvgAnimationPropsSchema.safeParse({
      elements: [{ position: 'left' }],
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================
// Raw SVG code mode
// ============================================================

describe('SvgAnimationPropsSchema — svg_code mode', () => {
  it('should parse svg_code string', () => {
    const result = SvgAnimationNode.safeParse({
      svg_animation: {
        title: 'What is an API?',
        svg_code: '<svg viewBox="0 0 1000 562"><rect width="1000" height="562" fill="#0f172a"/></svg>',
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.svg_animation.svg_code).toContain('<svg');
    }
  });

  it('should accept svg_code with no other fields', () => {
    const result = SvgAnimationPropsSchema.safeParse({
      svg_code: '<svg viewBox="0 0 1000 562"></svg>',
    });
    expect(result.success).toBe(true);
  });

  it('should accept svg_code alongside title', () => {
    const result = SvgAnimationPropsSchema.safeParse({
      title: 'My Scene',
      svg_code: '<svg></svg>',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('My Scene');
      expect(result.data.svg_code).toBe('<svg></svg>');
    }
  });
});

// ============================================================
// Backward compatibility — old template-based schema
// ============================================================

describe('SvgAnimationPropsSchema — backward compat (template)', () => {
  it('should still accept template field for old data', () => {
    const result = SvgAnimationNode.safeParse({
      svg_animation: {
        template: 'tutorial_step',
        title: 'Old scene',
        character: { pose: 'point', label: 'User' },
        content: 'Legacy content',
        step: 'Step 1',
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.svg_animation.template).toBe('tutorial_step');
    }
  });
});
