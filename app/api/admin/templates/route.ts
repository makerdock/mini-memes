import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CreateTemplateRequest } from '@/lib/admin';
import { requireAdminAuth } from '@/lib/admin-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// GET /api/admin/templates - Get all templates
export const GET = requireAdminAuth(async () => {
  try {
    const { data, error } = await supabase
      .from('meme_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }

    // Parse text_boxes if needed
    const templates = (data || []).map((row) => ({
      ...row,
      text_boxes: typeof row.text_boxes === 'string' ? JSON.parse(row.text_boxes) : row.text_boxes,
    }));

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error in GET /api/admin/templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// POST /api/admin/templates - Create new template
export const POST = requireAdminAuth(async (request: NextRequest) => {
  try {
    const body: CreateTemplateRequest = await request.json();
    const { name, image_url, text_boxes = [] } = body;

    if (!name || !image_url) {
      return NextResponse.json({ error: 'Name and image_url are required' }, { status: 400 });
    }

    // Generate template_id from name
    const template_id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');

    const { data, error } = await supabase
      .from('meme_templates')
      .insert({
        template_id,
        image_url,
        text_boxes,
        // Add any additional fields if needed
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }

    return NextResponse.json({ template: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});