import { MemeBuilder } from '@/components/MemeBuilder';
import { getMemeTemplateById } from '@/lib/meme-templates';
import { notFound } from 'next/navigation';

export default async function TemplatePage({ params }: { params: { templateId: string; }; }) {
    const template = await getMemeTemplateById(params.templateId);
    if (!template) {
        notFound();
    }
    return (
        <MemeBuilder template={template} />
    );
} 