import { Footer } from "../components/footer";
import { Header } from "../components/header";
import Link from "next/link";
import { getAllTemplates } from "../lib/meme-templates";
import { useEffect, useState } from "react";
import type { MemeTemplate } from "../lib/meme-templates";

export default function Home() {
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllTemplates()
      .then((templates) => setTemplates(templates))
      .catch((err) => setError(err.message || 'Failed to load templates'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-600 via-blue-500 to-pink-500 text-white">
      <div className="container mx-auto px-4 py-8">
        <Header />
        <h2 className="text-2xl font-bold mb-6 text-center">Choose a Meme Template</h2>
        {loading && <div className="text-center text-lg">Loading templates...</div>}
        {error && <div className="text-center text-red-400">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {templates.map((template: MemeTemplate) => (
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
                {template.templateId.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
              </div>
            </Link>
          ))}
        </div>
        <Footer />
      </div>
    </main>
  );
}
