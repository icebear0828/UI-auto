
import { useState, useCallback } from 'react';

// Maximum history steps to keep in memory
const MAX_HISTORY = 50;

export function useHistory<T>(initialState: T) {
  // We manage timeline and index together to prevent render inconsistencies
  const [historyState, setHistoryState] = useState<{
    timeline: T[];
    index: number;
  }>({
    timeline: [initialState],
    index: 0
  });

  // Robustly retrieve current state, falling back to initial if something goes wrong
  const state = historyState.timeline[historyState.index] ?? initialState;

  const setState = useCallback((newState: T | ((prev: T) => T), overwrite = false) => {
    setHistoryState(prev => {
      const { timeline, index } = prev;
      const currentState = timeline[index];
      
      const resolvedState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(currentState) 
        : newState;

      // 1. Overwrite: Update current entry without advancing history (e.g. streaming updates)
      if (overwrite) {
          const newTimeline = [...timeline];
          newTimeline[index] = resolvedState;
          return { ...prev, timeline: newTimeline };
      }

      // 2. Push: Branching from current point (deleting future if we undid)
      const newTimeline = timeline.slice(0, index + 1);
      newTimeline.push(resolvedState);

      let newIndex = newTimeline.length - 1;

      // 3. Limit Size: Shift if exceeding max history
      if (newTimeline.length > MAX_HISTORY) {
         newTimeline.shift();
         newIndex--; // Adjust index since 0 was removed
      }
      
      return {
        timeline: newTimeline,
        index: newIndex
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistoryState(prev => ({
      ...prev,
      index: Math.max(0, prev.index - 1)
    }));
  }, []);

  const redo = useCallback(() => {
    setHistoryState(prev => ({
      ...prev,
      index: Math.min(prev.timeline.length - 1, prev.index + 1)
    }));
  }, []);

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: historyState.index > 0,
    canRedo: historyState.index < historyState.timeline.length - 1,
    history: historyState.timeline // Exposed for debugging
  };
}
