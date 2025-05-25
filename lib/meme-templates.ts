import { createClient } from '@supabase/supabase-js';

export interface MemeText {
  areaId: string;
  text: string;
  font: string;
  size: number;
  color: string;
  x: number;
  y: number;
}

export interface MemeTemplate {
  id: string;
  templateId: string;
  userId: string;
  textOverlays: MemeText[];
  createdAt: string; // ISO string from DB
  imageUrl: string;
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
    textOverlays: typeof row.textOverlays === 'string' ? JSON.parse(row.textOverlays) : row.textOverlays,
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
    textOverlays: typeof data.textOverlays === 'string' ? JSON.parse(data.textOverlays) : data.textOverlays,
  } as MemeTemplate;
}
