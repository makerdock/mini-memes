import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

// Using the new Route Segment Config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // Get the FormData from the request
    const formData = await request.formData();
    
    // Get the file and metadata from the form data
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string || `meme-${Date.now()}.png`;
    const description = formData.get("description") as string || "Mini Meme";
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    
    // Upload file to Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
      addRandomSuffix: true, // Add a random suffix to avoid name collisions
      contentType: file.type,
      // Remove meta as it's not supported in the current version
    });
    
    // Return success with the URL of the uploaded file
    return NextResponse.json({
      url: blob.url,
      success: true,
    }, { status: 200 });
  } catch (error) {
    console.error("Error uploading meme:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}