import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Get the FormData from the request
    const formData = await request.formData();

    // Get the file from the form data
    const file = formData.get("file") as File;
    const metadataStr = formData.get("pinataMetadata") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    let metadata;
    try {
      metadata = JSON.parse(metadataStr);
    } catch (e) {
      metadata = { name: "Mini Meme" };
    }

    const fileName = metadata.name ? metadata.name.replace(/\s+/g, '-').toLowerCase() : 'meme';

    // Create a new FormData for NFT.Storage API
    const nftStorageFormData = new FormData();
    nftStorageFormData.append("file", file, `${fileName}.png`);

    // Create a collection in NFT.Storage (if not already created)
    const collectionID = process.env.NFT_STORAGE_COLLECTION_ID;

    if (!collectionID) {
      // First create a collection if we don't have a collection ID
      try {
        const createCollectionResponse = await fetch('https://preserve.nft.storage/api/v1/collection/create_collection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NFT_STORAGE_API_KEY}`
          },
          body: JSON.stringify({
            contractAddress: "mini-memes-collection",
            collectionName: "Mini Memes",
            chainID: "1", // Ethereum mainnet
            network: "Ethereum"
          })
        });

        const createCollectionData = await createCollectionResponse.json();

        if (!createCollectionResponse.ok) {
          return NextResponse.json(
            { error: `Failed to create collection on NFT.Storage: ${createCollectionData.error}` },
            { status: 500 }
          );
        }
      } catch (error) {
        console.error("Error creating NFT.Storage collection:", error);
      }
    }

    // Upload the file to NFT.Storage
    const uniqueId = Date.now().toString();
    nftStorageFormData.append('collectionID', collectionID || 'mini-memes-collection');

    // For NFT.Storage, we need to create a CSV file with tokenID and cid
    // But since we don't have the CID yet, we need to upload the file first
    // to IPFS directly, then use the returned CID in the CSV

    // Upload to IPFS gateway to get a CID
    const gatewayResponse = await fetch("https://api.nft.storage/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NFT_STORAGE_API_KEY}`,
      },
      body: file,
    });

    const gatewayData = await gatewayResponse.json();

    if (!gatewayResponse.ok) {
      return NextResponse.json(
        { error: `Failed to upload to NFT.Storage gateway: ${gatewayData.error?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    const cid = gatewayData.value.cid;

    // Now create a CSV file with the tokenID and CID
    const csvContent = "tokenID,cid\n" + `${uniqueId},${cid}`;
    const csvBlob = new Blob([csvContent], { type: "text/csv" });
    const csvFile = new File([csvBlob], "tokens.csv", { type: "text/csv" });

    // Create form data for the collection/add_tokens endpoint
    const tokensFormData = new FormData();
    tokensFormData.append("collectionID", collectionID || "mini-memes-collection");
    tokensFormData.append("file", csvFile);

    // Add tokens to the collection
    const addTokensResponse = await fetch("https://preserve.nft.storage/api/v1/collection/add_tokens", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NFT_STORAGE_API_KEY}`,
      },
      body: tokensFormData,
    });

    // Even if add_tokens fails, we can still return the CID
    // since the file is already on IPFS
    if (!addTokensResponse.ok) {
      console.error("Failed to add token to collection, but file is on IPFS");
    }

    // Return the IPFS hash (CID)
    return NextResponse.json({ ipfsHash: cid }, { status: 200 });
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