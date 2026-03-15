/**
 * State Patching Utilities
 * 
 * Extracted from useGenUI.ts for handling PATCH_STATE and CYCLE_STATE actions
 */

import { Message, UIAction } from '@/types';
import { setByPath, getByPath } from '@/components/ui/renderUtils';

/**
 * Find the index of the last message containing a UI node
 */
export const findLastUiMessageIndex = (messages: Message[]): number => {
    const reversedIndex = [...messages].reverse().findIndex(m => m.uiNode);
    return reversedIndex >= 0 ? messages.length - 1 - reversedIndex : -1;
};

/**
 * Apply a PATCH_STATE action to the message history
 */
export const applyPatchState = (
    messages: Message[],
    action: UIAction
): Message[] | null => {
    const actualIndex = findLastUiMessageIndex(messages);

    if (actualIndex === -1) {
        console.warn("PATCH_STATE: No UI node found in history.");
        return null;
    }

    const relativePath = action.path?.startsWith('root.')
        ? action.path.substring(5)
        : action.path || '';

    const next = [...messages];
    const oldUi = next[actualIndex].uiNode;

    // Retrieve the current properties at the path
    const currentProps = getByPath(oldUi, relativePath);

    if (!currentProps) {
        console.warn(`[PATCH_STATE] Path not found: ${relativePath}`);
        return null;
    }

    // Merge partial update into props
    const newProps = {
        ...currentProps,
        ...action.payload
    };

    // Replace the props object in the tree
    next[actualIndex] = {
        ...next[actualIndex],
        uiNode: setByPath(oldUi, relativePath, newProps)
    };

    return next;
};

/**
 * Apply a CYCLE_STATE action to the message history
 */
export const applyCycleState = (
    messages: Message[],
    action: UIAction
): Message[] | null => {
    const actualIndex = findLastUiMessageIndex(messages);

    if (actualIndex === -1) {
        return null;
    }

    const relativePath = action.path?.startsWith('root.')
        ? action.path.substring(5)
        : action.path || '';

    const next = [...messages];
    const oldUi = next[actualIndex].uiNode;
    const currentProps = getByPath(oldUi, relativePath);

    if (!currentProps) {
        return null;
    }

    const { next: nextStates } = action.payload || {};

    if (!Array.isArray(nextStates) || nextStates.length === 0) {
        return null;
    }

    const nextState = nextStates[0];
    const remainingStates = nextStates.slice(1);

    // Prepare the new Action for the NEXT click
    let newAction;
    if (remainingStates.length > 0) {
        newAction = {
            type: 'CYCLE_STATE',
            path: action.path, // Preserve absolute path
            payload: { next: remainingStates }
        };
    } else {
        // End of cycle: if the next state has an action (e.g. submit), allow it
        newAction = nextState.action;
    }

    const newProps = {
        ...currentProps,
        ...nextState,
        action: newAction
    };

    next[actualIndex] = {
        ...next[actualIndex],
        uiNode: setByPath(oldUi, relativePath, newProps)
    };

    return next;
};
