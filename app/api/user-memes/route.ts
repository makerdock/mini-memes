import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const fid = searchParams.get("fid");
        if (!fid) {
            throw new Error("Missing fid");
        }
        const limit = parseInt(searchParams.get("limit") || "12", 10);
        const offset = parseInt(searchParams.get("offset") || "0", 10);

        // Get total count for pagination
        const { count, error: countError } = await supabase
            .from("user_memes")
            .select("*", { count: "exact", head: true })
            .eq("fid", fid);
        if (countError) throw countError;

        const { data, error } = await supabase
            .from("user_memes")
            .select("*")
            .eq("fid", fid)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);
        if (error) throw error;

        return NextResponse.json({ memes: data, total: count });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { fid, image_url, template_id, caption } = body;
        if (!fid || !image_url) {
            throw new Error("Missing required fields");
        }
        const { data, error } = await supabase
            .from("user_memes")
            .insert([{ fid, image_url, template_id, caption }])
            .select()
            .single();
        if (error) throw error;
        return NextResponse.json({ meme: data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
} 