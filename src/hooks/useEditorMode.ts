/**
 * useEditorMode Hook
 *
 * Handles edit/refine mode: selection, refinement, and variation creation.
 */

import { useState, useCallback, type Dispatch, type SetStateAction } from 'react';
import { UINode, Message } from '@/types';
import { ModelConfig } from '@/types/settings';
import { getAIProvider } from '@/services/ai';
import { setByPath, getByPath } from '@/components/ui/renderUtils';

interface UseEditorModeDeps {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  config: ModelConfig;
}

export const useEditorMode = (deps: UseEditorModeDeps) => {
  const { messages, setMessages, config } = deps;

  const [editMode, setEditMode] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const createVariation = useCallback(async (setLoading: (v: boolean) => void) => {
    if (!selectedPath) return;

    setLoading(true);

    const lastUiMsgIndex = [...messages].reverse().findIndex(m => m.uiNode);
    const actualIndex = lastUiMsgIndex >= 0 ? messages.length - 1 - lastUiMsgIndex : -1;

    if (actualIndex === -1) {
      setLoading(false);
      return;
    }

    const rootNode = messages[actualIndex].uiNode;
    const relativePath = selectedPath.startsWith('root.') ? selectedPath.substring(5) : selectedPath;
    const subProps = relativePath ? getByPath(rootNode, relativePath) : rootNode;

    if (!subProps) {
      setLoading(false);
      return;
    }

    const pathSegments = relativePath.split('.');
    const componentType = pathSegments[pathSegments.length - 1];
    const wrappedNode = { [componentType]: subProps };

    setMessages(prev => [...prev, { role: 'system', content: '🎨 Generating variation...' }]);

    try {
      const variationConfig = { ...config };
      const variationPrompt = "Create a distinct visual variation of this component. Change the style, layout, or colors while keeping the functionality. Make it look fresh.";

      const refinedJson = await getAIProvider().refine({ prompt: variationPrompt, currentNode: wrappedNode, modelConfig: variationConfig });

      setMessages(prev => {
        const next = [...prev];
        const oldUi = next[actualIndex].uiNode;

        const responseKey = Object.keys(refinedJson)[0];
        const newProps = refinedJson[responseKey];

        if (!relativePath) {
          next[actualIndex] = { ...next[actualIndex], uiNode: refinedJson };
        } else {
          const newUi = setByPath(oldUi, relativePath, newProps);
          next[actualIndex] = { ...next[actualIndex], uiNode: newUi };
        }

        return next;
      });

    } catch (err) {
      setMessages(prev => [...prev, { role: 'system', content: 'Failed to create variation.' }]);
    } finally {
      setLoading(false);
    }
  }, [selectedPath, messages, config, setMessages]);

  const handleRefinement = useCallback(async (userMsg: string, setLoading: (v: boolean) => void) => {
    setLoading(true);

    const lastUiMsgIndex = [...messages].reverse().findIndex(m => m.uiNode);
    const actualIndex = lastUiMsgIndex >= 0 ? messages.length - 1 - lastUiMsgIndex : -1;

    if (actualIndex === -1) {
      setLoading(false);
      return;
    }

    const rootNode = messages[actualIndex].uiNode;
    const relativePath = selectedPath!.startsWith('root.') ? selectedPath!.substring(5) : selectedPath!;
    const subProps = relativePath ? getByPath(rootNode, relativePath) : rootNode;

    if (subProps) {
      const pathSegments = relativePath.split('.');
      const componentType = pathSegments[pathSegments.length - 1];
      const wrappedNode = { [componentType]: subProps };

      setMessages(prev => [...prev, { role: 'user', content: `Refine selected component: ${userMsg}` }]);

      try {
        const refinedJson = await getAIProvider().refine({ prompt: userMsg, currentNode: wrappedNode, modelConfig: config });

        setMessages(prev => {
          const next = [...prev];
          const oldUi = next[actualIndex].uiNode;

          const responseKey = Object.keys(refinedJson)[0];
          const newProps = refinedJson[responseKey];

          let newUi;
          if (!relativePath) {
            newUi = refinedJson;
          } else {
            newUi = setByPath(oldUi, relativePath, newProps);
          }
          next[actualIndex] = { ...next[actualIndex], uiNode: newUi };
          return next;
        });
        setMessages(prev => [...prev, { role: 'system', content: 'Component updated successfully.' }]);
      } catch (err) {
        setMessages(prev => [...prev, { role: 'system', content: 'Failed to refine component.' }]);
      }
    }
    setLoading(false);
  }, [selectedPath, messages, config, setMessages]);

  return {
    editMode,
    setEditMode,
    selectedPath,
    setSelectedPath,
    createVariation,
    handleRefinement
  };
};
