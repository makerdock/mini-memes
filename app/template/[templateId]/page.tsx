'use client'

import { MemeBuilder } from '@/components/MemeBuilder';

export default function TemplatePage({ params }: { params: { templateId: string; }; }) {
    return <MemeBuilder templateId={params.templateId} />;
}