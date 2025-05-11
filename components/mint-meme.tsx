"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Coins } from "lucide-react";

interface MintMemeProps {
  memeImage: string;
  topText: string;
  bottomText: string;
  templateName: string;
}

export function MintMeme({ memeImage, topText }: MintMemeProps) {
  const [title, setTitle] = useState(topText);
  const [description, setDescription] = useState("");
  const [minting, setMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<null | "success" | "error">(null);
  const [ipfsHash, setIpfsHash] = useState("");
  const [txHash, setTxHash] = useState("");

  const handleMint = async () => {
    if (minting) return;

    try {
      setMinting(true);
      setMintStatus(null);

      // Convert data URL to blob if it's a data URL
      let imageBlob;
      if (memeImage.startsWith("data:")) {
        const response = await fetch(memeImage);
        imageBlob = await response.blob();
      } else {
        // Fetch the image if it's a URL
        const response = await fetch(memeImage);
        imageBlob = await response.blob();
      }

      // Create form data for upload
      const formData = new FormData();
      formData.append("file", imageBlob, "meme.png");
      formData.append("title", title);
      formData.append("description", description);

      // Upload to our API endpoint
      const uploadResponse = await fetch("/api/upload-to-ipfs", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload: ${uploadData.error || "Unknown error"}`);
      }

      if (!uploadData.ipfsHash) {
        throw new Error("some error with ipfs hash");
      }

      setIpfsHash(uploadData.ipfsHash);

      // Simulate Zora minting
      setMintStatus("success");
    } catch (error) {
      console.error("Error minting:", error);
      setMintStatus("error");
    } finally {
      setMinting(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e && e.target) {
      setTitle(e.target.value);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e && e.target) {
      setDescription(e.target.value);
    }
  };

  return (
    <div className="p-4 bg-black/50 border-2 border-green-400 rounded-lg">
      <h3 className="text-xl font-comic text-green-400 mb-4">
        <Coins className="inline-block mr-2 h-5 w-5" />
        Mint on Zora
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-comic mb-1 text-yellow-300">Title:</label>
          <Input
            value={title}
            onChange={handleTitleChange}
            className="bg-black/50 border-2 border-green-400 text-white font-comic"
          />
        </div>

        <div>
          <label className="block text-sm font-comic mb-1 text-yellow-300">Description:</label>
          <Textarea
            value={description}
            onChange={handleDescriptionChange}
            rows={2}
            className="bg-black/50 border-2 border-green-400 text-white font-comic resize-none"
          />
        </div>

        <Button
          onClick={handleMint}
          disabled={minting}
          className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 font-comic border-2 border-white"
        >
          {minting ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
              Minting...
            </>
          ) : (
            <>
              <Coins className="mr-2 h-4 w-4" />
              Mint on Zora
            </>
          )}
        </Button>

        {mintStatus === "success" && (
          <div className="p-3 bg-green-900/50 border border-green-400 rounded-md text-sm">
            <p className="font-comic text-green-300">🎉 Successfully minted your meme!</p>
            <div className="mt-2 space-y-1">
              <p className="text-xs">
                <span className="text-yellow-300">IPFS:</span> {ipfsHash.substring(0, 20)}...
              </p>
              <p className="text-xs">
                <span className="text-yellow-300">Transaction:</span> {txHash.substring(0, 20)}...
              </p>
            </div>
          </div>
        )}

        {mintStatus === "error" && (
          <div className="p-3 bg-red-900/50 border border-red-400 rounded-md">
            <p className="font-comic text-red-300">❌ Failed to mint. Please try again.</p>
          </div>
        )}
      </div>
    </div>
  );
}
