import { useState } from "react"
import { X, Copy, Check } from "lucide-react"
import { Button } from "./ui/button"
import Image from "next/image"

interface LaunchSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  onShare: () => void
  tokenAddress: string
  imageUrl: string
}

export function LaunchSuccessModal({ isOpen, onClose, onShare, tokenAddress, imageUrl }: LaunchSuccessModalProps) {
  const [copied, setCopied] = useState(false)
  
  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(tokenAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-black/80 border border-white/20 backdrop-blur-md p-4 w-80 rounded-lg text-white space-y-4 relative">
        <button onClick={onClose} className="absolute right-2 top-2 text-white">
          <X className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-bold text-center">Token Launched!</h2>
        
        <div className="flex items-center justify-center gap-2 p-1 bg-white/10 rounded-md">
          <span className="text-[10px] text-gray-300 font-mono truncate">
            {tokenAddress}
          </span>
          <button
            onClick={handleCopyAddress}
            className="text-gray-300 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-2 h-2" /> : <Copy className="w-2 h-2" />}
          </button>
        </div>

        <div className="flex justify-center gap-2 pt-2">
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
  )
}
