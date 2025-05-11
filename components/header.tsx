import Image from "next/image";

export function Header() {
  return (
    <header className="flex flex-col items-center justify-between gap-4 mb-6 sm:flex-row">
      <div className="flex items-center gap-6">
        <div className="relative animate-spin-slow">
          <Image
            src="/vibrant-spinning-star.png"
            alt="Spinning star"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
        <h1 className="text-4xl font-bold text-yellow-300 text-shadow-neon font-comic">Mini-Memes</h1>
        <div className="relative animate-spin-slow">
          <Image
            src="/vibrant-spinning-star.png"
            alt="Spinning star"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
      </div>
      {/* <ConnectButton /> */}
    </header>
  );
}
