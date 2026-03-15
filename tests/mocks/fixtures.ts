/**
 * Test Fixtures
 *
 * Reusable test data for UI nodes, messages, and configurations.
 */

import type { UINode, Message, UserContext, UIAction } from '@/types';
import type { ModelConfig } from '@/types/settings';

// ============================================================
// UI NODE FIXTURES
// ============================================================

export const simpleTextNode: UINode = {
    text: { content: 'Hello World' }
};

export const simpleButtonNode: UINode = {
    button: { label: 'Click Me', variant: 'PRIMARY' }
};

export const containerWithChildren: UINode = {
    container: {
        layout: 'COL',
        padding: true,
        children: [
            { text: { content: 'Title' } },
            { button: { label: 'Submit' } }
        ]
    }
};

export const cardNode: UINode = {
    card: {
        title: 'Test Card',
        variant: 'DEFAULT',
        children: [
            { text: { content: 'Card content' } }
        ]
    }
};

export const formNode: UINode = {
    container: {
        layout: 'COL',
        children: [
            { input: { label: 'Name', placeholder: 'Enter name', value: '' } },
            { input: { label: 'Email', placeholder: 'Enter email', inputType: 'email', value: '' } },
            { button: { label: 'Submit', action: { type: 'SUBMIT_FORM' } } }
        ]
    }
};

export const nestedNode: UINode = {
    container: {
        layout: 'COL',
        children: [
            {
                card: {
                    title: 'Outer Card',
                    children: [
                        {
                            container: {
                                layout: 'ROW',
                                children: [
                                    { text: { content: 'Deep nested text' } }
                                ]
                            }
                        }
                    ]
                }
            }
        ]
    }
};

export const invalidNode: UINode = {
    unknown_component: { data: 'test' }
};

export const buttonWithAction: UINode = {
    button: {
        label: 'Navigate',
        action: { type: 'NAVIGATE', payload: { url: 'https://example.com' } }
    }
};

// ============================================================
// MESSAGE FIXTURES
// ============================================================

export const systemMessage: Message = {
    role: 'system',
    content: 'GenUI Studio is ready.'
};

export const userMessage: Message = {
    role: 'user',
    content: 'Create a dashboard'
};

export const assistantMessageWithUI: Message = {
    role: 'assistant',
    content: '',
    uiNode: containerWithChildren
};

export const messageHistory: Message[] = [
    systemMessage,
    userMessage,
    assistantMessageWithUI
];

// ============================================================
// CONTEXT FIXTURES
// ============================================================

export const desktopContext: UserContext = {
    role: 'user',
    device: 'desktop',
    theme: 'dark',
    mode: 'default'
};

export const mobileContext: UserContext = {
    role: 'user',
    device: 'mobile',
    theme: 'dark',
    mode: 'default'
};

export const adminContext: UserContext = {
    role: 'admin',
    device: 'desktop',
    theme: 'light',
    mode: 'default'
};

// ============================================================
// CONFIG FIXTURES
// ============================================================

export const defaultConfig: ModelConfig = {
    model: 'gemini-3-flash-preview',
    soundEnabled: true
};

// ============================================================
// ACTION FIXTURES
// ============================================================

export const navigateAction: UIAction = {
    type: 'NAVIGATE',
    payload: { url: 'https://example.com' }
};

export const showToastAction: UIAction = {
    type: 'SHOW_TOAST',
    payload: { title: 'Success', type: 'SUCCESS', description: 'Operation completed' }
};

export const patchStateAction: UIAction = {
    type: 'PATCH_STATE',
    path: 'root.container.children.0.input',
    payload: { value: 'new value' }
};

export const sequenceAction: UIAction = {
    type: 'SEQUENCE',
    payload: {
        actions: [
            { type: 'SHOW_TOAST', payload: { title: 'Step 1', type: 'INFO' } },
            { type: 'DELAY', payload: { ms: 100 } },
            { type: 'SHOW_TOAST', payload: { title: 'Step 2', type: 'SUCCESS' } }
        ]
    }
};

export const submitFormAction: UIAction = {
    type: 'SUBMIT_FORM',
    payload: { extra: 'data' }
};

export const triggerEffectAction: UIAction = {
    type: 'TRIGGER_EFFECT',
    payload: { effect: 'CONFETTI' }
};

export const copyToClipboardAction: UIAction = {
    type: 'COPY_TO_CLIPBOARD',
    payload: { text: 'Copied text' }
};

export const downloadAction: UIAction = {
    type: 'DOWNLOAD',
    payload: { filename: 'test.txt', content: 'File content' }
};

export const openModalAction: UIAction = {
    type: 'OPEN_MODAL',
    payload: { title: 'Modal Title', content: simpleTextNode }
};

export const closeModalAction: UIAction = {
    type: 'CLOSE_MODAL'
};

export const goBackAction: UIAction = {
    type: 'GO_BACK'
};
