import { NextResponse } from 'next/server';
import { getMemeTemplateById, getTemplateTextBoxes } from '@/lib/meme-templates';

export async function GET(
    req: Request,
    { params }: { params: { id: string; }; }
) {
    try {
        const template = await getMemeTemplateById(params.id);
        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }
        const textBoxes = await getTemplateTextBoxes(params.id);
        return NextResponse.json({ ...template, text_boxes: textBoxes || [] });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
} 