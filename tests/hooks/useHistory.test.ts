/**
 * useHistory Hook Test Suite
 *
 * Tests for the time-travel history management hook including:
 * - State management
 * - Undo/Redo functionality
 * - History limits
 * - Overwrite mode
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from '@/hooks/useHistory';

describe('useHistory', () => {
    describe('initialization', () => {
        it('should initialize with the provided initial state', () => {
            const { result } = renderHook(() => useHistory('initial'));
            expect(result.current.state).toBe('initial');
        });

        it('should initialize with complex objects', () => {
            const initialState = { count: 0, items: ['a', 'b'] };
            const { result } = renderHook(() => useHistory(initialState));
            expect(result.current.state).toEqual(initialState);
        });

        it('should not be able to undo initially', () => {
            const { result } = renderHook(() => useHistory('initial'));
            expect(result.current.canUndo).toBe(false);
        });

        it('should not be able to redo initially', () => {
            const { result } = renderHook(() => useHistory('initial'));
            expect(result.current.canRedo).toBe(false);
        });

        it('should expose history array with initial state', () => {
            const { result } = renderHook(() => useHistory('initial'));
            expect(result.current.history).toEqual(['initial']);
        });
    });

    describe('setState', () => {
        it('should update state with direct value', () => {
            const { result } = renderHook(() => useHistory('initial'));

            act(() => {
                result.current.setState('updated');
            });

            expect(result.current.state).toBe('updated');
        });

        it('should update state with callback function', () => {
            const { result } = renderHook(() => useHistory(0));

            act(() => {
                result.current.setState(prev => prev + 1);
            });

            expect(result.current.state).toBe(1);
        });

        it('should enable undo after state change', () => {
            const { result } = renderHook(() => useHistory('initial'));

            act(() => {
                result.current.setState('updated');
            });

            expect(result.current.canUndo).toBe(true);
        });

        it('should add to history timeline', () => {
            const { result } = renderHook(() => useHistory('initial'));

            act(() => {
                result.current.setState('second');
                result.current.setState('third');
            });

            expect(result.current.history).toEqual(['initial', 'second', 'third']);
        });
    });

    describe('undo', () => {
        it('should revert to previous state', () => {
            const { result } = renderHook(() => useHistory('initial'));

            act(() => {
                result.current.setState('updated');
            });

            act(() => {
                result.current.undo();
            });

            expect(result.current.state).toBe('initial');
        });

        it('should enable redo after undo', () => {
            const { result } = renderHook(() => useHistory('initial'));

            act(() => {
                result.current.setState('updated');
            });

            act(() => {
                result.current.undo();
            });

            expect(result.current.canRedo).toBe(true);
        });

        it('should disable undo at the beginning of history', () => {
            const { result } = renderHook(() => useHistory('initial'));

            act(() => {
                result.current.setState('updated');
            });

            act(() => {
                result.current.undo();
            });

            expect(result.current.canUndo).toBe(false);
        });

        it('should handle multiple undos', () => {
            const { result } = renderHook(() => useHistory('first'));

            act(() => {
                result.current.setState('second');
                result.current.setState('third');
            });

            act(() => {
                result.current.undo();
            });
            expect(result.current.state).toBe('second');

            act(() => {
                result.current.undo();
            });
            expect(result.current.state).toBe('first');
        });

        it('should not go below index 0', () => {
            const { result } = renderHook(() => useHistory('initial'));

            // Try to undo without any changes
            act(() => {
                result.current.undo();
                result.current.undo();
                result.current.undo();
            });

            expect(result.current.state).toBe('initial');
        });
    });

    describe('redo', () => {
        it('should restore undone state', () => {
            const { result } = renderHook(() => useHistory('initial'));

            act(() => {
                result.current.setState('updated');
            });

            act(() => {
                result.current.undo();
            });

            act(() => {
                result.current.redo();
            });

            expect(result.current.state).toBe('updated');
        });

        it('should disable redo after redo to latest', () => {
            const { result } = renderHook(() => useHistory('initial'));

            act(() => {
                result.current.setState('updated');
            });

            act(() => {
                result.current.undo();
            });

            act(() => {
                result.current.redo();
            });

            expect(result.current.canRedo).toBe(false);
        });

        it('should handle multiple redos', () => {
            const { result } = renderHook(() => useHistory('first'));

            act(() => {
                result.current.setState('second');
                result.current.setState('third');
            });

            act(() => {
                result.current.undo();
                result.current.undo();
            });

            act(() => {
                result.current.redo();
            });
            expect(result.current.state).toBe('second');

            act(() => {
                result.current.redo();
            });
            expect(result.current.state).toBe('third');
        });
    });

    describe('branching history', () => {
        it('should discard future states when new state is set after undo', () => {
            const { result } = renderHook(() => useHistory('first'));

            act(() => {
                result.current.setState('second');
                result.current.setState('third');
            });

            act(() => {
                result.current.undo();
            });

            act(() => {
                result.current.setState('branch');
            });

            expect(result.current.history).toEqual(['first', 'second', 'branch']);
            expect(result.current.canRedo).toBe(false);
        });
    });

    describe('overwrite mode', () => {
        it('should overwrite current state without adding to history', () => {
            const { result } = renderHook(() => useHistory('initial'));

            act(() => {
                result.current.setState('updated', true);
            });

            expect(result.current.state).toBe('updated');
            expect(result.current.history).toEqual(['updated']);
            expect(result.current.canUndo).toBe(false);
        });

        it('should work for streaming updates', () => {
            const { result } = renderHook(() => useHistory({ text: '' }));

            // Simulate streaming chunks
            act(() => {
                result.current.setState({ text: 'H' }, true);
            });
            act(() => {
                result.current.setState({ text: 'He' }, true);
            });
            act(() => {
                result.current.setState({ text: 'Hel' }, true);
            });
            act(() => {
                result.current.setState({ text: 'Hell' }, true);
            });
            act(() => {
                result.current.setState({ text: 'Hello' }, true);
            });

            expect(result.current.state).toEqual({ text: 'Hello' });
            expect(result.current.history.length).toBe(1);
        });
    });

    describe('history limits', () => {
        it('should limit history to MAX_HISTORY (50) entries', () => {
            const { result } = renderHook(() => useHistory(0));

            // Add 60 entries
            act(() => {
                for (let i = 1; i <= 60; i++) {
                    result.current.setState(i);
                }
            });

            // Should only keep last 50
            expect(result.current.history.length).toBe(50);
            // First entry should be 11 (0-10 shifted out)
            expect(result.current.history[0]).toBe(11);
            // Last entry should be 60
            expect(result.current.history[49]).toBe(60);
        });

        it('should maintain correct index after shifting', () => {
            const { result } = renderHook(() => useHistory(0));

            act(() => {
                for (let i = 1; i <= 55; i++) {
                    result.current.setState(i);
                }
            });

            // Current state should be 55
            expect(result.current.state).toBe(55);
            // Should be able to undo
            expect(result.current.canUndo).toBe(true);
        });
    });

    describe('edge cases', () => {
        it('should handle array state updates', () => {
            const { result } = renderHook(() => useHistory<number[]>([]));

            act(() => {
                result.current.setState([1]);
            });

            act(() => {
                result.current.setState(prev => [...prev, 2]);
            });

            expect(result.current.state).toEqual([1, 2]);
        });

        it('should store undefined in timeline but fallback to initial on read', () => {
            // NOTE: This tests the current behavior where ?? operator
            // causes null/undefined to fallback to initialState
            const { result } = renderHook(() => useHistory<string | undefined>('initial'));

            act(() => {
                result.current.setState(() => undefined);
            });

            // Due to ?? operator in state retrieval, undefined falls back to initial
            // This is a known limitation of the current implementation
            expect(result.current.state).toBe('initial');

            // But timeline should have the entry
            expect(result.current.history.length).toBe(2);
        });

        it('should store null in timeline but fallback to initial on read', () => {
            // NOTE: This tests the current behavior where ?? operator
            // causes null/undefined to fallback to initialState
            const { result } = renderHook(() => useHistory<string | null>('initial'));

            act(() => {
                result.current.setState(() => null);
            });

            // Due to ?? operator in state retrieval, null falls back to initial
            // This is a known limitation of the current implementation
            expect(result.current.state).toBe('initial');

            // But timeline should have the entry
            expect(result.current.history.length).toBe(2);
        });

        it('should handle empty string values correctly', () => {
            const { result } = renderHook(() => useHistory<string>('initial'));

            act(() => {
                result.current.setState('');
            });

            // Empty string is falsy but not nullish, so it should work
            expect(result.current.state).toBe('');

            act(() => {
                result.current.undo();
            });

            expect(result.current.state).toBe('initial');
        });
    });
});
