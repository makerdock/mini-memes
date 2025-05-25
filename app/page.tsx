import { Footer } from "../components/footer";
import { Header } from "../components/header";
import Link from "next/link";
import { MEME_TEMPLATES } from "../lib/meme-templates";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-600 via-blue-500 to-pink-500 text-white">
      <div className="container mx-auto px-4 py-8">
        <Header />
        <h2 className="text-2xl font-bold mb-6 text-center">Choose a Meme Template</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {MEME_TEMPLATES.map((template) => (
            <Link
              key={template.id}
              href={`/template/${template.id}`}
              className="block bg-black/30 border-2 border-cyan-400 rounded-md p-4 hover:bg-black/50 transition"
            >
              <img
                src={template.imageUrl}
                alt={template.templateId}
                className="w-full h-48 object-cover rounded mb-2"
              />
              <div className="text-center font-comic text-lg text-yellow-300">
                {template.templateId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </div>
            </Link>
          ))}
        </div>
        <Footer />
      </div>
    </main>
  );
}
