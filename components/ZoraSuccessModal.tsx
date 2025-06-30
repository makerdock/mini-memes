import { X, Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import { useState } from "react";

interface ZoraSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: () => void;
  zoraLink: string;
  contractAddress?: string;
}

export function ZoraSuccessModal({ isOpen, onClose, onShare, zoraLink, contractAddress }: ZoraSuccessModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyAddress = async () => {
    if (contractAddress) {
      await navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-black/80 border border-white/20 backdrop-blur-md p-4 w-80 rounded-lg text-white space-y-4 relative">
        <button onClick={onClose} className="absolute right-2 top-2 text-white">
          <X className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-bold text-center">Coined on Zora!</h2>

        {contractAddress && (
          <div className="flex items-center justify-center gap-2 p-1 bg-white/10 rounded-md">
            <span className="text-[10px] text-gray-300 font-mono truncate">
              {contractAddress}
            </span>
            <button
              onClick={handleCopyAddress}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-2 h-2" /> : <Copy className="w-2 h-2" />}
            </button>
          </div>
        )}

        <div className="flex justify-center gap-2 pt-2">
          <a href={zoraLink} target="_blank" rel="noopener noreferrer">
            <Button type="button" className="flex items-center gap-2 bg-white/10 text-white font-bold">
              <Image
                src="/Zorb.svg"
                alt="Zora"
                width={16}
                height={16}
                className="w-4 h-4"
              />
              Open
            </Button>
          </a>
          <Button type="button" onClick={onShare} className="flex items-center gap-2 bg-white/10 font-bold text-white hover:bg-gray-100">
            <Image
              src="/farcaster.png"
              alt="Farcaster"
              width={16}
              height={16}
              className="w-4 h-4"
            />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}
