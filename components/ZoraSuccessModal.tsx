import { X } from "lucide-react";
import { Button } from "./ui/button";

interface ZoraSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: () => void;
  zoraLink: string;
}

export function ZoraSuccessModal({ isOpen, onClose, onShare, zoraLink }: ZoraSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-4 w-80 rounded-md text-black space-y-4 relative">
        <button onClick={onClose} className="absolute right-2 top-2 text-black">
          <X className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-bold text-center">Coin Minted!</h2>
        <div className="flex justify-end gap-2 pt-2">
          <a href={zoraLink} target="_blank" rel="noopener noreferrer">
            <Button type="button">Open in Zora</Button>
          </a>
          <Button type="button" variant="secondary" onClick={onShare}>
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}
