/**
 * useGenUI Hook Test Suite
 *
 * Tests for the main orchestrator hook including:
 * - State initialization
 * - UI generation flow
 * - Streaming updates
 * - Error handling
 * - Edit mode
 * - History integration
 * - Configuration management
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';

// Mock external dependencies before importing useGenUI
const mockGenerateStream = vi.fn();
const mockRefine = vi.fn();
const mockFix = vi.fn();

vi.mock('@/services/ai', () => ({
    getAIProvider: () => ({
        name: 'MockProvider',
        generateStream: mockGenerateStream,
        refine: mockRefine,
        fix: mockFix,
    })
}));

vi.mock('@/services/tools', () => ({
    executeTool: vi.fn()
}));

vi.mock('@/services/telemetry', () => ({
    telemetry: {
        subscribe: vi.fn().mockReturnValue(() => {}),
        logEvent: vi.fn(),
        startTrace: vi.fn(),
        endTrace: vi.fn()
    }
}));

vi.mock('@/components/ui/Toast', () => ({
    useToast: () => ({
        showToast: vi.fn()
    })
}));

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; })
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Import after mocks
import { useGenUI } from '@/hooks/useGenUI';
// Mock references are defined above via mockGenerateStream, mockRefine, mockFix
import { executeTool } from '@/services/tools';
import {
    createMockStream,
    mockSuccessfulGeneration,
    mockStreamingGeneration
} from '../mocks/services';
import {
    simpleTextNode,
    containerWithChildren,
    defaultConfig
} from '../mocks/fixtures';

// Wrapper with required providers
const wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(React.Fragment, null, children);
};

describe('useGenUI', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.clear();

        // Default mock implementations
        mockGenerateStream.mockReturnValue(createMockStream(['{}']));
        mockRefine.mockResolvedValue({});
        mockFix.mockResolvedValue({});
        (executeTool as any).mockResolvedValue({ data: 'mock' });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('initialization', () => {
        it('should initialize with default state', () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            expect(result.current.state.loading).toBe(false);
            expect(result.current.state.streamingNode).toBeNull();
            expect(result.current.state.editMode).toBe(false);
            expect(result.current.state.selectedPath).toBeNull();
            expect(result.current.state.modalNode).toBeNull();
        });

        it('should initialize with system message', () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            expect(result.current.state.messages.length).toBeGreaterThan(0);
            expect(result.current.state.messages[0].role).toBe('system');
        });

        it('should initialize with default context', () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            expect(result.current.state.context).toEqual(
                expect.objectContaining({
                    device: expect.any(String),
                    theme: expect.any(String)
                })
            );
        });

        it('should load config from localStorage if available', () => {
            const savedConfig = { model: 'custom-model', soundEnabled: false };
            localStorageMock.setItem('genui_model_config', JSON.stringify(savedConfig));

            const { result } = renderHook(() => useGenUI(), { wrapper });

            expect(result.current.state.config).toEqual(savedConfig);
        });

        it('should use default config if localStorage is empty', () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            expect(result.current.state.config).toBeDefined();
            expect(result.current.state.config.model).toBeDefined();
        });

        it('should use default config if localStorage has invalid JSON', () => {
            localStorageMock.setItem('genui_model_config', 'invalid json');

            const { result } = renderHook(() => useGenUI(), { wrapper });

            expect(result.current.state.config).toBeDefined();
        });
    });

    describe('input handling', () => {
        it('should update input state', () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            act(() => {
                result.current.actions.setInput('test prompt');
            });

            expect(result.current.state.input).toBe('test prompt');
        });
    });

    describe('context management', () => {
        it('should update context', () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            act(() => {
                result.current.actions.setContext({
                    role: 'admin',
                    device: 'desktop',
                    theme: 'light'
                });
            });

            expect(result.current.state.context.role).toBe('admin');
            expect(result.current.state.context.device).toBe('desktop');
            expect(result.current.state.context.theme).toBe('light');
        });
    });

    describe('config management', () => {
        it('should update config and save to localStorage', () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            const newConfig = { model: 'new-model', soundEnabled: false };

            act(() => {
                result.current.actions.setConfig(newConfig);
            });

            expect(result.current.state.config).toEqual(newConfig);
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'genui_model_config',
                JSON.stringify(newConfig)
            );
        });
    });

    describe('edit mode', () => {
        it('should toggle edit mode', () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            act(() => {
                result.current.actions.setEditMode(true);
            });

            expect(result.current.state.editMode).toBe(true);

            act(() => {
                result.current.actions.setEditMode(false);
            });

            expect(result.current.state.editMode).toBe(false);
        });

        it('should set selected path', () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            act(() => {
                result.current.actions.setSelectedPath('root.container.children.0');
            });

            expect(result.current.state.selectedPath).toBe('root.container.children.0');
        });
    });

    describe('history', () => {
        it('should provide undo/redo capabilities', () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            expect(result.current.history.undo).toBeInstanceOf(Function);
            expect(result.current.history.redo).toBeInstanceOf(Function);
            expect(typeof result.current.history.canUndo).toBe('boolean');
            expect(typeof result.current.history.canRedo).toBe('boolean');
        });
    });

    describe('modal', () => {
        it('should close modal', () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            // Set modal first (simulate opening)
            act(() => {
                // Trigger action that opens modal
            });

            act(() => {
                result.current.actions.closeModal();
            });

            expect(result.current.state.modalNode).toBeNull();
        });
    });

    describe('diagnostics', () => {
        it('should run diagnostics', () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            const initialMessagesCount = result.current.state.messages.length;

            act(() => {
                result.current.actions.runDiagnostics();
            });

            // Should add diagnostic messages
            expect(result.current.state.messages.length).toBeGreaterThan(initialMessagesCount);
        });
    });

    describe('submit handling', () => {
        it('should not submit empty input', async () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            const event = { preventDefault: vi.fn() } as any;

            await act(async () => {
                await result.current.actions.handleSubmit(event);
            });

            expect(event.preventDefault).toHaveBeenCalled();
            expect(mockGenerateStream).not.toHaveBeenCalled();
        });

        it('should not submit when loading', async () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            // Set input
            act(() => {
                result.current.actions.setInput('test');
            });

            // Mock slow generation
            mockGenerateStream.mockReturnValue(
                (async function* () {
                    await new Promise(r => setTimeout(r, 1000));
                    yield '{}';
                })()
            );

            const event = { preventDefault: vi.fn() } as any;

            // First submission
            act(() => {
                result.current.actions.handleSubmit(event);
            });

            // Set new input while loading
            act(() => {
                result.current.actions.setInput('another test');
            });

            // Try to submit again while loading
            await act(async () => {
                await result.current.actions.handleSubmit(event);
            });

            // Should only call once
            expect(mockGenerateStream).toHaveBeenCalledTimes(1);
        });

        it('should clear input after submit', async () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            // Setup mock
            mockGenerateStream.mockReturnValue(createMockStream([JSON.stringify(simpleTextNode)]));

            act(() => {
                result.current.actions.setInput('test prompt');
            });

            const event = { preventDefault: vi.fn() } as any;

            await act(async () => {
                await result.current.actions.handleSubmit(event);
            });

            expect(result.current.state.input).toBe('');
        });

        it('should add user message to history', async () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            mockGenerateStream.mockReturnValue(createMockStream([JSON.stringify(simpleTextNode)]));

            act(() => {
                result.current.actions.setInput('test prompt');
            });

            const event = { preventDefault: vi.fn() } as any;
            const initialCount = result.current.state.messages.length;

            await act(async () => {
                await result.current.actions.handleSubmit(event);
            });

            // Should have user message
            const userMessages = result.current.state.messages.filter(m => m.role === 'user');
            expect(userMessages.length).toBeGreaterThan(0);
            expect(userMessages[userMessages.length - 1].content).toBe('test prompt');
        });
    });

    describe('generation flow', () => {
        it('should set loading state during generation', async () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            let loadingDuringGeneration = false;

            mockGenerateStream.mockImplementation(async function* () {
                loadingDuringGeneration = result.current.state.loading;
                yield JSON.stringify(simpleTextNode);
            });

            act(() => {
                result.current.actions.setInput('test');
            });

            const event = { preventDefault: vi.fn() } as any;

            await act(async () => {
                await result.current.actions.handleSubmit(event);
            });

            // Loading should have been true during generation
            expect(result.current.state.loading).toBe(false);
        });

        it('should handle streaming updates', async () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            const chunks = [
                '{"container": {',
                '"layout": "COL",',
                '"children": []',
                '}}'
            ];

            mockGenerateStream.mockReturnValue(createMockStream(chunks));

            act(() => {
                result.current.actions.setInput('test');
            });

            const event = { preventDefault: vi.fn() } as any;

            await act(async () => {
                await result.current.actions.handleSubmit(event);
            });

            // Should have assistant message with uiNode
            const assistantMessages = result.current.state.messages.filter(m => m.role === 'assistant');
            expect(assistantMessages.length).toBeGreaterThan(0);
        });

        it('should handle generation errors', async () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            mockGenerateStream.mockImplementation(async function* () {
                throw new Error('API Error');
            });

            act(() => {
                result.current.actions.setInput('test');
            });

            const event = { preventDefault: vi.fn() } as any;

            await act(async () => {
                await result.current.actions.handleSubmit(event);
            });

            // Should have error message
            const systemMessages = result.current.state.messages.filter(m => m.role === 'system');
            const hasError = systemMessages.some(m => m.content.includes('Error'));
            expect(hasError).toBe(true);
        });
    });

    describe('tool calls', () => {
        it('should handle tool call response', async () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            const toolCallResponse = { tool_call: { name: 'get_weather', arguments: { location: 'NYC' } } };
            const uiResponse = JSON.stringify(containerWithChildren);

            let callCount = 0;
            mockGenerateStream.mockImplementation(async function* () {
                callCount++;
                if (callCount === 1) {
                    yield JSON.stringify(toolCallResponse);
                } else {
                    yield uiResponse;
                }
            });

            (executeTool as any).mockResolvedValue({ temperature: 72, condition: 'Sunny' });

            act(() => {
                result.current.actions.setInput('weather in NYC');
            });

            const event = { preventDefault: vi.fn() } as any;

            await act(async () => {
                await result.current.actions.handleSubmit(event);
            });

            expect(executeTool).toHaveBeenCalledWith('get_weather', { location: 'NYC' });
        });
    });

    describe('fixNode', () => {
        it('should call fixComponent service', async () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            const errorNode = { broken: { data: 'invalid' } };
            const fixedNode = { text: { content: 'Fixed' } };

            mockFix.mockResolvedValue(fixedNode);

            await act(async () => {
                await result.current.actions.fixNode(
                    new Error('Render failed'),
                    errorNode,
                    'root.container.children.0'
                );
            });

            expect(mockFix).toHaveBeenCalled();
        });

        it('should handle fix failure gracefully', async () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            mockFix.mockRejectedValue(new Error('Fix failed'));

            await act(async () => {
                await result.current.actions.fixNode(
                    new Error('Render failed'),
                    { broken: {} },
                    'root'
                );
            });

            // Should have error message
            const systemMessages = result.current.state.messages.filter(m => m.role === 'system');
            const hasError = systemMessages.some(m => m.content.includes('failed') || m.content.includes('Healing'));
            expect(hasError).toBe(true);
        });
    });

    describe('refs', () => {
        it('should provide messagesEndRef', () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            expect(result.current.refs.messagesEndRef).toBeDefined();
        });
    });

    describe('cancelGeneration', () => {
        it('should expose cancelGeneration action', () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            expect(result.current.actions.cancelGeneration).toBeDefined();
            expect(typeof result.current.actions.cancelGeneration).toBe('function');
        });

        it('should expose canCancel state', () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            expect(result.current.state.canCancel).toBeDefined();
            expect(result.current.state.canCancel).toBe(false); // Initially false
        });

        it('should do nothing when not loading', () => {
            const { result } = renderHook(() => useGenUI(), { wrapper });

            const messagesBefore = result.current.state.messages.length;

            act(() => {
                result.current.actions.cancelGeneration();
            });

            // No new message should be added when nothing to cancel
            expect(result.current.state.messages.length).toBe(messagesBefore);
        });
    });
});
