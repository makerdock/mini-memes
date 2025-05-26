import { MemeBuilder } from '@/components/MemeBuilder';
import { notFound } from 'next/navigation';

async function fetchTemplate(templateId: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL || ''}/api/meme-template/${templateId}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
}

export default async function TemplatePage({ params }: { params: { templateId: string; }; }) {
    const template = await fetchTemplate(params.templateId);
    if (!template) {
        notFound();
    }
    return <MemeBuilder template={template} />;
}