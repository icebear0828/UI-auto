/**
 * Vitest Test Setup
 *
 * Global test configuration and mocks
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// ============================================================
// GLOBAL MOCKS
// ============================================================

// Mock window.matchMedia (required for responsive components)
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock ResizeObserver
class ResizeObserverMock {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}
window.ResizeObserver = ResizeObserverMock as any;

// Mock IntersectionObserver
class IntersectionObserverMock {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    root = null;
    rootMargin = '';
    thresholds = [];
}
window.IntersectionObserver = IntersectionObserverMock as any;

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock requestAnimationFrame
window.requestAnimationFrame = vi.fn((callback) => {
    callback(0);
    return 0;
});

window.cancelAnimationFrame = vi.fn();

// Mock crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
    value: {
        randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
        getRandomValues: (arr: Uint8Array) => {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = Math.floor(Math.random() * 256);
            }
            return arr;
        }
    }
});

// Mock Audio API
window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
window.HTMLMediaElement.prototype.pause = vi.fn();
window.HTMLMediaElement.prototype.load = vi.fn();

// ============================================================
// CONSOLE SUPPRESSION (Optional)
// ============================================================

// Suppress specific console warnings during tests
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args: any[]) => {
    // Suppress React key warnings and other noise
    const message = args[0]?.toString() || '';
    if (
        message.includes('Each child in a list should have a unique "key" prop') ||
        message.includes('componentWillReceiveProps') ||
        message.includes('componentWillUpdate')
    ) {
        return;
    }
    originalWarn.apply(console, args);
};

console.error = (...args: any[]) => {
    // Suppress expected error boundary errors
    const message = args[0]?.toString() || '';
    if (
        message.includes('Error boundaries should implement getDerivedStateFromError') ||
        message.includes('The above error occurred in')
    ) {
        return;
    }
    originalError.apply(console, args);
};
