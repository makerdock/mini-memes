import { Footer } from "../components/footer";
import { Header } from "../components/header";
import { MemeGenerator } from "../components/meme-generator";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-600 via-blue-500 to-pink-500 text-white">
      <div className="container mx-auto px-4 py-8">
        <Header />
        {/* <Marquee text="✨ WELCOME TO MINI-MEMES - THE ULTIMATE 90s MEME EXPERIENCE - MINT YOUR MEMES ON ZORA - SHARE ON FARCASTER - BE INTERNET FAMOUS ✨" /> */}
        <MemeGenerator />
        <Footer />
      </div>
    </main>
  );
}
