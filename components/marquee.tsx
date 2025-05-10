interface MarqueeProps {
  text: string
}

export function Marquee({ text }: MarqueeProps) {
  return (
    <div className="w-full overflow-hidden bg-black border-y-2 border-yellow-300 py-2 my-4">
      <div className="animate-marquee whitespace-nowrap">
        <span className="text-xl font-bold text-yellow-300 font-comic mx-4">{text}</span>
        <span className="text-xl font-bold text-yellow-300 font-comic mx-4">{text}</span>
      </div>
    </div>
  )
}
