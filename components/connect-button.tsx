"use client";

import { useState } from "react";
import { Button } from "../components/ui/button";
import { Wallet } from "lucide-react";

export function ConnectButton() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");

  const connectWallet = async () => {
    // This would be replaced with actual wallet connection logic
    try {
      // Simulate wallet connection
      setConnected(true);
      setAddress("0x1234...5678");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={connectWallet}
        className={`font-comic ${connected
            ? "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700"
            : "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          } text-white border-2 border-white shadow-neon`}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {connected ? "Connected" : "Connect Wallet"}
      </Button>
      {connected && <span className="text-xs bg-black/50 px-2 py-1 rounded-md border border-green-400">{address}</span>}
    </div>
  );
}
