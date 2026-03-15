import { describe, it, expect } from 'vitest';
import { UINodeSchema, validateNode } from '@/services/schemas';

describe('schemas', () => {
    describe('validateNode', () => {
        it('should return error for null node', () => {
            const result = validateNode(null);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Node is null');
        });

        it('should return error for undefined node', () => {
            const result = validateNode(undefined);
            expect(result.success).toBe(false);
        });
    });

    describe('ContainerNode', () => {
        it('should validate a basic container', () => {
            const node = {
                container: {
                    layout: 'COL',
                    padding: true,
                    children: []
                }
            };
            const result = validateNode(node);
            expect(result.success).toBe(true);
        });

        it('should validate container with nested children', () => {
            const node = {
                container: {
                    layout: 'ROW',
                    children: [
                        { text: { content: 'Hello' } },
                        { button: { label: 'Click me' } }
                    ]
                }
            };
            const result = validateNode(node);
            expect(result.success).toBe(true);
        });

        it('should validate container with animation', () => {
            const node = {
                container: {
                    layout: 'COL',
                    animation: {
                        type: 'FADE_IN',
                        duration: 'NORMAL',
                        trigger: 'ON_MOUNT'
                    },
                    children: []
                }
            };
            const result = validateNode(node);
            expect(result.success).toBe(true);
        });
    });

    describe('TextNode', () => {
        it('should validate text with content', () => {
            const node = { text: { content: 'Hello World' } };
            const result = validateNode(node);
            expect(result.success).toBe(true);
        });

        it('should validate text with variant and color', () => {
            const node = {
                text: {
                    content: 'Styled text',
                    variant: 'H1',
                    color: 'blue-500'
                }
            };
            const result = validateNode(node);
            expect(result.success).toBe(true);
        });
    });

    describe('ButtonNode', () => {
        it('should validate button with label', () => {
            const node = { button: { label: 'Submit' } };
            const result = validateNode(node);
            expect(result.success).toBe(true);
        });

        it('should validate button with action', () => {
            const node = {
                button: {
                    label: 'Navigate',
                    action: { type: 'NAVIGATE', path: '/home' }
                }
            };
            const result = validateNode(node);
            expect(result.success).toBe(true);
        });

        it('should validate disabled button', () => {
            const node = {
                button: {
                    label: 'Disabled',
                    disabled: true
                }
            };
            const result = validateNode(node);
            expect(result.success).toBe(true);
        });
    });

    describe('CardNode', () => {
        it('should validate card with title and children', () => {
            const node = {
                card: {
                    title: 'My Card',
                    children: [
                        { text: { content: 'Card content' } }
                    ]
                }
            };
            const result = validateNode(node);
            expect(result.success).toBe(true);
        });
    });

    describe('AlertNode', () => {
        it('should validate alert with all props', () => {
            const node = {
                alert: {
                    title: 'Warning',
                    description: 'Something went wrong',
                    variant: 'ERROR'
                }
            };
            const result = validateNode(node);
            expect(result.success).toBe(true);
        });
    });

    describe('StatNode', () => {
        it('should validate stat with trend', () => {
            const node = {
                stat: {
                    label: 'Revenue',
                    value: '$10,000',
                    trend: '+15%',
                    trendDirection: 'UP'
                }
            };
            const result = validateNode(node);
            expect(result.success).toBe(true);
        });
    });

    describe('ChartNode', () => {
        it('should validate chart with data', () => {
            const node = {
                chart: {
                    title: 'Sales',
                    type: 'BAR',
                    data: [
                        { name: 'Jan', value: 100 },
                        { name: 'Feb', value: 200 }
                    ]
                }
            };
            const result = validateNode(node);
            expect(result.success).toBe(true);
        });
    });

    describe('TableNode', () => {
        it('should validate table with headers and rows', () => {
            const node = {
                table: {
                    headers: ['Name', 'Age', 'City'],
                    rows: [
                        ['Alice', 30, 'NYC'],
                        ['Bob', 25, 'LA']
                    ]
                }
            };
            const result = validateNode(node);
            expect(result.success).toBe(true);
        });
    });

    describe('InputNode', () => {
        it('should validate input with validation', () => {
            const node = {
                input: {
                    label: 'Email',
                    placeholder: 'Enter email',
                    inputType: 'email',
                    validation: {
                        required: true,
                        pattern: '^[^@]+@[^@]+$',
                        errorMessage: 'Invalid email'
                    }
                }
            };
            const result = validateNode(node);
            expect(result.success).toBe(true);
        });
    });

    describe('TabsNode', () => {
        it('should validate tabs with items', () => {
            const node = {
                tabs: {
                    defaultValue: 'tab1',
                    variant: 'DEFAULT',
                    items: [
                        { id: 'tab1', label: 'First', content: [] },
                        { id: 'tab2', label: 'Second', content: [] }
                    ]
                }
            };
            const result = validateNode(node);
            expect(result.success).toBe(true);
        });
    });

    describe('TimelineNode', () => {
        it('should validate timeline with items', () => {
            const node = {
                timeline: {
                    items: [
                        { title: 'Step 1', status: 'COMPLETED', time: '10:00' },
                        { title: 'Step 2', status: 'ACTIVE' },
                        { title: 'Step 3', status: 'PENDING' }
                    ]
                }
            };
            const result = validateNode(node);
            expect(result.success).toBe(true);
        });
    });

    describe('KanbanNode', () => {
        it('should validate kanban with columns', () => {
            const node = {
                kanban: {
                    columns: [
                        { title: 'Todo', color: 'BLUE', items: ['Task 1', 'Task 2'] },
                        { title: 'Done', color: 'GREEN', items: [] }
                    ]
                }
            };
            const result = validateNode(node);
            expect(result.success).toBe(true);
        });
    });

    describe('VNStageNode', () => {
        it('should validate visual novel stage', () => {
            const node = {
                vn_stage: {
                    background: { source: 'EXTERNAL_URL', value: 'https://example.com/bg.jpg' },
                    dialogue: {
                        speaker: 'Narrator',
                        content: 'Welcome to the story...'
                    },
                    characters: [
                        {
                            id: 'char1',
                            name: 'Alice',
                            avatar: { source: 'EXTERNAL_URL', value: 'https://example.com/alice.png' },
                            position: 'LEFT',
                            expression: 'SMILE'
                        }
                    ]
                }
            };
            const result = validateNode(node);
            expect(result.success).toBe(true);
        });
    });

    describe('AnimationSchema', () => {
        it('should validate all animation types', () => {
            const animationTypes = [
                'FADE_IN', 'FADE_IN_UP', 'SLIDE_FROM_LEFT', 'SLIDE_FROM_RIGHT',
                'SCALE_IN', 'SCALE_ELASTIC', 'BLUR_IN', 'STAGGER_CONTAINER',
                'PULSE', 'SHIMMER', 'SHAKE', 'GLOW', 'BOUNCE',
                'TYPEWRITER', 'SCRAMBLE', 'GRADIENT_FLOW',
                'WIGGLE', 'POP', 'HOVER_GROW', 'NONE'
            ];

            animationTypes.forEach(type => {
                const node = {
                    container: {
                        animation: { type },
                        children: []
                    }
                };
                const result = validateNode(node);
                expect(result.success).toBe(true);
            });
        });

        it('should validate animation duration values', () => {
            const durations = ['FAST', 'NORMAL', 'SLOW'];
            durations.forEach(duration => {
                const node = {
                    button: {
                        label: 'Test',
                        animation: { type: 'FADE_IN', duration }
                    }
                };
                const result = validateNode(node);
                expect(result.success).toBe(true);
            });
        });

        it('should validate animation triggers', () => {
            const triggers = ['ON_MOUNT', 'ON_HOVER', 'ON_VIEW'];
            triggers.forEach(trigger => {
                const node = {
                    card: {
                        title: 'Test',
                        animation: { type: 'SCALE_IN', trigger },
                        children: []
                    }
                };
                const result = validateNode(node);
                expect(result.success).toBe(true);
            });
        });
    });

    describe('SeparatorNode', () => {
        it('should validate separator', () => {
            const node = { separator: {} };
            const result = validateNode(node);
            expect(result.success).toBe(true);
        });
    });

    describe('Edge cases', () => {
        it('should reject invalid component type', () => {
            const node = { invalid_type: { data: 'test' } };
            const result = validateNode(node);
            expect(result.success).toBe(false);
        });

        it('should handle deeply nested structures', () => {
            const node = {
                container: {
                    children: [
                        {
                            card: {
                                title: 'Level 1',
                                children: [
                                    {
                                        container: {
                                            children: [
                                                { text: { content: 'Deep nested' } }
                                            ]
                                        }
                                    }
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
});
