import { MemeBuilder } from '@/components/MemeBuilder';
import { getMemeTemplateById, getTemplateTextBoxes } from '@/lib/meme-templates';
import { notFound } from 'next/navigation';

export default async function TemplatePage({ params }: { params: { templateId: string; }; }) {
    const template = await getMemeTemplateById(params.templateId);
    const textBoxes = await getTemplateTextBoxes(params.templateId) || [];

    if (!template) {
        notFound();
    }
    return (
        <MemeBuilder template={{ ...template, text_boxes: textBoxes || [] }} />
    );
} 