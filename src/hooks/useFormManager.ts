/**
 * Form Manager Utilities
 * 
 * Extracted from useGenUI.ts for form data collection and reset
 */

import { UINode, Message } from '@/types';

/**
 * Recursively collect form data from a UI node tree
 */
export function collectFormData(node: any): Record<string, any> {
    let data: Record<string, any> = {};

    if (!node || typeof node !== 'object') return data;

    // Check if current node is an input with a label
    if (node.input && node.input.label) {
        const key = node.input.label;
        const value = node.input.value || "";
        data[key] = value;
    }

    // Check switch
    if (node.switch && node.switch.label) {
        data[node.switch.label] = node.switch.value;
    }

    // Check slider
    if (node.slider && node.slider.label) {
        data[node.slider.label] = node.slider.value;
    }

    // Recursive traversal
    Object.values(node).forEach(childValue => {
        if (Array.isArray(childValue)) {
            childValue.forEach(child => {
                data = { ...data, ...collectFormData(child) };
            });
        } else if (typeof childValue === 'object' && childValue !== null) {
            data = { ...data, ...collectFormData(childValue) };
        }
    });

    return data;
}

/**
 * Recursively clear form values in a UI node tree
 */
export function clearFormValues(node: any): any {
    if (Array.isArray(node)) {
        return node.map(clearFormValues);
    }
    if (node && typeof node === 'object') {
        const newNode = { ...node };
        if (newNode.input) newNode.input.value = "";
        if (newNode.switch) newNode.switch.value = false;
        if (newNode.slider) newNode.slider.value = newNode.slider.min || 0;

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
    const newUi = clearFormValues(oldUi);

    next[actualIndex] = { ...next[actualIndex], uiNode: newUi };
    return next;
}
