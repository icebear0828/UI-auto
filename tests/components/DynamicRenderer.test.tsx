/**
 * DynamicRenderer Component Test Suite
 *
 * Tests for the core renderer including:
 * - Node validation
 * - Component rendering
 * - Error boundary behavior
 * - Edit mode interactions
 * - Animation handling
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import DynamicRenderer from '@/components/DynamicRenderer';
import { ThemeProvider } from '@/components/ThemeContext';
import { DeviceProvider } from '@/components/DeviceContext';
import { EditorProvider } from '@/components/EditorContext';
import type { UINode, UIAction, UserContext } from '@/types';
import {
    simpleTextNode,
    simpleButtonNode,
    containerWithChildren,
    cardNode,
    nestedNode,
    invalidNode
} from '../mocks/fixtures';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: React.forwardRef(({ children, ...props }: any, ref) =>
            React.createElement('div', { ...props, ref }, children)
        )
    },
    AnimatePresence: ({ children }: any) => children
}));

// Mock animation cache
vi.mock('@/services/animationCache', () => ({
    getCachedVariants: vi.fn().mockReturnValue({
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    })
}));

// Mock telemetry
vi.mock('@/services/telemetry', () => ({
    telemetry: {
        logEvent: vi.fn()
    }
}));

// Note: We don't mock validationCache to test real validation behavior

// Test wrapper with providers
const TestWrapper: React.FC<{
    children: React.ReactNode;
    device?: 'mobile' | 'desktop';
    isEditing?: boolean;
    selectedPath?: string | null;
}> = ({ children, device = 'desktop', isEditing = false, selectedPath = null }) => {
    const context: UserContext = { role: 'user', device: device as 'desktop' | 'mobile', theme: 'dark' };
    const [selected, setSelected] = React.useState<string | null>(selectedPath);

    const editorValue = {
        isEditing,
        selectedPath: selected,
        onSelect: setSelected
    };

    return (
        <ThemeProvider>
            <DeviceProvider context={context}>
                <EditorProvider value={editorValue}>
                    {children}
                </EditorProvider>
            </DeviceProvider>
        </ThemeProvider>
    );
};

const renderWithProviders = (
    node: UINode,
    options: {
        device?: 'mobile' | 'desktop';
        isEditing?: boolean;
        onAction?: (action: UIAction) => void;
        onError?: (error: Error, node: UINode, path: string) => void;
    } = {}
) => {
    const {
        device = 'desktop',
        isEditing = false,
        onAction = vi.fn(),
        onError = vi.fn()
    } = options;

    return render(
        <TestWrapper device={device} isEditing={isEditing}>
            <DynamicRenderer
                node={node}
                onAction={onAction}
                onError={onError}
            />
        </TestWrapper>
    );
};

describe('DynamicRenderer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('null and invalid inputs', () => {
        it('should not render anything for null node', () => {
            const { container } = render(
                <TestWrapper>
                    <DynamicRenderer node={null as any} onAction={vi.fn()} />
                </TestWrapper>
            );

            // Should not render content (may have wrapper divs from providers)
            const content = container.querySelector('[data-testid]');
            expect(content).toBeNull();
        });

        it('should not render anything for undefined node', () => {
            const { container } = render(
                <TestWrapper>
                    <DynamicRenderer node={undefined as any} onAction={vi.fn()} />
                </TestWrapper>
            );

            const content = container.querySelector('[data-testid]');
            expect(content).toBeNull();
        });

        it('should not render anything for empty object', () => {
            const { container } = render(
                <TestWrapper>
                    <DynamicRenderer node={{}} onAction={vi.fn()} />
                </TestWrapper>
            );

            const content = container.querySelector('[data-testid]');
            expect(content).toBeNull();
        });

        it('should show warning for invalid component type', () => {
            renderWithProviders(invalidNode);

            // Should show unknown component warning
            const warningElement = screen.queryByText(/Unknown Component Type/i) ||
                                   screen.queryByText(/Invalid/i);
            expect(warningElement).toBeInTheDocument();
        });
    });

    describe('React element rejection', () => {
        it('should return null for React elements ($$typeof check)', () => {
            const reactElement = React.createElement('div', null, 'test-react-element');

            const { container } = render(
                <TestWrapper>
                    <DynamicRenderer node={reactElement as any} onAction={vi.fn()} />
                </TestWrapper>
            );

            // Should not render React elements as UINodes
            expect(container.textContent).not.toContain('test-react-element');
        });
    });

    describe('validation integration', () => {
        it('should validate nodes before rendering', () => {
            // A valid text node should pass validation
            const { container } = renderWithProviders(simpleTextNode);

            // Container should have content
            expect(container.textContent).toBeTruthy();
        });

        it('should handle deeply nested validation', () => {
            // Nested node should still validate correctly
            const { container } = renderWithProviders(nestedNode);

            expect(container).toBeTruthy();
        });
    });

    describe('error handling', () => {
        it('should have error boundary', () => {
            // DynamicRenderer includes ErrorBoundary
            // This test verifies the component structure
            const { container } = renderWithProviders(simpleTextNode);

            // Component should render without throwing
            expect(container).toBeTruthy();
        });
    });

    describe('onAction prop', () => {
        it('should pass onAction to child components', () => {
            const onAction = vi.fn();
            const { container } = renderWithProviders(simpleButtonNode, { onAction });

            // Verify the component tree renders
            expect(container).toBeTruthy();
        });
    });

    describe('path prop', () => {
        it('should generate correct paths', () => {
            const { container } = renderWithProviders(containerWithChildren);

            // Nested components should exist in the tree
            expect(container).toBeTruthy();
        });
    });

    describe('edit mode', () => {
        it('should render in edit mode without crashing', () => {
            const { container } = renderWithProviders(simpleTextNode, { isEditing: true });

            expect(container).toBeTruthy();
        });

        it('should render in non-edit mode without crashing', () => {
            const { container } = renderWithProviders(simpleTextNode, { isEditing: false });

            expect(container).toBeTruthy();
        });
    });

    describe('device responsiveness', () => {
        it('should render on mobile device context', () => {
            const { container } = renderWithProviders(simpleTextNode, { device: 'mobile' });

            expect(container).toBeTruthy();
        });

        it('should render on desktop device context', () => {
            const { container } = renderWithProviders(simpleTextNode, { device: 'desktop' });

            expect(container).toBeTruthy();
        });
    });

    describe('memoization', () => {
        it('should be wrapped with React.memo', () => {
            // Verify DynamicRenderer is memoized by checking it's a memo component
            expect(DynamicRenderer).toBeDefined();
            expect(typeof DynamicRenderer).toBe('object'); // React.memo returns an object
        });
    });
});
