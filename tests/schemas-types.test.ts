/**
 * Type Safety Enhancement Tests
 *
 * Tests for the new type-safe UINode system and type utilities
 */

import { describe, it, expect } from 'vitest';
import {
  validateNode,
  isComponentType,
  getComponentProps,
  UINodeSchema,
  TypedUINode,
  ValidComponentType,
  ContainerPropsSchema,
  TextPropsSchema,
  ButtonPropsSchema,
} from '@/services/schemas';

describe('TypedUINode type system', () => {
  describe('validateNode', () => {
    it('should validate valid container node', () => {
      const node = {
        container: {
          layout: 'COL',
          padding: true,
          children: []
        }
      };

      const result = validateNode(node);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should validate valid text node', () => {
      const node = {
        text: {
          content: 'Hello World',
          variant: 'H1'
        }
      };

      const result = validateNode(node);
      expect(result.success).toBe(true);
    });

    it('should validate valid button node with action', () => {
      const node = {
        button: {
          label: 'Click Me',
          variant: 'PRIMARY',
          action: {
            type: 'NAVIGATE',
            payload: { url: 'https://example.com' }
          }
        }
      };

      const result = validateNode(node);
      expect(result.success).toBe(true);
    });

    it('should return error for null node', () => {
      const result = validateNode(null);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Node is null');
    });

    it('should return error for undefined node', () => {
      const result = validateNode(undefined);
      expect(result.success).toBe(false);
    });

    it('should validate nested children', () => {
      const node = {
        container: {
          layout: 'COL',
          children: [
            { text: { content: 'Child 1' } },
            { button: { label: 'Child 2' } }
          ]
        }
      };

      const result = validateNode(node);
      expect(result.success).toBe(true);
    });

    it('should validate complex nested structures', () => {
      const node = {
        card: {
          title: 'Dashboard',
          children: [
            {
              container: {
                layout: 'ROW',
                children: [
                  { stat: { label: 'Users', value: '1234' } },
                  { stat: { label: 'Revenue', value: '$5678' } }
                ]
              }
            }
          ]
        }
      };

      const result = validateNode(node);
      expect(result.success).toBe(true);
    });
  });

  describe('isComponentType type guard', () => {
    it('should correctly identify container type', () => {
      const node: TypedUINode = {
        container: { layout: 'COL', children: [] }
      };

      if (isComponentType(node, 'container')) {
        // TypeScript should infer node has container property here
        expect(node.container.layout).toBe('COL');
      } else {
        throw new Error('Should be container type');
      }
    });

    it('should correctly identify text type', () => {
      const node: TypedUINode = {
        text: { content: 'Hello' }
      };

      expect(isComponentType(node, 'text')).toBe(true);
      expect(isComponentType(node, 'button')).toBe(false);
    });

    it('should correctly identify button type', () => {
      const node: TypedUINode = {
        button: { label: 'Click' }
      };

      expect(isComponentType(node, 'button')).toBe(true);
      expect(isComponentType(node, 'container')).toBe(false);
    });
  });

  describe('getComponentProps', () => {
    it('should extract container props', () => {
      const node: TypedUINode = {
        container: { layout: 'ROW', padding: true, children: [] }
      };

      const props = getComponentProps(node, 'container');
      expect(props.layout).toBe('ROW');
      expect(props.padding).toBe(true);
    });

    it('should extract text props', () => {
      const node: TypedUINode = {
        text: { content: 'Test', variant: 'H2' }
      };

      const props = getComponentProps(node, 'text');
      expect(props.content).toBe('Test');
      expect(props.variant).toBe('H2');
    });
  });

  describe('Individual component schemas', () => {
    it('ContainerPropsSchema should validate correctly', () => {
      const valid = ContainerPropsSchema.safeParse({
        layout: 'COL',
        gap: 'MD',
        padding: true,
        children: []
      });
      expect(valid.success).toBe(true);
    });

    it('TextPropsSchema should have defaults', () => {
      const result = TextPropsSchema.parse({});
      expect(result.content).toBe(''); // default value
    });

    it('ButtonPropsSchema should validate action', () => {
      const result = ButtonPropsSchema.safeParse({
        label: 'Submit',
        action: {
          type: 'SUBMIT_FORM',
          payload: { formId: 'test' }
        }
      });
      expect(result.success).toBe(true);
    });
  });

  describe('UINodeSchema union validation', () => {
    const validNodes: Array<{ type: ValidComponentType; node: unknown }> = [
      { type: 'container', node: { container: { children: [] } } },
      { type: 'text', node: { text: { content: 'Hi' } } },
      { type: 'button', node: { button: { label: 'Click' } } },
      { type: 'card', node: { card: { children: [] } } },
      { type: 'stat', node: { stat: { label: 'Test', value: '123' } } },
      { type: 'progress', node: { progress: { value: 50 } } },
      { type: 'alert', node: { alert: { title: 'Warning' } } },
      { type: 'badge', node: { badge: { label: 'New' } } },
      { type: 'separator', node: { separator: {} } },
    ];

    validNodes.forEach(({ type, node }) => {
      it(`should validate ${type} node`, () => {
        const result = UINodeSchema.safeParse(node);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Animation schema integration', () => {
    it('should validate node with animation', () => {
      const node = {
        text: {
          content: 'Animated',
          animation: {
            type: 'FADE_IN',
            duration: 'NORMAL',
            trigger: 'ON_MOUNT'
          }
        }
      };

      const result = validateNode(node);
      expect(result.success).toBe(true);
    });

    it('should accept any animation type from enum', () => {
      const animationTypes = [
        'FADE_IN', 'FADE_IN_UP', 'SLIDE_FROM_LEFT', 'SCALE_IN',
        'TYPEWRITER', 'SCRAMBLE', 'BOUNCE', 'NONE'
      ];

      animationTypes.forEach(animType => {
        const node = {
          button: {
            label: 'Test',
            animation: { type: animType }
          }
        };
        const result = validateNode(node);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('VN Stage validation', () => {
    it('should validate vn_stage node', () => {
      const node = {
        vn_stage: {
          background: {
            source: 'EXTERNAL_URL',
            value: 'https://example.com/bg.jpg'
          },
          dialogue: {
            speaker: 'Alice',
            content: 'Hello!'
          },
          characters: [
            {
              id: 'char1',
              name: 'Alice',
              avatar: { source: 'GENERATED', value: 'anime girl' },
              position: 'CENTER',
              expression: 'SMILE'
            }
          ],
          choices: [
            {
              label: 'Continue',
              action: { type: 'NEXT_SCENE' }
            }
          ]
        }
      };

      const result = validateNode(node);
      expect(result.success).toBe(true);
    });
  });
});
