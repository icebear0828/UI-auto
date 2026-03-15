/**
 * Container Component Test Suite
 * 
 * Tests for the Container component including device-adaptive layout logic
 * that converts ROW to COL on mobile when there are more than 2 children.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from '@/components/ui/Container';
import { DeviceProvider } from '@/components/DeviceContext';
import { ThemeProvider } from '@/components/ThemeContext';
import React from 'react';

// Mock children components for testing
const MockChildren = ({ count }: { count: number }) => (
    <>
        {Array.from({ length: count }, (_, i) => (
            <div key={i} data-testid={`child-${i}`}>Child {i + 1}</div>
        ))}
    </>
);

// Helper to render Container with all required providers
const renderContainer = (props: any, device: 'mobile' | 'desktop' = 'desktop') => {
    const context = { device, role: 'user', theme: 'dark' };

    return render(
        <ThemeProvider>
            <DeviceProvider context={context}>
                <Container {...props} />
            </DeviceProvider>
        </ThemeProvider>
    );
};

describe('Container Component', () => {
    describe('Basic Rendering', () => {
        it('should render children correctly', () => {
            renderContainer({
                children: [
                    { text: { content: 'Hello' } },
                    { text: { content: 'World' } }
                ]
            });

            // Container should render without errors
            expect(document.querySelector('.flex')).toBeInTheDocument();
        });

        it('should apply padding class when padding is true', () => {
            const { container } = renderContainer({ padding: true });

            expect(container.firstChild).toHaveClass('p-6');
        });
    });

    describe('Device-Adaptive Layout', () => {
        it('should keep ROW layout on desktop regardless of children count', () => {
            const { container } = renderContainer(
                {
                    layout: 'ROW',
                    children: [
                        { text: { content: '1' } },
                        { text: { content: '2' } },
                        { text: { content: '3' } },
                        { text: { content: '4' } }
                    ]
                },
                'desktop'
            );

            // On desktop, ROW layout should be preserved
            expect(container.firstChild).toHaveClass('flex-row');
        });

        it('should convert ROW to COL on mobile when >2 children', () => {
            const { container } = renderContainer(
                {
                    layout: 'ROW',
                    children: [
                        { text: { content: '1' } },
                        { text: { content: '2' } },
                        { text: { content: '3' } }
                    ]
                },
                'mobile'
            );

            // On mobile with >2 children, should convert to COL
            expect(container.firstChild).toHaveClass('flex-col');
        });

        it('should keep ROW on mobile when <=2 children', () => {
            const { container } = renderContainer(
                {
                    layout: 'ROW',
                    children: [
                        { text: { content: '1' } },
                        { text: { content: '2' } }
                    ]
                },
                'mobile'
            );

            // On mobile with <=2 children, ROW should be preserved
            expect(container.firstChild).toHaveClass('flex-row');
        });

        it('should keep COL layout unchanged on any device', () => {
            const { container: mobileContainer } = renderContainer(
                { layout: 'COL', children: [{ text: { content: '1' } }] },
                'mobile'
            );

            const { container: desktopContainer } = renderContainer(
                { layout: 'COL', children: [{ text: { content: '1' } }] },
                'desktop'
            );

            expect(mobileContainer.firstChild).toHaveClass('flex-col');
            expect(desktopContainer.firstChild).toHaveClass('flex-col');
        });
    });

    describe('Background Image', () => {
        it('should apply background image styles when bgImage is provided', () => {
            const { container } = renderContainer({
                bgImage: 'https://example.com/image.jpg'
            });

            const element = container.firstChild as HTMLElement;
            // jsdom wraps URL in quotes, so check for both formats
            expect(element.style.backgroundImage).toMatch(/url\(["']?https:\/\/example\.com\/image\.jpg["']?\)/);
        });

        it('should render overlay when bgImage is present', () => {
            const { container } = renderContainer({
                bgImage: 'https://example.com/image.jpg'
            });

            // Should have an overlay div
            expect(container.querySelector('.bg-black\\/40')).toBeInTheDocument();
        });
    });

    describe('Gap Classes', () => {
        it('should apply correct gap class based on gap prop', () => {
            const { container: containerSm } = renderContainer({ gap: 'GAP_SM' });
            const { container: containerLg } = renderContainer({ gap: 'GAP_LG' });

            // Gap classes from theme: GAP_SM = 'gap-3', GAP_LG = 'gap-8'
            expect(containerSm.firstChild).toHaveClass('gap-3');
            expect(containerLg.firstChild).toHaveClass('gap-8');
        });
    });
});
