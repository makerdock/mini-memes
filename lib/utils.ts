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
  const metadata = {
    name: metadataInfo.name,
    description: metadataInfo.description,
    symbol: metadataInfo.symbol,
    image: metadataInfo.image,
  }

  const response = await fetch(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY ?? "",
        pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY ?? "",
      },
      body: JSON.stringify(metadata),
    },
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Error uploading to Pinata: ${err}`)
  }

  const data = (await response.json()) as { IpfsHash: string }
  return `https://ipfs.io/ipfs/${data.IpfsHash}`
}
