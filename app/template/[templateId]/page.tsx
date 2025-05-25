import { MemeBuilder } from '@/components/MemeBuilder';
import { getMemeTemplateById } from '@/lib/meme-templates';
import { notFound } from 'next/navigation';

interface TemplatePageProps {
    params: { templateId: string; };
}

export default function TemplatePage({ params }: TemplatePageProps) {
    const template = getMemeTemplateById(params.templateId);
    if (!template) {
        notFound();
    }
    return (
        <main className="min-h-screen bg-gradient-to-b from-purple-600 via-blue-500 to-pink-500 text-white">
            <div className="container mx-auto px-4 py-8">
                <MemeBuilder template={template} />
            </div>
        </main>
    );
} 