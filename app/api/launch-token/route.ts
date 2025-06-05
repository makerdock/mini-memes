import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fid,
      image_url,
      token_address,
      tx_hash,
      name = 'Meme Token',
      symbol = 'MEME',
    } = body;

    if (!fid || !image_url || !token_address || !tx_hash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_tokens')
      .insert([{ fid, image_url, token_address, tx_hash, name, symbol }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ token: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save token' }, { status: 500 });
  }
}
