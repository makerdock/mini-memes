"use client";
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import React, { useEffect, ReactNode } from 'react';

interface FrameAutomationProvidersProps {
    children?: ReactNode;
}

const FrameAutomationProviders = ({ children }: FrameAutomationProvidersProps) => {
    const { setFrameReady, isFrameReady } = useMiniKit();

    useEffect(() => {
        if (!isFrameReady) {
            setFrameReady();
        }
    }, [setFrameReady, isFrameReady]);

    return (
        <>
            {children}
        </>
    );
};

export default FrameAutomationProviders;