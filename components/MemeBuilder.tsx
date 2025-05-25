"use client";

import { sdk } from "@farcaster/frame-sdk";
import { Share } from "lucide-react";

import type { MemeTemplate } from '@/lib/meme-templates';
import { useMemeStore } from '@/stores/use-meme-store';
import EditorCanvas from './EditorCanvas';
import { MintMeme } from "./mint-meme";
import { Button } from "./ui/button";
import { Tabs, TabsContent } from "./ui/tabs";

export function MemeBuilder({ template }: { template?: MemeTemplate; }) {
  const {
    generatedMeme,
    activeTab,
    setActiveTab
  } = useMemeStore();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Add a new custom text item
  // const addCustomTextItem = () => {
  //   if (customTextItems.length >= 4) {
  //     alert("You can only add up to 4 custom text items");
  //     return;
  //   }

  //   const newItem: CustomTextItem = {
  //     id: uuidv4(),
  //     text: "",
  //     x: canvasDimensions.width / 2,
  //     y: canvasDimensions.height / 2,
  //     size: 24, // Default font size
  //   };

  //   setCustomTextItems([...customTextItems, newItem]);
  //   setSelectedCustomTextId(newItem.id);
  // };

  // // Remove a custom text item
  // const removeCustomTextItem = (id: string) => {
  //   setCustomTextItems(customTextItems.filter((item) => item.id !== id));
  //   if (selectedCustomTextId === id) {
  //     setSelectedCustomTextId(null);
  //   }
  // };

  // // Update custom text content
  // const updateCustomTextContent = (id: string, text: string) => {
  //   setCustomTextItems(customTextItems.map((item) => (item.id === id ? { ...item, text } : item)));
  // };

  // Sharing functionality for social media - done by Claude
  const handleShare = async () => {
    if (!generatedMeme) return;

    try {
      // Step 1: Add watermark to the image
      const watermarkedImage = await addWatermark(generatedMeme);

      // Step 2: Upload to Vercel Blob
      const uploadedUrl = await uploadMemeImage(watermarkedImage);

      // Step 3: Share to Farcaster
      shareToFarcaster(uploadedUrl);
    } catch (error) {
      console.error("Error sharing meme:", error);
      alert("Failed to share your meme. Please try again.");
    }
  };

  // Add watermark to image
  const addWatermark = async (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        // Create a canvas for the watermarked image
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Draw the original image
        ctx.drawImage(image, 0, 0);

        // Add watermark text
        ctx.font = "bold 16px Arial, sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.textAlign = "end";
        ctx.textBaseline = "bottom";

        // Position in bottom right with padding
        const watermarkText = "mini-memes.com";
        const padding = 10;
        ctx.fillText(watermarkText, canvas.width - padding, canvas.height - padding);

        // Convert to data URL
        const watermarkedDataUrl = canvas.toDataURL("image/png");
        resolve(watermarkedDataUrl);
      };

      image.onerror = () => {
        reject(new Error("Failed to load image for watermarking"));
      };

      image.src = imageUrl;
    });
  };

  // Upload to Vercel Blob
  const uploadMemeImage = async (imageDataUrl: string): Promise<string> => {
    try {
      // Convert data URL to blob
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();

      // Create form data with the file and metadata
      const formData = new FormData();
      formData.append("file", blob, `meme-${Date.now()}.png`);
      // formData.append("fileName", `meme-${selectedTemplate.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`);
      formData.append("fileName", `meme-${Date.now()}.png`);
      // formData.append("description", `${topText} ${bottomText}`.trim() || selectedTemplate.name);

      // Upload via our API route
      const uploadResponse = await fetch("/api/upload-meme", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(`Failed to upload meme: ${errorData.error || 'Unknown error'}`);
      }

      const data = await uploadResponse.json();
      return data.url; // The URL from Vercel Blob
    } catch (error) {
      console.error("Error uploading meme:", error);
      throw error;
    }
  };

  // Share to Farcaster
  const shareToFarcaster = async (imageUrl: string) => {
    try {


      // Prepare the cast text with a description and hashtags
      const text = `Check out my meme created with Mini-Memes!`;

      // Compose a cast with the image as an embed
      await sdk.actions.composeCast({
        text,
        embeds: [imageUrl],
      });
    } catch (error) {
      console.error("Error sharing to Farcaster:", error);
      alert("Failed to open Farcaster. Do you have the Farcaster app installed?");
    }
  };

  if (!template) {
    return <div className="text-center p-8 text-xl font-comic text-red-400">Template not found.</div>;
  }

  return (
    <div className="grid gap-2">
      <EditorCanvas template={template} />
    </div >
  );
}
