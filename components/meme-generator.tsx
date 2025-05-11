"use client";

import { MoveLeft, Plus, Share } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { DraggableTextInput } from "../components/draggable-text-input";
import { MemeEditor, type CustomTextItem } from "../components/meme-editor";
import { MemeTemplateSelector } from "../components/meme-template-selector";
import { MintMeme } from "../components/mint-meme";
import { Button } from "../components/ui/button";
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { memeTemplates } from "../lib/meme-templates";
import { v4 as uuidv4 } from "../lib/uuid";
import { sdk } from "@farcaster/frame-sdk";

// Helper function to safely get placeholder text
function getPlaceholderText(templateId: number | string, position: "top" | "bottom"): string {
  // Convert templateId to number if it's a string
  const id = typeof templateId === "string" ? Number.parseInt(templateId, 10) : templateId;

  // Default placeholders if ID is invalid or not found
  const defaultPlaceholders = {
    top: "TOP TEXT HERE",
    bottom: "BOTTOM TEXT HERE",
  };

  // Return default if ID is NaN
  if (isNaN(id)) {
    return defaultPlaceholders[position];
  }

  switch (id) {
    case 1: // Distracted Boyfriend
      return position === "top" ? "MY CURRENT PROJECT" : "NEW SHINY TECHNOLOGY";
    case 2: // Drake
      return position === "top" ? "USING REGULAR MEME SITES" : "USING MINI-MEMES ON FARCASTER";
    case 3: // Woman Yelling at Cat
      return position === "top" ? "ME EXPLAINING WHY I NEED ANOTHER NFT" : "MY WALLET BALANCE";
    case 4: // Fancy Winnie
      return position === "top" ? "REGULAR MEMES" : "MEMES MINTED AS NFTS";
    case 5: // Disaster Girl
      return position === "top" ? "WATCHING MY FRIENDS" : "STRUGGLE WITH WEB3";
    case 6: // Anakin & Padme
      return position === "top" ? "I'M GOING TO MINT JUST ONE NFT" : "RIGHT?";
    case 7: // Button Choice
      return position === "top" ? "SAVE MONEY" : "BUY MORE NFTS";
    case 8: // Always Has Been
      return position === "top" ? "WAIT, IT'S ALL JUST JPEGS?" : "ALWAYS HAS BEEN";
    case 9: // Is This a Butterfly
      return position === "top" ? "IS THIS FINANCIAL FREEDOM?" : "ME LOOKING AT MY NFT COLLECTION";
    case 10: // Left Exit
      return position === "top" ? "RESPONSIBLE INVESTING" : "APING INTO MEMECOINS";
    default:
      return defaultPlaceholders[position];
  }
}

export function MemeGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState(memeTemplates[0]);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [customTextItems, setCustomTextItems] = useState<CustomTextItem[]>([]);
  const [selectedCustomTextId, setSelectedCustomTextId] = useState<string | null>(null);
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("create");
  const editorRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  // const isMobile = useMediaQuery("(max-width: 640px)");

  // Update canvas dimensions when the editor is mounted
  useEffect(() => {
    if (editorRef.current) {
      const canvas = editorRef.current.querySelector("canvas");
      if (canvas) {
        setCanvasDimensions({ width: canvas.width, height: canvas.height });
      }
    }
  }, [selectedTemplate]);

  const handleTemplateSelect = (template: (typeof memeTemplates)[0]) => {
    setSelectedTemplate(template);
  };

  const handleTopTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e && e.target) {
      setTopText(e.target.value);
    }
  };

  const handleBottomTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e && e.target) {
      setBottomText(e.target.value);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Add a new custom text item
  const addCustomTextItem = () => {
    if (customTextItems.length >= 4) {
      alert("You can only add up to 4 custom text items");
      return;
    }

    const newItem: CustomTextItem = {
      id: uuidv4(),
      text: "",
      x: canvasDimensions.width / 2,
      y: canvasDimensions.height / 2,
      size: 24, // Default font size
    };

    setCustomTextItems([...customTextItems, newItem]);
    setSelectedCustomTextId(newItem.id);
  };

  // Remove a custom text item
  const removeCustomTextItem = (id: string) => {
    setCustomTextItems(customTextItems.filter((item) => item.id !== id));
    if (selectedCustomTextId === id) {
      setSelectedCustomTextId(null);
    }
  };

  // Update custom text content
  const updateCustomTextContent = (id: string, text: string) => {
    setCustomTextItems(customTextItems.map((item) => (item.id === id ? { ...item, text } : item)));
  };

  // Update custom text position
  const updateCustomTextPosition = (id: string, x: number, y: number) => {
    setCustomTextItems(customTextItems.map((item) => (item.id === id ? { ...item, x, y } : item)));
  };

  // Update custom text size
  const updateCustomTextSize = (id: string, size: number) => {
    setCustomTextItems(customTextItems.map((item) => (item.id === id ? { ...item, size } : item)));
  };

  // Select a custom text item
  const selectCustomText = (id: string) => {
    setSelectedCustomTextId(id);
  };

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
      formData.append("fileName", `meme-${selectedTemplate.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`);
      formData.append("description", `${topText} ${bottomText}`.trim() || selectedTemplate.name);

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
      const text = `Check out my meme created with Mini-Memes! ${topText ? `"${topText}"` : ""} ${bottomText ? `"${bottomText}"` : ""} #minimemes #farcaster`;

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

  const generateMeme = async () => {
    if (!editorRef.current) return;

    try {
      // Get the canvas element from the MemeEditor component
      const canvas = editorRef.current.querySelector("canvas");
      if (!canvas) return;

      // Create a temporary canvas to draw everything including custom text
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");

      if (!tempCtx) return;

      // Draw the original canvas content (template with top/bottom text)
      tempCtx.drawImage(canvas, 0, 0);

      // Draw all custom text items
      customTextItems.forEach((item) => {
        if (!item.text.trim()) return;

        // Set font size based on the item's size property
        tempCtx.font = `bold ${item.size}px Impact, sans-serif`;
        tempCtx.textAlign = "center";
        tempCtx.lineWidth = Math.max(2, item.size / 12); // Scale outline with font size

        // Draw text with outline
        tempCtx.strokeStyle = "black";
        tempCtx.fillStyle = "white";
        tempCtx.textBaseline = "middle";

        // Draw the text at the exact position where it was placed
        tempCtx.strokeText(item.text.toUpperCase(), item.x, item.y);
        tempCtx.fillText(item.text.toUpperCase(), item.x, item.y);
      });

      // Convert canvas to data URL
      const dataUrl = tempCanvas.toDataURL("image/png");

      // Set the generated meme
      setGeneratedMeme(dataUrl);
      setActiveTab("share");
    } catch (error) {
      console.error("Error generating meme:", error);
    }
  };

  // Safe access to template ID
  const templateId = selectedTemplate?.id || 1;

  return (
    <div className="grid gap-2">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* <TabsList className="grid w-full grid-cols-3 bg-black/30 border-2 border-cyan-400 sticky top-2 z-20 backdrop-blur-sm">
          <TabsTrigger
            value="create"
            className="font-comic text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 px-1 sm:px-4"
          >
            Choose Template
          </TabsTrigger>
          <TabsTrigger
            value="edit"
            className="font-comic text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 px-1 sm:px-4"
          >
            Add Text
          </TabsTrigger>
          <TabsTrigger
            value="share"
            className="font-comic text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 px-1 sm:px-4"
          >
            Mint & Share
          </TabsTrigger>
        </TabsList> */}

        <TabsContent value="create" className="border-2 border-cyan-400 rounded-md p-2 sm:p-4 bg-black/30">
          <MemeTemplateSelector
            templates={memeTemplates}
            selectedTemplate={selectedTemplate}
            onSelect={handleTemplateSelect}
            onNextClick={() => setActiveTab("edit")}
          />
        </TabsContent>

        <TabsContent value="edit" className="border-2 border-cyan-400 rounded-md p-2 sm:p-4 bg-black/30">
          <div className='flex items-center space-x-2 mb-4'>
            <div
              onClick={() => setActiveTab("create")}
              className='py-2 px-4 flex items-center space-x-2 bg-white/10 rounded-sm w-fit mb-2'>
              <MoveLeft className='h-4 w-4' />
            </div>
            <h3 className='text-xl font-comic text-yellow-300 mb-2 text-center'>Add Text</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-comic mb-2 text-yellow-300">Top Text:</label>
                <Input
                  value={topText}
                  onChange={handleTopTextChange}
                  placeholder={getPlaceholderText(templateId, "top")}
                  className="bg-black/50 border-2 border-pink-400 text-white font-comic"
                />
              </div>
              <div>
                <label className="block text-lg font-comic mb-2 text-yellow-300">Bottom Text:</label>
                <Input
                  value={bottomText}
                  onChange={handleBottomTextChange}
                  placeholder={getPlaceholderText(templateId, "bottom")}
                  className="bg-black/50 border-2 border-pink-400 text-white font-comic"
                />
              </div>

              {/* Custom Text Placement Section */}
              <div className="mt-6 pt-4 border-t-2 border-purple-400">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-base sm:text-lg font-comic text-purple-300">Custom Text:</label>
                  <Button
                    onClick={addCustomTextItem}
                    disabled={customTextItems.length >= 4}
                    size="sm"
                    className="bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 font-comic border-2 border-white"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    <span className="text-xs sm:text-sm">Add Text</span>
                  </Button>
                </div>

                {customTextItems.length === 0 ? (
                  <p className="text-sm text-gray-300 italic">
                    Add up to 4 custom text elements that you can drag, resize, and position anywhere on the meme.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {customTextItems.map((item) => (
                      <DraggableTextInput
                        key={item.id}
                        id={item.id}
                        value={item.text}
                        onChange={updateCustomTextContent}
                        onRemove={removeCustomTextItem}
                      />
                    ))}

                    {customTextItems.length > 0 && (
                      <p className="text-xs text-yellow-200 mt-2">
                        Tip: Click and drag text elements on the meme to position them. Use the size controls to resize
                        text.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-center mt-6">
                <Button
                  onClick={generateMeme}
                  className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 font-comic border-2 border-white"
                >
                  Generate Meme
                </Button>
              </div>
            </div>

            <div ref={editorRef} className="relative flex items-center justify-center mt-4 md:mt-0">
              <MemeEditor
                template={selectedTemplate}
                topText={topText}
                bottomText={bottomText}
                customTextItems={customTextItems}
                onCustomTextPositionChange={updateCustomTextPosition}
                onCustomTextSizeChange={updateCustomTextSize}
                onSelectCustomText={selectCustomText}
                selectedCustomTextId={selectedCustomTextId ?? undefined}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="share" className="border-2 border-cyan-400 rounded-md p-2 sm:p-4 bg-black/30">
          <div className='flex items-center space-x-2 mb-4'>
            <div
              onClick={() => setActiveTab("edit")}
              className='py-2 px-4 flex items-center space-x-2 bg-white/10 rounded-sm w-fit mb-2'>
              <MoveLeft className='h-4 w-4' />
            </div>
            <h3 className='text-xl font-comic text-yellow-300 mb-2 text-center'>Your Meme is Ready!</h3>
          </div>

          {generatedMeme ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-full max-w-md mb-4">
                  <img
                    src={generatedMeme || "/placeholder.svg"}
                    alt="Generated meme"
                    className="w-full h-auto rounded-md shadow-neon"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Button
                    onClick={handleShare}
                    className="bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 font-comic border-2 border-white w-full">
                    <Share className="mr-1 sm:mr-2 h-4 w-4" />
                    <span className="text-xs sm:text-sm">Share</span>
                  </Button>
                </div>

                <MintMeme
                  memeImage={generatedMeme}
                  topText={topText}
                  bottomText={bottomText}
                  templateName={selectedTemplate.name}
                />
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-xl font-comic">Generate your meme first!</p>
              <Button
                onClick={() => setActiveTab("edit")}
                className="mt-4 bg-gradient-to-r from-pink-400 to-purple-600 hover:from-pink-500 hover:to-purple-700 font-comic border-2 border-white"
              >
                Go Back to Editor
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
