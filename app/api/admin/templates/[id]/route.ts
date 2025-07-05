import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { UpdateTemplateRequest } from '@/lib/admin';
import { requireAdminAuth } from '@/lib/admin-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// GET /api/admin/templates/[id] - Get specific template
export const GET = requireAdminAuth(async (_request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from('meme_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Parse text_boxes if needed
    const template = {
      ...data,
      text_boxes: typeof data.text_boxes === 'string' ? JSON.parse(data.text_boxes) : data.text_boxes,
    };

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error in GET /api/admin/templates/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// PUT /api/admin/templates/[id] - Update template
export const PUT = requireAdminAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    const body: Omit<UpdateTemplateRequest, 'id'> = await request.json();
    const { name, image_url, text_boxes } = body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (name !== undefined) {
      updateData.template_id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
    if (image_url !== undefined) {
      updateData.image_url = image_url;
    }
    if (text_boxes !== undefined) {
      updateData.text_boxes = text_boxes;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('meme_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating template:', error);
      return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ template: data });
  } catch (error) {
    console.error('Error in PUT /api/admin/templates/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// DELETE /api/admin/templates/[id] - Delete template
export const DELETE = requireAdminAuth(async (_request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;

    const { error } = await supabase
      .from('meme_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting template:', error);
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/templates/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});