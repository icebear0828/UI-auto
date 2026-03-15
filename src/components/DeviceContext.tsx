/**
 * Device Context Provider
 * 
 * Provides device-aware context to the entire component tree,
 * enabling responsive adaptations at the component level.
 */

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { UserContext } from '@/types';

interface DeviceContextValue {
    device: 'desktop' | 'mobile';
    isMobile: boolean;
    isDesktop: boolean;
}

const DeviceContext = createContext<DeviceContextValue>({
    device: 'desktop',
    isMobile: false,
    isDesktop: true,
});

interface DeviceProviderProps {
    context: UserContext;
    children: ReactNode;
}

export const DeviceProvider: React.FC<DeviceProviderProps> = ({ context, children }) => {
    const value = useMemo<DeviceContextValue>(() => ({
        device: context.device,
        isMobile: context.device === 'mobile',
        isDesktop: context.device === 'desktop',
    }), [context.device]);

    return (
        <DeviceContext.Provider value={value}>
            {children}
        </DeviceContext.Provider>
    );
};

export const useDeviceContext = () => useContext(DeviceContext);
