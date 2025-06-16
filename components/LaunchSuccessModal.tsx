import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "./ui/button"

interface LaunchSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  onShare: () => void
  tokenAddress: string
  imageUrl: string
}

export function LaunchSuccessModal({ isOpen, onClose, onShare, tokenAddress, imageUrl }: LaunchSuccessModalProps) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(tokenAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-black/80 border border-white/20 backdrop-blur-md p-4 w-80 rounded-lg text-white space-y-4 relative">
        <button onClick={onClose} className="absolute right-2 top-2 text-white">
          <X className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-bold text-center">Token Launched!</h2>
        <img src={imageUrl} alt="Token" className="w-full rounded" />
        <div className="flex items-center gap-2 text-xs break-all">
          <span className="flex-1">{tokenAddress}</span>
          <Button type="button" variant="secondary" size="sm" onClick={handleCopy}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onShare}>
            Share
          </Button>
        </div>
      </div>
    </div>
  )
}
