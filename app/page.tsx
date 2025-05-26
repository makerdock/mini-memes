import { TemplateGallery } from '@/components/TemplateGallery';
import { Footer } from "../components/footer";
import { Header } from "../components/header";
import type { MemeTemplate } from "../lib/meme-templates";
import { getAllTemplates } from "../lib/meme-templates";

export default async function Home() {
  let templates: MemeTemplate[] = [];
  let error: string | null = null;
  try {
    templates = await getAllTemplates();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load templates';
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-600 via-blue-500 to-pink-500 text-white">
      <div className="container mx-auto px-4">
        <Header />
        <h2 className="text-2xl font-bold mb-6 text-center">Choose a Meme Template</h2>
        <TemplateGallery templates={templates} error={error} />
        <Footer />
      </div>
    </main>
  );
}
