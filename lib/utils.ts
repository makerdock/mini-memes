import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface NFTMetadata {
  name: string
  image: string
  symbol: string
  description: string
}

export const uploadMetadata = async (
  metadataInfo: NFTMetadata,
): Promise<string> => {
  console.log('Starting metadata upload to IPFS:', { name: metadataInfo.name, symbol: metadataInfo.symbol })

  const metadata = {
    name: metadataInfo.name,
    description: metadataInfo.description,
    symbol: metadataInfo.symbol,
    image: metadataInfo.image,
  }

  try {
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY ?? "",
          pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_API_SECRET ?? "",
        },
        body: JSON.stringify(metadata),
      },
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('Failed to upload metadata to IPFS:', err)
      throw new Error(`Error uploading to Pinata: ${err}`)
    }

    const data = (await response.json()) as { IpfsHash: string }
    console.log('Successfully uploaded metadata to IPFS:', { ipfsHash: data.IpfsHash })
    return `https://violet-keen-penguin-762.mypinata.cloud/ipfs/${data.IpfsHash}`
  } catch (error) {
    console.error('Unexpected error during metadata upload:', error)
    throw error
  }
}
