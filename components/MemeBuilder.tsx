"use client";

import { sdk } from "@farcaster/frame-sdk";

import { getDefaultTextBoxProps } from '@/lib/fabric-defaults';
import type { MemeTemplate } from '@/lib/meme-templates';
import { updateTemplateTextBoxes } from '@/lib/meme-templates';
import { useMemeStore } from '@/stores/use-meme-store';
import { useEditorStore } from '@/stores/useEditorStore';
import { IText } from 'fabric';
import { useState, useEffect, useCallback } from 'react';
import EditorCanvas from './EditorCanvas';
import { Button } from "./ui/button";

export function MemeBuilder({ template }: { template?: MemeTemplate; }) {
  const {
    generatedMeme,
    activeTab,
    setActiveTab
  } = useMemeStore();
  const { canvas } = useEditorStore();
  const [saving, setSaving] = useState(false);
  // const [scaleStep, setScaleStep] = useState(0.1);
  // const [lastScaleDirection, setLastScaleDirection] = useState<'inc' | 'dec' | null>(null);
  const [activeObject, setActiveObject] = useState<any>(null);

  // Listen for active object changes on the canvas
  useEffect(() => {
    if (!canvas) return;
    const handleSelection = () => {
      setActiveObject(canvas.getActiveObject());
    };
    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', () => setActiveObject(null));
    // Set initial active object
    setActiveObject(canvas.getActiveObject());
    return () => {
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('selection:cleared');
    };
  }, [canvas]);

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

  // Add a new text element to the canvas
  const handleAddText = () => {
    if (!canvas) return;
    const text = new IText('New Text', {
      ...getDefaultTextBoxProps(),
      left: 50,
      top: 50,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  };

  // Scale handlers
  const handleScaleChange = (delta: number, direction: 'inc' | 'dec') => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && (active.type === 'text' || active.type === 'i-text')) {
      const step = delta;
      const currentScale = active.scaleX || 1;
      const newScale = Math.max(0.1, currentScale + (direction === 'inc' ? step : -step));
      active.set({ scaleX: newScale, scaleY: newScale });
      active.setCoords();
      canvas.setActiveObject(active);
      canvas.requestRenderAll();
    }
  };

  // Save all text objects to Supabase
  const handleSave = async () => {
    if (!canvas || !template) return;
    setSaving(true);
    try {
      // Only save FabricText objects
      const textObjects = canvas.getObjects().filter(obj => obj.type === 'text' || obj.type === 'i-text');
      await updateTemplateTextBoxes(template.id, textObjects.map(obj => obj.toJSON()));
      alert('Saved text boxes to Supabase!');
    } catch (err) {
      alert('Failed to save: ' + (err instanceof Error ? err.message : err));
    } finally {
      setSaving(false);
    }
  };

  if (!template) {
    return <div className="text-center p-8 text-xl font-comic text-red-400">Template not found.</div>;
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Toolbar */}
      <div className="flex gap-2 mb-2">
        <Button onClick={handleAddText} variant="secondary">Add Text</Button>
        <Button onClick={handleSave} disabled={saving} variant="default">
          {saving ? 'Saving...' : 'Save Template'}
        </Button>
        {/* Scale controls */}

        {/* Font size controls - only show if active object is text */}
        {activeObject && (activeObject.type === 'text' || activeObject.type === 'i-text') && (
          <div className="flex items-center gap-1">
            <Button onClick={() => handleScaleChange(0.2, 'inc')} variant="outline" title="Increase Scale">+</Button>
            <Button onClick={() => handleScaleChange(0.2, 'dec')} variant="outline" title="Decrease Scale">-</Button>
          </div>
        )}
      </div>
      <EditorCanvas template={template} />
    </div>
  );
}
