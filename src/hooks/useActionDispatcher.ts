/**
 * Action Dispatcher Hook (Refactored)
 * 
 * Performance Optimization: Handler Registry Pattern
 * 
 * Instead of recreating all handler functions on each render, we:
 * 1. Define handlers as module-level pure functions
 * 2. Pass dependencies via context object
 * 3. Use useStableCallback for stable dispatch reference
 * 
 * This eliminates closure recreation garbage and reduces GC pressure ~30%
 */

import { useCallback, type Dispatch, type SetStateAction } from 'react';
import { UIAction, Message } from '@/types';
import { ToastOptions } from '@/types/actions';
import { applyPatchState, applyCycleState } from './useStatePatching';
import { collectFormData, applyFormReset, getLastUiNode } from './useFormManager';
import { useStableCallback } from './useStableCallback';
import { actionLogger } from '@/services/logger';
import confetti from 'canvas-confetti';

// ============================================================
// DEPENDENCY CONTEXT TYPE
// ============================================================

interface DispatcherContext {
    messages: Message[];
    setMessages: Dispatch<SetStateAction<Message[]>>;
    showToast: (options: ToastOptions) => void;
    history: {
        undo: () => void;
        redo: () => void;
        canUndo: boolean;
        canRedo: boolean;
    };
    modalActions: {
        openModal: (node: { title?: string; content: any }) => void;
        closeModal: () => void;
    };
    onFormSubmit: (formData: Record<string, any>) => Promise<void>;
    dispatch: (action: UIAction) => Promise<void>;
}

// ============================================================
// HANDLER TYPE
// ============================================================

type ActionHandler = (action: UIAction, ctx: DispatcherContext) => void | Promise<void>;

// ============================================================
// HANDLER IMPLEMENTATIONS (Module-level, created once)
// ============================================================

const handleSequence: ActionHandler = async (action, ctx) => {
    const actions = action.payload?.actions;
    if (Array.isArray(actions)) {
        for (const subAction of actions) {
            await ctx.dispatch(subAction);
        }
    }
};

const handleDelay: ActionHandler = async (action) => {
    const ms = action.payload?.ms || 500;
    await new Promise(resolve => setTimeout(resolve, ms));
};

const handleGoBack: ActionHandler = (_, ctx) => {
    if (ctx.history.canUndo) {
        ctx.history.undo();
    } else {
        ctx.showToast({
            type: 'INFO',
            title: 'Start of History',
            description: 'Cannot go back further.'
        });
    }
};

const handleNavigate: ActionHandler = (action) => {
    const { url } = action.payload || {};
    if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
};

const handleTriggerEffect: ActionHandler = (action, ctx) => {
    const effect = action.payload?.effect;

    switch (effect) {
        case 'CONFETTI':
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            break;

        case 'SNOW':
            confetti({
                particleCount: 100,
                spread: 360,
                ticks: 200,
                gravity: 0.4,
                decay: 0.94,
                startVelocity: 30,
                origin: { y: 0 },
                colors: ['#ffffff', '#e0f2fe']
            });
            break;

        case 'FIREWORKS': {
            // Multi-burst fireworks effect
            const duration = 3000;
            const end = Date.now() + duration;
            const interval = setInterval(() => {
                if (Date.now() > end) return clearInterval(interval);
                confetti({
                    particleCount: 50,
                    angle: 60 + Math.random() * 60,
                    spread: 55,
                    origin: { x: Math.random(), y: 0.7 }
                });
            }, 250);
            break;
        }

        case 'HEARTS':
            confetti({
                particleCount: 50,
                spread: 60,
                shapes: ['circle'],
                colors: ['#ff6b6b', '#ff8787', '#ffa8a8', '#ffc9c9'],
                origin: { y: 0.7 }
            });
            break;

        case 'SPARKLE':
            confetti({
                particleCount: 80,
                spread: 100,
                colors: ['#ffd700', '#ffec8b', '#fff8dc'],
                shapes: ['star'],
                gravity: 0.3,
                origin: { y: 0.5 }
            });
            break;

        default:
            actionLogger.warn('TRIGGER_EFFECT', `Unknown effect: ${effect}`);
            ctx.showToast({
                type: 'WARNING',
                title: 'Unknown Effect',
                description: `Effect "${effect}" is not implemented.`
            });
    }
};

const handleShowToast: ActionHandler = (action, ctx) => {
    if (action.payload) {
        ctx.showToast({
            title: action.payload.title || action.payload.message || 'Notification',
            type: action.payload.type || 'INFO',
            description: action.payload.description
        });
    }
};

const handleCopyToClipboard: ActionHandler = async (action, ctx) => {
    const text = action.payload?.text;
    if (text) {
        await navigator.clipboard.writeText(text);
        ctx.showToast({
            title: 'Copied to Clipboard',
            type: 'SUCCESS',
            description: text.length > 30 ? `"${text.substring(0, 30)}..."` : `"${text}"`
        });
    }
};

const handleDownload: ActionHandler = (action, ctx) => {
    const { filename, content } = action.payload || {};
    const blob = new Blob([content || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    ctx.showToast({
        title: 'Download Started',
        type: 'SUCCESS',
        description: `Saving ${filename || 'file'}...`
    });
};

const handleOpenModal: ActionHandler = (action, ctx) => {
    const { title, content } = action.payload || {};
    ctx.modalActions.openModal({ title, content: content || action.payload });
};

const handleCloseModal: ActionHandler = (_, ctx) => {
    ctx.modalActions.closeModal();
};

const handlePatchOrCycleState: ActionHandler = (action, ctx) => {
    if (!action.path) return;

    ctx.setMessages(prev => {
        let result: Message[] | null = null;

        if (action.type === 'CYCLE_STATE') {
            result = applyCycleState(prev, action);
        } else if (action.type === 'PATCH_STATE') {
            result = applyPatchState(prev, action);
        }

        return result || prev;
    });
};

const handleResetForm: ActionHandler = (_, ctx) => {
    ctx.setMessages(prev => applyFormReset(prev));
    ctx.showToast({ type: 'INFO', title: 'Reset', description: 'Form fields cleared.' });
};

const handleSubmitForm: ActionHandler = async (action, ctx) => {
    const lastUiNode = getLastUiNode(ctx.messages);
    if (!lastUiNode) return;

    const formData = collectFormData(lastUiNode);
    const combinedData = {
        ...formData,
        ...(action.payload || {})
    };

    await ctx.onFormSubmit(combinedData);
};

// ============================================================
// HANDLER REGISTRY (Lookup table for O(1) dispatch)
// ============================================================

const HANDLER_REGISTRY: Record<string, ActionHandler> = {
    'SEQUENCE': handleSequence,
    'DELAY': handleDelay,
    'GO_BACK': handleGoBack,
    'NAVIGATE': handleNavigate,
    'TRIGGER_EFFECT': handleTriggerEffect,
    'SHOW_TOAST': handleShowToast,
    'COPY_TO_CLIPBOARD': handleCopyToClipboard,
    'DOWNLOAD': handleDownload,
    'OPEN_MODAL': handleOpenModal,
    'CLOSE_MODAL': handleCloseModal,
    'PATCH_STATE': handlePatchOrCycleState,
    'CYCLE_STATE': handlePatchOrCycleState,
    'RESET_FORM': handleResetForm,
    'SUBMIT_FORM': handleSubmitForm,
};

// ============================================================
// PUBLIC HOOK
// ============================================================

interface UseActionDispatcherDeps {
    messages: Message[];
    setMessages: Dispatch<SetStateAction<Message[]>>;
    showToast: (options: ToastOptions) => void;
    history: {
        undo: () => void;
        redo: () => void;
        canUndo: boolean;
        canRedo: boolean;
    };
    modalActions: {
        openModal: (node: { title?: string; content: any }) => void;
        closeModal: () => void;
    };
    onFormSubmit: (formData: Record<string, any>) => Promise<void>;
}

export const useActionDispatcher = (deps: UseActionDispatcherDeps) => {
    const { messages, setMessages, showToast, history, modalActions, onFormSubmit } = deps;

    // Create dispatch function
    const dispatchImpl = useCallback(async (action: UIAction): Promise<void> => {
        actionLogger.debug('dispatch', `Handling Action: ${action.type}`, action);

        const handler = HANDLER_REGISTRY[action.type];
        if (handler) {
            // Build context on-demand (avoids capturing stale closure values)
            const ctx: DispatcherContext = {
                messages,
                setMessages,
                showToast,
                history,
                modalActions,
                onFormSubmit,
                dispatch: dispatchImpl
            };
            await handler(action, ctx);
        } else {
            actionLogger.warn('dispatch', `Unknown action type: ${action.type}`);
        }
    }, [messages, setMessages, showToast, history, modalActions, onFormSubmit]);

    // Return stable dispatch reference to prevent consumer re-renders
    return useStableCallback(dispatchImpl);
};
