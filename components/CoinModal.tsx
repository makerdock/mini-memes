import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"

interface CoinModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; symbol: string; description: string }) => void
  defaultValues: {
    name: string
    symbol: string
    description: string
  }
}

export function CoinModal({ isOpen, onClose, onSubmit, defaultValues }: CoinModalProps) {
  const [name, setName] = useState(defaultValues.name)
  const [symbol, setSymbol] = useState(defaultValues.symbol)
  const [description, setDescription] = useState(defaultValues.description)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, symbol: symbol.toUpperCase(), description })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-4 w-80 rounded-md text-black space-y-4">
        <h2 className="text-lg font-bold text-center">Post to Zora</h2>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="block text-sm mb-1" htmlFor="coin-name">Coin Name</label>
            <Input id="coin-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="coin-symbol">Symbol</label>
            <Input id="coin-symbol" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} required />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="coin-desc">Description</label>
            <Textarea id="coin-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">Mint Coin</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
