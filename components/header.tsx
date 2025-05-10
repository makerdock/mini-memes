import Image from "next/image";
import { ConnectButton } from "../components/connect-button";

export function Header() {
  return (
    <header className="flex flex-col items-center justify-between gap-4 mb-8 sm:flex-row">
      <div className="flex items-center gap-2">
        <div className="relative w-12 h-12 animate-spin-slow">
          <Image
            src="/vibrant-spinning-star.png"
            alt="Spinning star"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
        <h1 className="text-4xl font-bold text-yellow-300 text-shadow-neon font-comic">Mini-Memes</h1>
        <div className="relative w-12 h-12 animate-spin-slow">
          <Image
            src="/vibrant-spinning-star.png"
            alt="Spinning star"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
      </div>
      <ConnectButton />
    </header>
  );
}
