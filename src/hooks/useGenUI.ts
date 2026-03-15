/**
 * useGenUI Hook - Main Orchestrator
 *
 * Thin composition layer that delegates to:
 * - useMessageState: messages, history, streaming, metrics, diagnostics
 * - useUIGeneration: AI generation, tool calls, self-healing
 * - useEditorMode: edit/refine mode, variation creation
 */

import React, { useState, useCallback, useEffect } from 'react';
import { UserContext, UINode } from '@/types';
import { INITIAL_CONTEXT } from '@/constants';
import { ModelConfig, DEFAULT_CONFIG } from '@/types/settings';
import { useToast } from '@/components/ui/Toast';
import { useActionDispatcher } from './useActionDispatcher';
import { useMessageState } from './useMessageState';
import { useUIGeneration } from './useUIGeneration';
import { useEditorMode } from './useEditorMode';

const STORAGE_KEY = 'genui_model_config';

export const useGenUI = () => {
  // --- Local State ---
  const [context, setContext] = useState<UserContext>(INITIAL_CONTEXT);
  const [input, setInput] = useState('');
  const [modalNode, setModalNode] = useState<{ title?: string, content: UINode } | null>(null);

  const { showToast } = useToast();

  // Settings State
  const [config, setConfigState] = useState<ModelConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const setConfig = (newConfig: ModelConfig) => {
    setConfigState(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  // --- Sub-hooks ---
  const messageState = useMessageState();
  const { messages, setMessages, streamingNode, setStreamingNode, metrics, messagesEndRef, runDiagnostics, editModeRef, history } = messageState;
  const { undo, redo, canUndo, canRedo } = history;

  const generation = useUIGeneration({
    context, config, messages, setMessages,
    streamingNode, setStreamingNode, showToast
  });
  const { handleGeneration, fixNode, cancelGeneration, canCancel, loading, setLoading, generationLockRef } = generation;

  const editor = useEditorMode({ messages, setMessages, config });
  const { editMode, setEditMode, selectedPath, setSelectedPath, createVariation: editorCreateVariation, handleRefinement } = editor;

  // Keep editModeRef in sync for auto-scroll suppression
  useEffect(() => {
    editModeRef.current = editMode;
  }, [editMode, editModeRef]);

  // --- Composed Actions ---

  const handleFormSubmit = useCallback(async (formData: Record<string, any>) => {
    setLoading(true);
    const submissionText = `User Interaction/Form Data: ${JSON.stringify(formData, null, 2)}`;
    setMessages(prev => [...prev, { role: 'system', content: 'Submitting interaction...' }]);
    await handleGeneration(submissionText, "Interaction Submission");
    setLoading(false);
  }, [handleGeneration, setMessages, setLoading]);

  const handleAction = useActionDispatcher({
    messages,
    setMessages,
    showToast,
    history: { undo, redo, canUndo, canRedo },
    modalActions: {
      openModal: (node) => setModalNode(node),
      closeModal: () => setModalNode(null)
    },
    onFormSubmit: handleFormSubmit
  });

  const createVariation = useCallback(async () => {
    await editorCreateVariation(setLoading);
  }, [editorCreateVariation, setLoading]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (loading || generationLockRef.current) {
      showToast({
        type: 'INFO',
        title: 'Please Wait',
        description: 'Processing previous request...'
      });
      return;
    }

    const userMsg = input;
    setInput('');

    // Refinement branch
    if (editMode && selectedPath) {
      await handleRefinement(userMsg, setLoading);
      return;
    }

    // Generation branch
    setLoading(true);
    setStreamingNode(null);
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      await handleGeneration(userMsg, userMsg);
    } finally {
      setLoading(false);
      setStreamingNode(null);
    }
  }, [input, loading, handleGeneration, editMode, selectedPath, handleRefinement, setMessages, setStreamingNode, showToast, generationLockRef, setLoading]);

  const closeModal = useCallback(() => setModalNode(null), []);

  // --- Return exact same shape ---
  return {
    state: { context, input, loading, streamingNode, messages, metrics, editMode, selectedPath, config, modalNode, canCancel },
    refs: { messagesEndRef },
    actions: {
      setContext,
      setInput,
      handleSubmit,
      handleAction,
      setEditMode,
      setSelectedPath,
      setConfig,
      fixNode,
      createVariation,
      closeModal,
      runDiagnostics,
      cancelGeneration
    },
    history: { undo, redo, canUndo, canRedo }
  };
};
