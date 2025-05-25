"use client";

import { Footer } from "../components/footer";
import { Header } from "../components/header";
import Link from "next/link";
import { getAllTemplates } from "../lib/meme-templates";
import { useEffect, useState } from "react";
import type { MemeTemplate } from "../lib/meme-templates";
import { Skeleton } from "../components/ui/skeleton";

export default function Home() {
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  console.log("🚀 ~ Home ~ templates:", templates);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const fetchedTemplates = await getAllTemplates();
        setTemplates(fetchedTemplates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-600 via-blue-500 to-pink-500 text-white">
      <div className="container mx-auto px-4">
        <Header />
        <h2 className="text-2xl font-bold mb-6 text-center">Choose a Meme Template</h2>
        {loading && <div className="text-center text-lg">Loading templates...</div>}
        {error && <div className="text-center text-red-400">{error}</div>}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-8">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="block bg-black/30 border-2 border-cyan-400 rounded-md p-4">
                <Skeleton className="w-full h-48 mb-2" />
              </div>
            ))
            : templates.map((template: MemeTemplate) => (
              <Link
                key={template.id}
                href={`/template/${template.id}`}
                className="block bg-black/30 border-2 border-cyan-400 rounded-md hover:bg-black/50 transition"
              >
                <img
                  src={template.image_url}
                  alt={template.template_id}
                  className="w-full h-48 object-cover rounded"
                />
              </Link>
            ))}
        </div>
        <Footer />
      </div>
    </main>
  );
}
