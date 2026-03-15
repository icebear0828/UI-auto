/**
 * DeviceContext Test Suite
 * 
 * Tests for the device context provider and hook that enables
 * responsive design adaptations at the component level.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeviceProvider, useDeviceContext } from '@/components/DeviceContext';
import React from 'react';

// Helper component to test context values
const ContextConsumer: React.FC = () => {
    const { device, isMobile, isDesktop } = useDeviceContext();
    return (
        <div>
            <span data-testid="device">{device}</span>
            <span data-testid="isMobile">{String(isMobile)}</span>
            <span data-testid="isDesktop">{String(isDesktop)}</span>
        </div>
    );
};

describe('DeviceContext', () => {
    describe('DeviceProvider', () => {
        it('should provide mobile context when device is mobile', () => {
            const context = { device: 'mobile' as const, role: 'user', theme: 'dark' };

            render(
                <DeviceProvider context={context}>
                    <ContextConsumer />
                </DeviceProvider>
            );

            expect(screen.getByTestId('device')).toHaveTextContent('mobile');
            expect(screen.getByTestId('isMobile')).toHaveTextContent('true');
            expect(screen.getByTestId('isDesktop')).toHaveTextContent('false');
        });

        it('should provide desktop context when device is desktop', () => {
            const context = { device: 'desktop' as const, role: 'user', theme: 'dark' };

            render(
                <DeviceProvider context={context}>
                    <ContextConsumer />
                </DeviceProvider>
            );

            expect(screen.getByTestId('device')).toHaveTextContent('desktop');
            expect(screen.getByTestId('isMobile')).toHaveTextContent('false');
            expect(screen.getByTestId('isDesktop')).toHaveTextContent('true');
        });
    });

    describe('useDeviceContext Default Values', () => {
        it('should return desktop defaults when used outside provider', () => {
            // Without provider, should use default context
            render(<ContextConsumer />);

            expect(screen.getByTestId('device')).toHaveTextContent('desktop');
            expect(screen.getByTestId('isMobile')).toHaveTextContent('false');
            expect(screen.getByTestId('isDesktop')).toHaveTextContent('true');
        });
    });
});
