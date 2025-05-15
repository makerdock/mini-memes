"use client";

import { sdk } from "@farcaster/frame-sdk";
import { ArrowDown, ArrowUp, MoveLeft, Share } from "lucide-react";

import { MEME_TEMPLATES } from '@/lib/meme-templates';
import { useMemeStore } from '@/stores/use-meme-store';
import { useEditorStore } from '@/stores/useEditorStore';
import EditorCanvas from './EditorCanvas';
import { MemeTemplateSelector } from "./meme-template-selector";
import { MintMeme } from "./mint-meme";
import { Button } from "./ui/button";
import { Tabs, TabsContent } from "./ui/tabs";

// Helper function to safely get placeholder text
// function getPlaceholderText(templateId: number | string, position: "top" | "bottom"): string {
//   // Convert templateId to number if it's a string
//   const id = typeof templateId === "string" ? Number.parseInt(templateId, 10) : templateId;

//   // Default placeholders if ID is invalid or not found
//   const defaultPlaceholders = {
//     top: "TOP TEXT HERE",
//     bottom: "BOTTOM TEXT HERE",
//   };

//   // Return default if ID is NaN
//   if (isNaN(id)) {
//     return defaultPlaceholders[position];
//   }

//   switch (id) {
//     case 1: // Distracted Boyfriend
//       return position === "top" ? "MY CURRENT PROJECT" : "NEW SHINY TECHNOLOGY";
//     case 2: // Drake
//       return position === "top" ? "USING REGULAR MEME SITES" : "USING MINI-MEMES ON FARCASTER";
//     case 3: // Woman Yelling at Cat
//       return position === "top" ? "ME EXPLAINING WHY I NEED ANOTHER NFT" : "MY WALLET BALANCE";
//     case 4: // Fancy Winnie
//       return position === "top" ? "REGULAR MEMES" : "MEMES MINTED AS NFTS";
//     case 5: // Disaster Girl
//       return position === "top" ? "WATCHING MY FRIENDS" : "STRUGGLE WITH WEB3";
//     case 6: // Anakin & Padme
//       return position === "top" ? "I'M GOING TO MINT JUST ONE NFT" : "RIGHT?";
//     case 7: // Button Choice
//       return position === "top" ? "SAVE MONEY" : "BUY MORE NFTS";
//     case 8: // Always Has Been
//       return position === "top" ? "WAIT, IT'S ALL JUST JPEGS?" : "ALWAYS HAS BEEN";
//     case 9: // Is This a Butterfly
//       return position === "top" ? "IS THIS FINANCIAL FREEDOM?" : "ME LOOKING AT MY NFT COLLECTION";
//     case 10: // Left Exit
//       return position === "top" ? "RESPONSIBLE INVESTING" : "APING INTO MEMECOINS";
//     default:
//       return defaultPlaceholders[position];
//   }
// }
export interface MemeText {
  areaId: string;
  text: string;
  font: string;
  size: number;
  color: string;
  x: number;
  y: number;
}
export interface MemeTemplate {
  id: string;
  templateId: string;
  userId: string;
  textOverlays: MemeText[];
  createdAt: Date;
  imageUrl: string;
}

export function MemeBuilder() {
  const {
    selectedTemplate,
    generatedMeme,
    activeTab,
    setSelectedTemplate,
    setActiveTab,
    updateActiveTextbox
  } = useMemeStore();
  const { activeTextId } = useEditorStore();
  console.log("🚀 ~ MemeBuilder ~ activeTextId:", activeTextId);

  const textOverlays = selectedTemplate.textOverlays;

  const handleTemplateSelect = (template: (typeof MEME_TEMPLATES)[0]) => {
    setSelectedTemplate(template);
  };

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
  //   setSelectedCustomTextId(newitem.areaId);
  // };

  // // Remove a custom text item
  // const removeCustomTextItem = (id: string) => {
  //   setCustomTextItems(customTextItems.filter((item) => item.areaId !== id));
  //   if (selectedCustomTextId === id) {
  //     setSelectedCustomTextId(null);
  //   }
  // };

  // // Update custom text content
  // const updateCustomTextContent = (id: string, text: string) => {
  //   setCustomTextItems(customTextItems.map((item) => (item.areaId === id ? { ...item, text } : item)));
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
            templates={MEME_TEMPLATES}
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
            <div className="relative flex items-center justify-center mt-4 md:mt-0">
              <EditorCanvas
                template={selectedTemplate}
              // activeTextId={activeTextId}
              // setActiveTextId={setActiveTextId}
              // textItems={textItems}
              // setTextItems={setTextItems}
              />
              {activeTextId && (
                <div className="fixed bottom-4 left-0 right-0 mx-auto w-full max-w-md bg-black/80 backdrop-blur-sm border-2 border-cyan-400 rounded-lg p-4 z-50">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={textOverlays.find(item => item.areaId === activeTextId)?.text || ''}
                      onChange={(e) => {
                        const newText = e.target.value.toUpperCase();
                        const activeItem = textOverlays.find(item => item.areaId === activeTextId);
                        if (activeItem) {
                          const textLength = newText.length;
                          const baseSize = 24;
                          const adjustedSize = Math.max(12, baseSize - Math.floor(textLength / 5));

                          updateActiveTextbox(activeTextId, {
                            text: newText,
                            size: adjustedSize
                          });

                          // updateActiveTextbox(textOverlays.map(item =>
                          //   item.areaId === activeTextId ? {
                          //     ...item,
                          //     text: newText,
                          //     size: adjustedSize
                          //   } : item
                          // ));
                        }
                      }}
                      className="flex-1 bg-transparent border-b border-cyan-400 focus:outline-none text-white"
                      placeholder="Enter meme text"
                    />
                    <button
                      onClick={() => {
                        const activeItem = textOverlays.find(item => item.areaId === activeTextId);
                        if (activeItem) {
                          updateActiveTextbox(activeTextId, {
                            size: Math.min(40, activeItem.size + 2)
                          });
                        }
                      }}
                      className="p-2 text-cyan-400 hover:text-white"
                    >
                      <ArrowUp />
                    </button>
                    <button
                      onClick={() => {
                        const activeItem = textOverlays.find(item => item.areaId === activeTextId);
                        if (activeItem) {
                          updateActiveTextbox(activeTextId, {
                            size: Math.max(12, activeItem.size - 2)
                          });
                        }
                      }}
                      className="p-2 text-cyan-400 hover:text-white"
                    >
                      <ArrowDown />
                    </button>
                  </div>
                </div>
              )}
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

                <MintMeme />
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
