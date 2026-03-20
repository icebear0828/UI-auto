import { describe, it, expect } from 'vitest';
import { parsePartialJson } from '@/services/streamParser';

describe('streamParser', () => {
    describe('parsePartialJson', () => {
        describe('complete JSON', () => {
            it('should parse valid complete JSON', () => {
                const json = '{"name": "test", "value": 123}';
                const result = parsePartialJson(json);
                expect(result).toEqual({ name: 'test', value: 123 });
            });

            it('should return null for JSON arrays (only objects are valid UINodes)', () => {
                const json = '[1, 2, 3]';
                const result = parsePartialJson(json);
                expect(result).toBeNull();
            });

            it('should parse nested JSON', () => {
                const json = '{"outer": {"inner": {"deep": true}}}';
                const result = parsePartialJson(json);
                expect(result).toEqual({ outer: { inner: { deep: true } } });
            });
        });

        describe('incomplete JSON - unclosed braces', () => {
            it('should fix single unclosed object', () => {
                const json = '{"name": "test"';
                const result = parsePartialJson(json);
                expect(result).toEqual({ name: 'test' });
            });

            it('should fix nested unclosed objects', () => {
                const json = '{"outer": {"inner": "value"';
                const result = parsePartialJson(json);
                expect(result).toEqual({ outer: { inner: 'value' } });
            });

            it('should fix deeply nested unclosed objects', () => {
                const json = '{"a": {"b": {"c": {"d": "deep"';
                const result = parsePartialJson(json);
                expect(result).toEqual({ a: { b: { c: { d: 'deep' } } } });
            });
        });

        describe('incomplete JSON - unclosed arrays', () => {
            it('should return null for unclosed top-level array (only objects are valid UINodes)', () => {
                const json = '[1, 2, 3';
                const result = parsePartialJson(json);
                expect(result).toBeNull();
            });

            it('should fix nested array in object', () => {
                const json = '{"items": [1, 2, 3';
                const result = parsePartialJson(json);
                expect(result).toEqual({ items: [1, 2, 3] });
            });

            it('should fix mixed structures', () => {
                const json = '{"data": [{"id": 1}, {"id": 2';
                const result = parsePartialJson(json);
                expect(result).toEqual({ data: [{ id: 1 }, { id: 2 }] });
            });
        });

        describe('incomplete JSON - unclosed strings', () => {
            it('should fix unclosed string at end', () => {
                const json = '{"name": "incomplete string';
                const result = parsePartialJson(json);
                expect(result).toEqual({ name: 'incomplete string' });
            });

            it('should handle escaped quotes in strings', () => {
                const json = '{"text": "He said \\"hello\\""}';
                const result = parsePartialJson(json);
                expect(result).toEqual({ text: 'He said "hello"' });
            });

            it('should fix string with escaped quote at end', () => {
                const json = '{"text": "quote: \\"end';
                const result = parsePartialJson(json);
                expect(result).toEqual({ text: 'quote: "end' });
            });
        });

        describe('empty and null inputs', () => {
            it('should return null for empty string', () => {
                const result = parsePartialJson('');
                expect(result).toBeNull();
            });

            it('should return null for whitespace only', () => {
                const result = parsePartialJson('   ');
                expect(result).toBeNull();
            });

            it('should return null for completely invalid JSON', () => {
                const result = parsePartialJson('not json at all');
                expect(result).toBeNull();
            });
        });

        describe('UI component structures', () => {
            it('should parse partial container node', () => {
                const json = '{"container": {"layout": "COL", "children": [';
                const result = parsePartialJson(json);
                expect(result).toEqual({ container: { layout: 'COL', children: [] } });
            });

            it('should parse partial container with text child', () => {
                const json = '{"container": {"children": [{"text": {"content": "Hello"';
                const result = parsePartialJson(json);
                expect(result).toEqual({
                    container: {
                        children: [{ text: { content: 'Hello' } }]
                    }
                });
            });

            it('should parse partial button with action', () => {
                const json = '{"button": {"label": "Click", "action": {"type": "NAVIGATE"';
                const result = parsePartialJson(json);
                expect(result).toEqual({
                    button: {
                        label: 'Click',
                        action: { type: 'NAVIGATE' }
                    }
                });
            });

            it('should parse partial card with nested content', () => {
                const json = '{"card": {"title": "Stats", "children": [{"stat": {"label": "Revenue", "value": "$10k"';
                const result = parsePartialJson(json);
                expect(result).toEqual({
                    card: {
                        title: 'Stats',
                        children: [{ stat: { label: 'Revenue', value: '$10k' } }]
                    }
                });
            });
        });

        describe('complex streaming scenarios', () => {
            it('should handle animation properties mid-stream', () => {
                const json = '{"container": {"animation": {"type": "FADE_IN", "duration": "NORMAL"';
                const result = parsePartialJson(json);
                expect(result).toEqual({
                    container: {
                        animation: { type: 'FADE_IN', duration: 'NORMAL' }
                    }
                });
            });

            it('should handle multiple children mid-stream', () => {
                const json = '{"container": {"children": [{"text": {"content": "A"}}, {"text": {"content": "B"';
                const result = parsePartialJson(json);
                expect(result).toEqual({
                    container: {
                        children: [
                            { text: { content: 'A' } },
                            { text: { content: 'B' } }
                        ]
                    }
                });
            });

            it('should handle boolean values', () => {
                const json = '{"container": {"padding": true, "children": [';
                const result = parsePartialJson(json);
                expect(result).toEqual({ container: { padding: true, children: [] } });
            });

            it('should handle numeric values', () => {
                const json = '{"progress": {"value": 75, "label": "Loading"';
                const result = parsePartialJson(json);
                expect(result).toEqual({ progress: { value: 75, label: 'Loading' } });
            });
        });

        describe('special characters in strings', () => {
            it('should handle newlines in strings', () => {
                const json = '{"text": {"content": "Line 1\\nLine 2"}}';
                const result = parsePartialJson(json);
                expect(result).toEqual({ text: { content: 'Line 1\nLine 2' } });
            });

            it('should handle unicode characters', () => {
                const json = '{"text": {"content": "こんにちは"}}';
                const result = parsePartialJson(json);
                expect(result).toEqual({ text: { content: 'こんにちは' } });
            });

            it('should handle emoji', () => {
                const json = '{"button": {"label": "🚀 Launch"}}';
                const result = parsePartialJson(json);
                expect(result).toEqual({ button: { label: '🚀 Launch' } });
            });
        });
    });
});
