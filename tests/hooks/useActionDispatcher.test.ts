/**
 * useActionDispatcher Hook Test Suite
 *
 * Tests for the action dispatcher including:
 * - Navigation actions
 * - Toast notifications
 * - Modal operations
 * - State patching
 * - Form handling
 * - Effects (confetti, etc.)
 * - Sequence execution
 */

import { describe, it, expect, beforeEach, vi, afterEach, beforeAll, afterAll } from 'vitest';
import { renderHook, act, waitFor, cleanup } from '@testing-library/react';
import { useActionDispatcher } from '@/hooks/useActionDispatcher';
import type { Message, UIAction } from '@/types';
import {
    navigateAction,
    showToastAction,
    patchStateAction,
    sequenceAction,
    triggerEffectAction,
    copyToClipboardAction,
    downloadAction,
    openModalAction,
    closeModalAction,
    goBackAction,
    submitFormAction,
    containerWithChildren,
    assistantMessageWithUI
} from '../mocks/fixtures';

// Mock confetti
vi.mock('canvas-confetti', () => ({
    default: vi.fn()
}));

// Store original implementations
const originalClipboard = navigator.clipboard;
const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

// Mock clipboard API
const mockClipboard = {
    writeText: vi.fn().mockResolvedValue(undefined)
};

// Mock URL APIs
const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
const mockRevokeObjectURL = vi.fn();

beforeAll(() => {
    Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
        configurable: true
    });
    URL.createObjectURL = mockCreateObjectURL;
    URL.revokeObjectURL = mockRevokeObjectURL;
});

afterAll(() => {
    Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true
    });
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
});

describe('useActionDispatcher', () => {
    // Mock dependencies
    let messages: Message[];
    let setMessages: ReturnType<typeof vi.fn>;
    let showToast: ReturnType<typeof vi.fn>;
    let history: {
        undo: ReturnType<typeof vi.fn>;
        redo: ReturnType<typeof vi.fn>;
        canUndo: boolean;
        canRedo: boolean;
    };
    let modalActions: {
        openModal: ReturnType<typeof vi.fn>;
        closeModal: ReturnType<typeof vi.fn>;
    };
    let onFormSubmit: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        messages = [assistantMessageWithUI];
        setMessages = vi.fn((updater) => {
            if (typeof updater === 'function') {
                messages = updater(messages);
            } else {
                messages = updater;
            }
        });
        showToast = vi.fn();
        history = {
            undo: vi.fn(),
            redo: vi.fn(),
            canUndo: true,
            canRedo: false
        };
        modalActions = {
            openModal: vi.fn(),
            closeModal: vi.fn()
        };
        onFormSubmit = vi.fn().mockResolvedValue(undefined);

        // Reset mocks
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    const renderDispatcher = () => {
        return renderHook(() =>
            useActionDispatcher({
                messages,
                setMessages,
                showToast,
                history,
                modalActions,
                onFormSubmit
            })
        );
    };

    describe('NAVIGATE action', () => {
        it('should open URL in new tab', async () => {
            const mockOpen = vi.fn();
            vi.stubGlobal('open', mockOpen);

            const { result } = renderDispatcher();

            await act(async () => {
                await result.current(navigateAction);
            });

            expect(mockOpen).toHaveBeenCalledWith(
                'https://example.com',
                '_blank',
                'noopener,noreferrer'
            );

            vi.unstubAllGlobals();
        });

        it('should not open if url is missing', async () => {
            const mockOpen = vi.fn();
            vi.stubGlobal('open', mockOpen);

            const { result } = renderDispatcher();

            await act(async () => {
                await result.current({ type: 'NAVIGATE', payload: {} });
            });

            expect(mockOpen).not.toHaveBeenCalled();

            vi.unstubAllGlobals();
        });
    });

    describe('SHOW_TOAST action', () => {
        it('should call showToast with correct options', async () => {
            const { result } = renderDispatcher();

            await act(async () => {
                await result.current(showToastAction);
            });

            expect(showToast).toHaveBeenCalledWith({
                title: 'Success',
                type: 'SUCCESS',
                description: 'Operation completed'
            });
        });

        it('should use default type INFO if not specified', async () => {
            const { result } = renderDispatcher();

            await act(async () => {
                await result.current({
                    type: 'SHOW_TOAST',
                    payload: { title: 'Notice' }
                });
            });

            expect(showToast).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'INFO' })
            );
        });
    });

    describe('GO_BACK action', () => {
        it('should call history.undo when canUndo is true', async () => {
            const { result } = renderDispatcher();

            await act(async () => {
                await result.current(goBackAction);
            });

            expect(history.undo).toHaveBeenCalled();
        });

        it('should show toast when cannot go back', async () => {
            history.canUndo = false;
            const { result } = renderDispatcher();

            await act(async () => {
                await result.current(goBackAction);
            });

            expect(history.undo).not.toHaveBeenCalled();
            expect(showToast).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'INFO',
                    title: 'Start of History'
                })
            );
        });
    });

    describe('OPEN_MODAL action', () => {
        it('should call modalActions.openModal with content', async () => {
            const { result } = renderDispatcher();

            await act(async () => {
                await result.current(openModalAction);
            });

            expect(modalActions.openModal).toHaveBeenCalledWith({
                title: 'Modal Title',
                content: expect.any(Object)
            });
        });
    });

    describe('CLOSE_MODAL action', () => {
        it('should call modalActions.closeModal', async () => {
            const { result } = renderDispatcher();

            await act(async () => {
                await result.current(closeModalAction);
            });

            expect(modalActions.closeModal).toHaveBeenCalled();
        });
    });

    describe('COPY_TO_CLIPBOARD action', () => {
        it('should copy text to clipboard', async () => {
            const { result } = renderDispatcher();

            await act(async () => {
                await result.current(copyToClipboardAction);
            });

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Copied text');
            expect(showToast).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Copied to Clipboard',
                    type: 'SUCCESS'
                })
            );
        });

        it('should truncate long text in toast description', async () => {
            const longText = 'A'.repeat(50);
            const { result } = renderDispatcher();

            await act(async () => {
                await result.current({
                    type: 'COPY_TO_CLIPBOARD',
                    payload: { text: longText }
                });
            });

            expect(showToast).toHaveBeenCalledWith(
                expect.objectContaining({
                    description: expect.stringContaining('...')
                })
            );
        });
    });

    describe('DOWNLOAD action', () => {
        it('should create and trigger download', async () => {
            // Render first before mocking
            const { result } = renderDispatcher();

            // Create a real anchor element but spy on its click
            const realAnchor = document.createElement('a');
            const mockClick = vi.fn();
            realAnchor.click = mockClick;

            const originalCreateElement = document.createElement.bind(document);
            const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
                if (tagName === 'a') {
                    return realAnchor;
                }
                return originalCreateElement(tagName);
            });

            await act(async () => {
                await result.current(downloadAction);
            });

            expect(mockCreateObjectURL).toHaveBeenCalled();
            expect(mockClick).toHaveBeenCalled();
            expect(mockRevokeObjectURL).toHaveBeenCalled();
            expect(showToast).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Download Started',
                    type: 'SUCCESS'
                })
            );

            // Restore spy
            createElementSpy.mockRestore();
        });
    });

    describe('TRIGGER_EFFECT action', () => {
        it('should trigger confetti effect', async () => {
            const confetti = await import('canvas-confetti');
            const { result } = renderDispatcher();

            await act(async () => {
                await result.current(triggerEffectAction);
            });

            expect(confetti.default).toHaveBeenCalled();
        });

        it('should show warning for unknown effect', async () => {
            const { result } = renderDispatcher();

            await act(async () => {
                await result.current({
                    type: 'TRIGGER_EFFECT',
                    payload: { effect: 'UNKNOWN_EFFECT' }
                });
            });

            expect(showToast).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'WARNING',
                    title: 'Unknown Effect'
                })
            );
        });
    });

    describe('SEQUENCE action', () => {
        it('should execute actions in order', async () => {
            const callOrder: string[] = [];
            showToast.mockImplementation((opts) => {
                callOrder.push(opts.title);
            });

            const { result } = renderDispatcher();

            await act(async () => {
                await result.current(sequenceAction);
            });

            expect(callOrder).toEqual(['Step 1', 'Step 2']);
        });
    });

    describe('DELAY action', () => {
        it('should wait for specified duration', async () => {
            vi.useFakeTimers();
            const { result } = renderDispatcher();

            let resolved = false;
            act(() => {
                result.current({ type: 'DELAY', payload: { ms: 500 } }).then(() => {
                    resolved = true;
                });
            });

            expect(resolved).toBe(false);

            await act(async () => {
                vi.advanceTimersByTime(500);
            });

            expect(resolved).toBe(true);
            vi.useRealTimers();
        });

        it('should use default 500ms if not specified', async () => {
            vi.useFakeTimers();
            const { result } = renderDispatcher();

            let resolved = false;
            act(() => {
                result.current({ type: 'DELAY', payload: {} }).then(() => {
                    resolved = true;
                });
            });

            await act(async () => {
                vi.advanceTimersByTime(499);
            });
            expect(resolved).toBe(false);

            await act(async () => {
                vi.advanceTimersByTime(1);
            });
            expect(resolved).toBe(true);

            vi.useRealTimers();
        });
    });

    describe('PATCH_STATE action', () => {
        it('should call setMessages to update state', async () => {
            const { result } = renderDispatcher();

            await act(async () => {
                await result.current(patchStateAction);
            });

            expect(setMessages).toHaveBeenCalled();
        });
    });

    describe('RESET_FORM action', () => {
        it('should reset form and show toast', async () => {
            const { result } = renderDispatcher();

            await act(async () => {
                await result.current({ type: 'RESET_FORM' });
            });

            expect(setMessages).toHaveBeenCalled();
            expect(showToast).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'INFO',
                    title: 'Reset'
                })
            );
        });
    });

    describe('SUBMIT_FORM action', () => {
        it('should call onFormSubmit with collected data', async () => {
            const { result } = renderDispatcher();

            await act(async () => {
                await result.current(submitFormAction);
            });

            expect(onFormSubmit).toHaveBeenCalledWith(
                expect.objectContaining({ extra: 'data' })
            );
        });
    });

    describe('unknown action', () => {
        it('should log warning for unknown action type', async () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const { result } = renderDispatcher();

            await act(async () => {
                await result.current({ type: 'UNKNOWN_ACTION' });
            });

            // Logger formats with styled output, check first argument contains the message
            expect(consoleSpy).toHaveBeenCalled();
            const [logMessage] = consoleSpy.mock.calls[0];
            expect(logMessage).toContain('Unknown action type');

            consoleSpy.mockRestore();
        });
    });
});
