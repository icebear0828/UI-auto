/**
 * useMessageState Hook
 *
 * Manages message-related state: history, streaming node, metrics,
 * telemetry subscription, auto-scroll, and diagnostics.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { UINode, Message } from '@/types';
import { telemetry } from '@/services/telemetry';
import { useHistory } from './useHistory';
import { useToast } from '@/components/ui/Toast';
import { DIAGNOSTIC_PAYLOAD } from '@/services/diagnosticData';

export const useMessageState = () => {
  const {
    state: messages,
    setState: setMessages,
    undo,
    redo,
    canUndo,
    canRedo
  } = useHistory<Message[]>([
    { role: 'system', content: 'GenUI Studio is ready. Describe a UI component, dashboard, or layout to generate it instantly.' }
  ]);

  const [streamingNode, setStreamingNode] = useState<UINode | null>(null);

  const [metrics, setMetrics] = useState({
    ttft: 0,
    latency: 0,
    active: false,
    hallucinations: 0
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { showToast } = useToast();

  // Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        if (canRedo) redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  // Telemetry subscription
  useEffect(() => {
    const unsubscribe = telemetry.subscribe((event) => {
      setMetrics(prev => {
        if (event.name === 'STREAM_START') return { ...prev, active: true, latency: 0, ttft: 0 };
        if (event.name === 'STREAM_COMPLETE') return { ...prev, active: false, latency: event.value };
        if (event.name === 'TTFT') return { ...prev, ttft: event.value };
        if (event.name === 'HALLUCINATION') return { ...prev, hallucinations: prev.hallucinations + 1 };
        return prev;
      });
    });
    return unsubscribe;
  }, []);

  // Auto-scroll (disabled in edit mode — caller passes editMode)
  const editModeRef = useRef(false);
  useEffect(() => {
    if (!editModeRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingNode]);

  // Diagnostics
  const runDiagnostics = useCallback(() => {
    setMessages(prev => [
      ...prev,
      { role: 'user', content: '/system_diagnostics' },
      { role: 'system', content: 'Initializing System Diagnostics...' },
      { role: 'assistant', content: 'Generating Test Suite...', uiNode: DIAGNOSTIC_PAYLOAD }
    ]);
    showToast({ type: 'SUCCESS', title: 'Diagnostics Started', description: 'Rendering full component suite.' });
  }, [setMessages, showToast]);

  return {
    messages,
    setMessages,
    streamingNode,
    setStreamingNode,
    metrics,
    messagesEndRef,
    runDiagnostics,
    editModeRef,
    history: { undo, redo, canUndo, canRedo }
  };
};
