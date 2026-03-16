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
// Template-based schema
// ============================================================

describe('SvgAnimationPropsSchema', () => {
  it('should parse tutorial_step template', () => {
    const result = SvgAnimationNode.safeParse({
      svg_animation: {
        template: 'tutorial_step',
        title: 'How Prompts Work',
        step: 'Step 1',
        character: { pose: 'point', label: 'User' },
        content: 'First, describe what you want the AI to do.',
        icon: 'lightbulb',
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.svg_animation.template).toBe('tutorial_step');
      expect(result.data.svg_animation.character?.pose).toBe('point');
    }
  });

  it('should parse comparison template', () => {
    const result = SvgAnimationNode.safeParse({
      svg_animation: {
        template: 'comparison',
        title: 'Good vs Bad Prompts',
        left: { title: 'Good', points: ['Be specific', 'Give context'] },
        right: { title: 'Bad', points: ['Too vague', 'No context'] },
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.svg_animation.left?.points).toHaveLength(2);
    }
  });

  it('should parse flowchart template', () => {
    const result = SvgAnimationNode.safeParse({
      svg_animation: {
        template: 'flowchart',
        title: 'AI Pipeline',
        steps: [
          { label: 'Input', description: 'User prompt' },
          { label: 'Process', description: 'LLM generates', icon: 'gear' },
          { label: 'Output', description: 'UI rendered', icon: 'check' },
        ],
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.svg_animation.steps).toHaveLength(3);
    }
  });

  it('should parse dialog_scene template', () => {
    const result = SvgAnimationNode.safeParse({
      svg_animation: {
        template: 'dialog_scene',
        characters: [
          { pose: 'wave', label: 'Alice', dialog: 'Hi!' },
          { pose: 'think', label: 'Bob', dialog: 'Hmm...' },
        ],
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.svg_animation.characters).toHaveLength(2);
    }
  });

  it('should parse highlight_concept template', () => {
    const result = SvgAnimationNode.safeParse({
      svg_animation: {
        template: 'highlight_concept',
        concept: 'Context is Key',
        description: 'Always provide background information.',
        icon: 'lightbulb',
        points: ['Who', 'What', 'Why'],
      },
    });
    expect(result.success).toBe(true);
  });

  it('should parse timeline template', () => {
    const result = SvgAnimationNode.safeParse({
      svg_animation: {
        template: 'timeline',
        title: 'Project History',
        events: [
          { label: '2024', description: 'Started' },
          { label: '2025', description: 'Launched', icon: 'check' },
        ],
      },
    });
    expect(result.success).toBe(true);
  });

  it('should fill defaults', () => {
    const result = SvgAnimationPropsSchema.safeParse({ template: 'tutorial_step' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sequence).toBe(true);
      expect(result.data.background).toBeUndefined();
    }
  });

  it('should reject invalid template name', () => {
    const result = SvgAnimationPropsSchema.safeParse({ template: 'nonexistent' });
    expect(result.success).toBe(false);
  });

  it('should tolerate extra fields via passthrough', () => {
    const result = SvgAnimationPropsSchema.safeParse({
      template: 'tutorial_step',
      unknownField: 'streaming',
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing template field', () => {
    const result = SvgAnimationPropsSchema.safeParse({
      title: 'No template',
    });
    expect(result.success).toBe(false);
  });
});
