import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Get the FormData from the request
    const formData = await request.formData();
    
    // Get the file from the form data
    const file = formData.get("file") as File;
    const pinataMetadata = formData.get("pinataMetadata") as string;
    const pinataOptions = formData.get("pinataOptions") as string;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    
    // Create a new FormData to send to Pinata
    const pinataFormData = new FormData();
    pinataFormData.append("file", file);
    
    // Add the metadata if provided
    if (pinataMetadata) {
      pinataFormData.append("pinataMetadata", pinataMetadata);
    }
    
    // Add the options if provided
    if (pinataOptions) {
      pinataFormData.append("pinataOptions", pinataOptions);
    }
    
    // Make the request to Pinata API
    const pinataResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWE || process.env.NEXT_PUBLIC_PINATA_API_KEY}`,
      },
      body: pinataFormData,
    });
    
    const data = await pinataResponse.json();
    
    if (!pinataResponse.ok) {
      return NextResponse.json(
        { error: `Failed to upload to Pinata: ${data.error}` },
        { status: 500 }
      );
    }
    
    // If using NFT.Storage instead, replace the Pinata API call with the appropriate NFT.Storage API call
    
    // Return the IPFS hash (CID)
    return NextResponse.json({ ipfsHash: data.IpfsHash }, { status: 200 });
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