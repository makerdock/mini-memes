"use client";

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { X, Wallet } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

interface WalletSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletSelected: (walletClient: any) => void;
  title: string;
  description: string;
}

export function WalletSelectionModal({
  isOpen,
  onClose,
  onWalletSelected,
  title,
  description
}: WalletSelectionModalProps) {
  const [connecting, setConnecting] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState<any>(null);
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { context } = useMiniKit();

  // Effect to handle wallet connection completion
  React.useEffect(() => {
    if (isConnected && address && connecting && selectedConnector) {
      onWalletSelected(selectedConnector);
      onClose();
      setConnecting(false);
      setSelectedConnector(null);
    }
  }, [isConnected, address, connecting, selectedConnector, onWalletSelected, onClose]);

  if (!isOpen) return null;

  const handleUseFarcasterWallet = async () => {
    setConnecting(true);
    try {
      if (isConnected && address) {
        // Use the currently connected wallet (Farcaster wallet)
        onWalletSelected(connectors[0]);
        onClose();
        setConnecting(false);
      } else {
        // Connect to Farcaster wallet first
        if (connectors[0]) {
          setSelectedConnector(connectors[0]);
          await connect({ connector: connectors[0] });
          // onWalletSelected will be triggered in effect
        }
      }
    } catch (error) {
      console.error('Failed to connect to Farcaster wallet:', error);
      setConnecting(false);
    }
  };

  const handleConnectOtherWallet = async () => {
    setConnecting(true);
    try {
      // First disconnect current wallet if connected
      if (isConnected) {
        await disconnect();
      }

      // Determine which connector to use
      const connector = connectors.length > 1 ? connectors[1] : connectors[0];
      setSelectedConnector(connector);
      await connect({ connector });
    } catch (error) {
      console.error('Failed to connect to external wallet:', error);
      setConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-900 p-6 relative">
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="space-y-6">
          <div className="text-center">
            <Wallet className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {description}
            </p>
          </div>

          <div className="space-y-3">
            {/* Farcaster Wallet Option */}
            <Button
              onClick={handleUseFarcasterWallet}
              disabled={connecting}
              className="w-full p-4 h-auto flex flex-col items-center gap-2"
              variant="default"
            >
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                <span className="font-medium">Use Farcaster Wallet</span>
              </div>
              <span className="text-xs opacity-80">
                {isConnected ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Your connected wallet'}
              </span>
            </Button>

            {/* Other Wallet Option */}
            <Button
              onClick={handleConnectOtherWallet}
              disabled={connecting}
              className="w-full p-4 h-auto flex flex-col items-center gap-2"
              variant="outline"
            >
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                <span className="font-medium">Connect Different Wallet</span>
              </div>
              <span className="text-xs opacity-80">
                Use another wallet for this transaction
              </span>
            </Button>
          </div>

          {connecting && (
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Connecting wallet...
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}