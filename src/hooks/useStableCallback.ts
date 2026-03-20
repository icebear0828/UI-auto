/**
 * Stable Callback Hook
 *
 * useEvent polyfill - creates a stable function reference that always calls
 * the latest version of the callback without causing re-renders.
 *
 * This prevents closure capture issues and reduces unnecessary re-renders
 * when callbacks are passed as props or dependencies.
 */

import { useRef, useCallback, useLayoutEffect, DependencyList } from 'react';

/** Generic callable type — avoids `any` while matching all function signatures */
type Callable = (...args: never[]) => unknown;

/**
 * Creates a stable callback reference that always invokes the latest function
 *
 * @param fn - The callback function to stabilize
 * @returns A stable reference that calls the current version of fn
 */
export function useStableCallback<T extends Callable>(fn: T): T {
    const ref = useRef<T>(fn);

    // Update ref on each render (before effects run)
    useLayoutEffect(() => {
        ref.current = fn;
    });

    // Return stable callback that delegates to current ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useCallback((...args: Parameters<T>): ReturnType<T> => {
        return ref.current(...(args as never[])) as ReturnType<T>;
    }, []) as unknown as T;
}

/**
 * Creates a stable callback with explicit dependencies
 * Use when you want stable identity but need to capture specific values
 */
export function useStableCallbackWithDeps<T extends Callable>(
    fn: T,
    deps: DependencyList
): T {
    const ref = useRef<T>(fn);

    useLayoutEffect(() => {
        ref.current = fn;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return useCallback((...args: Parameters<T>): ReturnType<T> => {
        return ref.current(...(args as never[])) as ReturnType<T>;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) as unknown as T;
}
