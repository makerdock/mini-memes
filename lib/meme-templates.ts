import { createClient } from '@supabase/supabase-js';
import { IText } from 'fabric';

export type MemeText = IText;

export interface MemeTemplate {
  id: string;
  template_id: string;
  created_at: string;
  image_url: string;
  text_boxes: MemeText[];
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getAllTemplates(): Promise<MemeTemplate[]> {
  const { data, error } = await supabase
    .from('meme_templates')
    .select('*');
  if (error) throw error;
  // Parse textOverlays if needed
  return (data || []).map((row) => ({
    ...row,
    text_boxes: typeof row.text_boxes === 'string' ? JSON.parse(row.text_boxes) : row.text_boxes,
  })) as MemeTemplate[];
}

/**
 * Converts a filename to a title case string
 * Example: "distracted-boyfriend.jpg" -> "Distracted Boyfriend"
 */
export function filenameToTitle(filename: string): string {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");

  // Replace hyphens and underscores with spaces
  const nameWithSpaces = nameWithoutExt.replace(/[-_]/g, " ");

  // Convert to title case (capitalize first letter of each word)
  return nameWithSpaces
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export async function getMemeTemplateById(id: string): Promise<MemeTemplate | null> {
  const { data, error } = await supabase
    .from('meme_templates')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return {
    ...data,
  } as MemeTemplate;
}

export async function getTemplateTextBoxes(id: string): Promise<MemeText[] | []> {
  const { data, error } = await supabase
    .from('meme_templates')
    .select('text_boxes', { head: false })
    .eq('id', id)
    .single();

  if (error || !data) return [];

  let textBoxes = data.text_boxes;
  try {
    // Recursively parse if string
    while (typeof textBoxes === 'string') {
      textBoxes = JSON.parse(textBoxes);
    }
    // Ensure it's an array before returning
    if (Array.isArray(textBoxes)) {
      return textBoxes;
    } else {
      return [];
    }
  } catch (e) {
    console.error('Error parsing text_boxes:', e);
    return [];
  }
}

/**
 * Updates the text_boxes of a meme template in Supabase
 */
export async function updateTemplateTextBoxes(id: string, text_boxes: MemeText[]): Promise<void> {
  console.log("🚀 ~ saving ~ text_boxes:", text_boxes);
  const { error } = await supabase
    .from('meme_templates')
    .update({ text_boxes: text_boxes })
    .eq('id', id);
  if (error) throw error;
}
