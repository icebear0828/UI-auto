/**
 * useUIGeneration Hook
 *
 * Handles AI generation flow: streaming with lock, abort, tool calls,
 * cancel support, and self-healing fixNode.
 */

import { useState, useRef, useCallback, type Dispatch, type SetStateAction } from 'react';
import { UINode, UserContext, Message } from '@/types';
import { ModelConfig } from '@/types/settings';
import { getAIProvider } from '@/services/ai';
import { parsePartialJson } from '@/services/streamParser';
import { executeTool } from '@/services/tools';
import { serviceLogger } from '@/services/logger';
import { setByPath } from '@/components/ui/renderUtils';

interface UseUIGenerationDeps {
  context: UserContext;
  config: ModelConfig;
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  streamingNode: UINode | null;
  setStreamingNode: Dispatch<SetStateAction<UINode | null>>;
  showToast: (options: { type: string; title: string; description: string }) => void;
}

export const useUIGeneration = (deps: UseUIGenerationDeps) => {
  const { context, config, messages, setMessages, streamingNode, setStreamingNode, showToast } = deps;

  const [loading, setLoading] = useState(false);
  const generationLockRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleGeneration = useCallback(async (prompt: string, originalUserMsg: string, generationId?: string) => {
    const currentGenerationId = generationId || `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (!generationId) {
      if (generationLockRef.current) {
        console.warn('[useGenUI] Generation already in progress, ignoring new request');
        showToast({
          type: 'WARNING',
          title: 'Please Wait',
          description: 'A generation is already in progress.'
        });
        return;
      }

      generationLockRef.current = currentGenerationId;
      abortControllerRef.current = new AbortController();
    }

    if (generationLockRef.current !== currentGenerationId) {
      console.warn('[useGenUI] Generation lock lost, aborting');
      return;
    }

    let rawAccumulated = "";
    let isToolCallDetected = false;

    const lastUiMsg = [...messages].reverse().find(m => m.uiNode);
    const previousState = lastUiMsg ? lastUiMsg.uiNode : null;

    try {
      const stream = getAIProvider().generateStream({ prompt, context, modelConfig: config, previousState: previousState || undefined });

      for await (const chunk of stream) {
        if (generationLockRef.current !== currentGenerationId) {
          serviceLogger.debug('useGenUI', 'Generation cancelled');
          return;
        }

        rawAccumulated += chunk;
        const partialUI = parsePartialJson(rawAccumulated);
        if (partialUI?.tool_call) {
          isToolCallDetected = true;
          continue;
        }
        if (partialUI && typeof partialUI === 'object' && !isToolCallDetected) {
          setStreamingNode(partialUI);
        }
      }

      if (generationLockRef.current !== currentGenerationId) {
        return;
      }

      const finalResponse = parsePartialJson(rawAccumulated);

      if (finalResponse?.tool_call) {
        const { name, arguments: args } = finalResponse.tool_call;
        setMessages(prev => [...prev, { role: 'system', content: `⚡ Orchestrating: ${name} with args ${JSON.stringify(args)}` }]);
        const toolResult = await executeTool(name, args);

        if (toolResult?.isMock) {
          showToast({
            type: 'WARNING',
            title: 'Using Simulated Data',
            description: toolResult.mockReason || 'Real-time API unavailable, showing mock data.'
          });
        }

        const nextPrompt = `ORIGINAL REQUEST: ${originalUserMsg}\nTOOL RESULT (${name}): ${JSON.stringify(toolResult)}\nINSTRUCTIONS: Generate UI.`;
        await handleGeneration(nextPrompt, originalUserMsg, currentGenerationId);
        return;
      }

      if (!isToolCallDetected && (finalResponse || rawAccumulated.trim())) {
        setMessages(prev => [...prev, { role: 'assistant', content: '', uiNode: finalResponse || streamingNode }]);
      }

    } catch (e) {
      console.error("Streaming failed", e);
      setMessages(prev => [...prev, { role: 'system', content: 'Error rendering stream. Check settings.' }]);
    } finally {
      if (!generationId && generationLockRef.current === currentGenerationId) {
        generationLockRef.current = null;
        abortControllerRef.current = null;
      }
    }
  }, [context, streamingNode, config, messages, setMessages, showToast]);

  const fixNode = useCallback(async (error: Error, node: UINode, path: string) => {
    serviceLogger.debug('useGenUI', `Attempting to fix node at path: ${path}`);

    try {
      const fixedNode = await getAIProvider().fix({ error: error.message, badNode: node, modelConfig: config });
      const relativePath = path.startsWith('root.') ? path.substring(5) : (path === 'root' ? '' : path);

      setMessages(prev => {
        const lastUiMsgIndex = [...prev].reverse().findIndex(m => m.uiNode);
        const actualIndex = lastUiMsgIndex >= 0 ? prev.length - 1 - lastUiMsgIndex : -1;

        if (actualIndex === -1) return prev;

        const next = [...prev];
        const oldUi = next[actualIndex].uiNode;
        let newUi;

        if (!relativePath) {
          newUi = fixedNode;
        } else {
          newUi = setByPath(oldUi, relativePath, fixedNode);
        }

        next[actualIndex] = { ...next[actualIndex], uiNode: newUi };
        next.push({ role: 'system', content: `🔧 Auto-Healed component at ${path}` });
        return next;
      });

    } catch (err) {
      console.error("Failed to heal:", err);
      setMessages(prev => [...prev, { role: 'system', content: `❌ Auto-Healing failed: ${err}` }]);
    }
  }, [config, setMessages]);

  const cancelGeneration = useCallback(() => {
    if (generationLockRef.current) {
      serviceLogger.debug('useGenUI', `Cancelling generation: ${generationLockRef.current}`);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      generationLockRef.current = null;

      setLoading(false);
      setStreamingNode(null);

      showToast({
        type: 'INFO',
        title: 'Cancelled',
        description: 'Generation request was cancelled.'
      });

      setMessages(prev => [...prev, { role: 'system', content: '⏹️ Generation cancelled by user.' }]);
    }
  }, [showToast, setMessages, setStreamingNode]);

  const canCancel = loading && generationLockRef.current !== null;

  return {
    handleGeneration,
    fixNode,
    cancelGeneration,
    canCancel,
    loading,
    setLoading,
    generationLockRef
  };
};
