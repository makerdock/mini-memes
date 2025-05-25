import Link from "next/link";

export function Footer() {
  return (
    <footer className="pb-4 text-center">
      <div className="p-4 bg-black/30 backdrop-blur-sm border-2 border-cyan-400 rounded-lg">
        <p className="text-sm font-comic">
          <span className="text-yellow-300">Mini-Memes</span> © {new Date().getFullYear()} |
          <Link
            href="https://warpcast.com/atown"
            target="_blank"
            rel="noopener noreferrer"
            className="blink ml-1 hover:text-pink-300 transition-colors"
          >
            Made with 💖 for Farcaster by atown
          </Link>
        </p>
        <p className="text-xs mt-2 text-cyan-200">Best viewed in Netscape Navigator 4.0 at 800x600 resolution</p>
        <div className="mt-4 flex justify-center gap-4">
          <div className="visitor-counter px-3 py-1 bg-black border border-white rounded-md">
            <span className="text-green-400 font-mono text-sm">Visitors: 42069</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
