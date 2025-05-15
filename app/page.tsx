import { Footer } from "../components/footer";
import { Header } from "../components/header";
import { MemeBuilder } from "../components/MemeBuilder";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-600 via-blue-500 to-pink-500 text-white">
      <div className="container mx-auto px-4 py-8">
        <Header />
        <MemeBuilder />
        <Footer />
      </div>
    </main>
  );
}
