/**
 * Action Types and Interfaces
 * 
 * Clean Architecture: Domain layer types for action handling
 */

import type { Dispatch, SetStateAction } from 'react';
import { UIAction, Message } from '@/types';

// Action execution context passed to handlers
export interface ActionContext {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  showToast: (options: ToastOptions) => void;
  history: {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
  };
}

export interface ToastOptions {
  type: 'SUCCESS' | 'ERROR' | 'INFO' | 'WARNING';
  title: string;
  description?: string;
}

// Action handler function signature
export type ActionHandler = (
  action: UIAction,
  context: ActionContext
) => Promise<void>;

// Action handler registry type
export type ActionHandlerMap = Record<string, ActionHandler>;
