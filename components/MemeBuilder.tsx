"use client";

import { sdk } from "@farcaster/frame-sdk";

import { useToast } from "@/hooks/use-toast";
import { getDefaultTextBoxProps } from '@/lib/fabric-defaults';
import type { MemeTemplate } from '@/lib/meme-templates';
import { updateTemplateTextBoxes } from '@/lib/meme-templates';
import { useMemeStore } from '@/stores/use-meme-store';
import { useEditorStore } from '@/stores/useEditorStore';
import { IText } from 'fabric';
import { Minus, Plus, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import EditorCanvas from './EditorCanvas';
import { Button } from "./ui/button";
import { useMiniKit } from '@coinbase/onchainkit/minikit';

// Add MemeApiResponse interface
interface MemeApiResponse {
  meme: {
    id: string;
    fid: string;
    image_url: string;
    template_id: string;
    created_at: string;
    caption: string | null;
    likes_count: number;
  };
}

export function MemeBuilder({ template }: { template?: MemeTemplate; }) {
  const { canvas } = useEditorStore();
  const [saving, setSaving] = useState(false);
  const [savedMeme, setSavedMeme] = useState<MemeApiResponse['meme'] | null>(null);
  const [activeObject, setActiveObject] = useState<any>(null);
  const { toast } = useToast();
  const { context } = useMiniKit();
  const userFid = context?.user.fid;
  const [savingMeme, setSavingMeme] = useState(false);
  const [sharing, setSharing] = useState(false);

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

  // Share the current canvas to Farcaster
  const handleShare = async () => {
    if (!canvas) {
      toast({ title: 'No canvas', description: 'Canvas not ready', variant: 'destructive' });
      return;
    }
    setSharing(true);
    try {
      let currentSavedMeme;
      if (savedMeme) {
        currentSavedMeme = savedMeme;
      } else {
        const result = await saveMemeToDatabase();
        currentSavedMeme = result?.meme;
      }

      console.log("🚀 ~ handleShare ~ currentSavedMeme:", currentSavedMeme);

      if (currentSavedMeme) {
        await sdk.actions.composeCast({
          text: "here is my banger",
          embeds: [currentSavedMeme.image_url],
        });
      } else {
        throw new Error('No meme to share');
      }
      toast({ title: 'Shared!', description: 'Meme shared to Farcaster!', variant: 'default' });
    } catch (error) {
      console.error('Error sharing meme:', error);
      toast({ title: 'Share failed', description: error instanceof Error ? error.message : String(error), variant: 'destructive' });
    } finally {
      setSharing(false);
    }
  };

  const handleSaveMeme = async () => {
    if (!canvas) {
      toast({ title: 'No canvas', description: 'Canvas not ready', variant: 'destructive' });
      return;
    }
    setSavingMeme(true);
    try {
      await saveMemeToDatabase();
      toast({ title: 'Saved!', description: 'Meme saved to your profile!', variant: 'default' });
    } catch (error) {
      console.error('Error saving meme:', error);
      toast({ title: 'Save failed', description: error instanceof Error ? error.message : String(error), variant: 'destructive' });
    } finally {
      setSavingMeme(false);
    }
  };

  const saveMemeToDatabase = async (): Promise<MemeApiResponse | undefined> => {
    if (!canvas) {
      toast({ title: 'No canvas', description: 'Canvas not ready', variant: 'destructive' });
      return;
    }
    try {
      // Export canvas as data URL
      const dataUrl = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 3 });
      // Add watermark
      const watermarkedDataUrl = await addWatermark(dataUrl);
      // Upload to Vercel Blob
      const uploadedUrl = await uploadMemeImage(watermarkedDataUrl);

      // Save meme to database with fid and image_url
      if (!userFid) {
        toast({ title: 'User not found', description: 'No FID found for user', variant: 'destructive' });
        return;
      }
      const response = await fetch('/api/user-memes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fid: userFid,
          image_url: uploadedUrl,
          template_id: template?.id || null,
        }),
      });
      const data: MemeApiResponse = await response.json();
      if (!response.ok) {
        throw new Error((data as any).error || 'Failed to save meme');
      }
      setSavedMeme(data.meme);
      return data;
    } catch (error) {
      console.error('Error saving meme:', error);
      toast({ title: 'Save failed', description: error instanceof Error ? error.message : String(error), variant: 'destructive' });
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
  const handleSaveTemplate = async () => {
    console.log("🚀 ~ handleSave ~ canvas || !template:", canvas, template);

    if (!canvas || !template) {
      console.error('Cannot save: canvas or template is missing.', { canvas, template });
      toast({
        title: 'Save failed',
        description: !canvas && !template
          ? 'Canvas and template are missing.'
          : !canvas
            ? 'Canvas is missing.'
            : 'Template is missing.',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    try {
      // Only save FabricText objects
      const textObjects = canvas.getObjects().filter(obj => obj.type === 'text' || obj.type === 'i-text');
      await updateTemplateTextBoxes(template.id, textObjects.map(obj => obj.toObject()));
      toast({ title: "Saved!", description: "Saved text boxes to Supabase!", variant: "default" });
    } catch (err) {
      toast({ title: "Save failed", description: 'Failed to save: ' + (err instanceof Error ? err.message : err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Delete the selected object from the canvas
  const handleDelete = () => {
    if (!canvas || !activeObject) return;
    canvas.remove(activeObject);
    setActiveObject(null);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  };

  // Upload image to Vercel Blob
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('fileName', file.name);
      const response = await fetch('/api/upload-meme', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok && data.url) {
        toast({ title: 'Upload Successful', description: data.url, variant: 'default' });
      } else {
        toast({ title: 'Upload Failed', description: data.error || 'Unknown error', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Upload Failed', description: error instanceof Error ? error.message : String(error), variant: 'destructive' });
    }
  };

  if (!template) {
    return <div className="text-center p-8 text-xl font-comic text-red-400">Template not found.</div>;
  }

  return (
    <div className="flex flex-col h-full w-full relative">
      <EditorCanvas template={template} />
      {/* Sticky Toolbar at the bottom */}
      <div className="w-full z-50 mt-4">
        <div className=" bg-black/60 rounded-lg shadow-lg p-2 pointer-events-auto border border-white/20 backdrop-blur-md">
          <div className="flex justify-between gap-2 border-white/20 items-center">
            <Button onClick={handleAddText} variant="secondary">Add Text</Button>
            <div className="h-5 border-l border-white/20"></div>
            <Button className='flex-1' onClick={handleSaveMeme} variant="secondary" title="Share to Farcaster" disabled={savingMeme || saving}>
              {savingMeme ? 'Saving...' : 'Save Meme'}
            </Button>
            <Button className='flex-1' onClick={handleShare} variant="secondary" title="Share to Farcaster" disabled={sharing || saving}>
              {sharing ? 'Sharing...' : 'Share'}
            </Button>
          </div>
          {activeObject && (activeObject.type === 'text' || activeObject.type === 'i-text') && (
            <div className="flex justify-between gap-2 border-white/20 items-center">
              <div className="flex items-center gap-1">
                <Button onClick={() => handleScaleChange(0.2, 'inc')} variant="outline" size="icon" title="Increase Scale">
                  <Plus className="w-5 h-5" />
                </Button>
                <Button onClick={() => handleScaleChange(0.2, 'dec')} variant="outline" size="icon" title="Decrease Scale">
                  <Minus className="w-5 h-5" />
                </Button>
              </div>

              {/* Share Button */}
              <Button onClick={handleDelete} variant="destructive" title="Delete Selected" size="icon">
                <Trash className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        <Button className="w-full mt-4" onClick={handleSaveTemplate}>
          {saving ? 'Saving...' : 'Save Template'}
        </Button>

      </div>
    </div>
  );
}
