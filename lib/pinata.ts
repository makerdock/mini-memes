/**
 * Uploads an image to IPFS using Pinata
 */
export async function uploadToIPFS(imageUrl: string, title: string, description: string): Promise<string> {
  try {
    // Convert the image URL to a blob
    const response = await fetch(imageUrl)
    const blob = await response.blob()

    // Create a FormData object to send to Pinata
    const formData = new FormData()

    // Add the image file
    formData.append("file", blob, "meme.png")

    // Add metadata
    const metadata = JSON.stringify({
      name: title,
      keyvalues: {
        description,
        createdAt: new Date().toISOString(),
      },
    })
    formData.append("pinataMetadata", metadata)

    // Add options for Pinata
    const options = JSON.stringify({
      cidVersion: 0,
    })
    formData.append("pinataOptions", options)

    // Make the request to Pinata API
    const pinataResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWE}`,
      },
      body: formData,
    })

    const data = await pinataResponse.json()

    if (!pinataResponse.ok) {
      throw new Error(`Failed to upload to Pinata: ${data.error}`)
    }

    // Return the IPFS hash (CID)
    return data.IpfsHash
  } catch (error) {
    console.error("Error uploading to IPFS:", error)
    throw error
  }
}

/**
 * Creates metadata for the NFT and uploads it to IPFS
 */
export async function createAndUploadMetadata(
  imageIpfsHash: string,
  title: string,
  description: string,
): Promise<string> {
  try {
    // Create the metadata object
    const metadata = {
      name: title,
      description,
      image: `ipfs://${imageIpfsHash}`,
      attributes: [
        {
          trait_type: "Type",
          value: "Meme",
        },
        {
          trait_type: "Platform",
          value: "Mini-Memes",
        },
        {
          trait_type: "Created",
          value: new Date().toISOString(),
        },
      ],
    }

    // Convert metadata to JSON string
    const metadataString = JSON.stringify(metadata)

    // Convert the string to a Blob
    const metadataBlob = new Blob([metadataString], { type: "application/json" })

    // Create a FormData object to send to Pinata
    const formData = new FormData()

    // Add the metadata file
    formData.append("file", metadataBlob, "metadata.json")

    // Add metadata for Pinata
    const pinataMetadata = JSON.stringify({
      name: `${title} - Metadata`,
    })
    formData.append("pinataMetadata", pinataMetadata)

    // Add options for Pinata
    const options = JSON.stringify({
      cidVersion: 0,
    })
    formData.append("pinataOptions", options)

    // Make the request to Pinata API
    const pinataResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWE}`,
      },
      body: formData,
    })

    const data = await pinataResponse.json()

    if (!pinataResponse.ok) {
      throw new Error(`Failed to upload metadata to Pinata: ${data.error}`)
    }

    // Return the IPFS hash (CID) of the metadata
    return data.IpfsHash
  } catch (error) {
    console.error("Error creating and uploading metadata:", error)
    throw error
  }
}
