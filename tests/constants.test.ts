import { describe, it, expect } from 'vitest';
import { INITIAL_CONTEXT, COMPONENT_SPECS, SYSTEM_INSTRUCTION } from '@/constants';

describe('constants', () => {
    describe('INITIAL_CONTEXT', () => {
        it('should have default user context', () => {
            expect(INITIAL_CONTEXT).toBeDefined();
            expect(INITIAL_CONTEXT.role).toBe('user');
            expect(INITIAL_CONTEXT.device).toBe('mobile');
            expect(INITIAL_CONTEXT.theme).toBe('dark');
            expect(INITIAL_CONTEXT.mode).toBe('default');
        });
    });

    describe('COMPONENT_SPECS', () => {
        it('should define component specifications', () => {
            expect(COMPONENT_SPECS).toBeDefined();
            expect(typeof COMPONENT_SPECS).toBe('string');
            expect(COMPONENT_SPECS.length).toBeGreaterThan(1000);
        });

        it('should include container component', () => {
            expect(COMPONENT_SPECS).toContain('"container"');
        });

        it('should include all 30 component types', () => {
            const componentNames = [
                'container', 'hero', 'text', 'button', 'card',
                'table', 'stat', 'progress', 'alert', 'avatar',
                'chart', 'accordion', 'image', 'map', 'bento_container',
                'bento_card', 'kanban', 'input', 'switch', 'slider',
                'tabs', 'stepper', 'timeline', 'codeblock', 'textarea',
                'split_pane', 'calendar', 'vn_stage', 'badge', 'separator'
            ];

            componentNames.forEach(name => {
                expect(COMPONENT_SPECS).toContain(`"${name}"`);
            });
        });
    });

    describe('SYSTEM_INSTRUCTION', () => {
        it('should define system instruction', () => {
            expect(SYSTEM_INSTRUCTION).toBeDefined();
            expect(typeof SYSTEM_INSTRUCTION).toBe('string');
        });

        it('should include GenUI Architect role', () => {
            expect(SYSTEM_INSTRUCTION).toContain('GenUI Architect');
        });

        it('should include visual mandate', () => {
            expect(SYSTEM_INSTRUCTION).toContain('VISUAL MANDATE');
        });
    });
});
