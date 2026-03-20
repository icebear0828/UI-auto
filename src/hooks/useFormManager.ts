/**
 * Form Manager Utilities
 *
 * Extracted from useGenUI.ts for form data collection and reset
 */

import { UINode, Message } from '@/types';

/**
 * Recursively collect form data from a UI node tree
 */
export function collectFormData(node: Record<string, unknown>): Record<string, unknown> {
    let data: Record<string, unknown> = {};

    if (!node || typeof node !== 'object') return data;

    // Check if current node is an input with a label
    const input = node.input as Record<string, unknown> | undefined;
    if (input && typeof input.label === 'string') {
        data[input.label] = input.value || "";
    }

    // Check switch
    const sw = node.switch as Record<string, unknown> | undefined;
    if (sw && typeof sw.label === 'string') {
        data[sw.label] = sw.value;
    }

    // Check slider
    const slider = node.slider as Record<string, unknown> | undefined;
    if (slider && typeof slider.label === 'string') {
        data[slider.label] = slider.value;
    }

    // Recursive traversal
    Object.values(node).forEach(childValue => {
        if (Array.isArray(childValue)) {
            childValue.forEach(child => {
                if (child && typeof child === 'object') {
                    data = { ...data, ...collectFormData(child as Record<string, unknown>) };
                }
            });
        } else if (typeof childValue === 'object' && childValue !== null) {
            data = { ...data, ...collectFormData(childValue as Record<string, unknown>) };
        }
    });

    return data;
}

/**
 * Recursively clear form values in a UI node tree
 */
export function clearFormValues(node: unknown): unknown {
    if (Array.isArray(node)) {
        return node.map(clearFormValues);
    }
    if (node && typeof node === 'object') {
        const newNode = { ...(node as Record<string, unknown>) };
        const input = newNode.input as Record<string, unknown> | undefined;
        if (input) { newNode.input = { ...input, value: "" }; }
        const sw = newNode.switch as Record<string, unknown> | undefined;
        if (sw) { newNode.switch = { ...sw, value: false }; }
        const slider = newNode.slider as Record<string, unknown> | undefined;
        if (slider) { newNode.slider = { ...slider, value: (slider.min as number) || 0 }; }

        // Recurse keys
        Object.keys(newNode).forEach(key => {
            if (key !== 'input' && key !== 'switch' && key !== 'slider') {
                newNode[key] = clearFormValues(newNode[key]);
            }
        });
        return newNode;
    }
    return node;
}

/**
 * Get the last UI node from message history
 */
export function getLastUiNode(messages: Message[]): UINode | null {
    const lastUiMsg = [...messages].reverse().find(m => m.uiNode);
    return lastUiMsg?.uiNode || null;
}

/**
 * Apply form reset to message history
 */
export function applyFormReset(messages: Message[]): Message[] {
    const lastUiMsgIndex = [...messages].reverse().findIndex(m => m.uiNode);
    const actualIndex = lastUiMsgIndex >= 0 ? messages.length - 1 - lastUiMsgIndex : -1;

    if (actualIndex === -1) return messages;

    const next = [...messages];
    const oldUi = next[actualIndex].uiNode;
    const newUi = clearFormValues(oldUi) as UINode;

    next[actualIndex] = { ...next[actualIndex], uiNode: newUi };
    return next;
}
