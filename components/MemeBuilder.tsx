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
import { useWalletClient, usePublicClient } from 'wagmi';
import { parseAbiItem } from 'viem';
import { Clanker } from 'clanker-sdk';
import { createCoin } from '@zoralabs/coins-sdk';
import { uploadMetadata } from '@/lib/utils';
import { CoinModal } from './CoinModal';
import { WalletSelectionModal } from './WalletSelectionModal';
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

export function MemeBuilder({ template, templateId }: { template?: MemeTemplate; templateId?: string; }) {
  const { canvas } = useEditorStore();
  const [saving, setSaving] = useState(false);
  const [savedMeme, setSavedMeme] = useState<MemeApiResponse['meme'] | null>(null);
  const [activeObject, setActiveObject] = useState<any>(null);
  const [currentTemplate, setCurrentTemplate] = useState<MemeTemplate | null>(template || null);
  const [loading, setLoading] = useState(!!templateId && !template);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { context } = useMiniKit();
  const userFid = context?.user.fid;
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [savingMeme, setSavingMeme] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [posting, setPosting] = useState(false);
  const [coinModalOpen, setCoinModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'launch' | 'zora' | null>(null);

  const CLANKER_FACTORY_V3_1 = '0x2A787b2362021cC3eEa3C24C4748a6cD5B687382';

  // Fetch template when templateId is provided
  useEffect(() => {
    if (!templateId || template) return;

    async function fetchTemplate() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/meme-template/${templateId}`);
        if (!res.ok) {
          throw new Error('Template not found');
        }
        const templateData = await res.json();
        setCurrentTemplate(templateData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load template');
      } finally {
        setLoading(false);
      }
    }

    fetchTemplate();
  }, [templateId, template]);

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

  const handleLaunchToken = async () => {
    if (!canvas) {
      toast({ title: 'No canvas', description: 'Canvas not ready', variant: 'destructive' });
      return;
    }
    if (!userFid) {
      toast({ title: 'User not found', description: 'No FID found for user', variant: 'destructive' });
      return;
    }

    // Open wallet selection modal
    setPendingAction('launch');
    setWalletModalOpen(true);
  };

  const executeLaunchToken = async (selectedWalletClient: any) => {
    if (!selectedWalletClient || !publicClient) {
      toast({ title: 'Wallet not connected', description: 'Connect your wallet first', variant: 'destructive' });
      return;
    }
    setLaunching(true);
    try {
      let currentSavedMeme = savedMeme;
      if (!currentSavedMeme) {
        const result = await saveMemeToDatabase();
        currentSavedMeme = result?.meme || null;
      }

      if (!currentSavedMeme) {
        throw new Error('No meme image available');
      }

      const startBlock = await publicClient.getBlockNumber();

      const clanker = new Clanker({ wallet: selectedWalletClient, publicClient });

      const tokenAddress = await clanker.deployToken({
        name: 'Meme Token',
        symbol: 'MEME',
        image: currentSavedMeme.image_url,
        metadata: { description: 'Token launched from Mini Memes' },
        context: { interface: 'Mini Memes', platform: 'Mini Memes', messageId: userFid?.toString() || '', id: 'MEME' },
        pool: { quoteToken: '0x4200000000000000000000000000000000000006', initialMarketCap: '1' },
        devBuy: { ethAmount: '0' },
        rewardsConfig: {
          creatorReward: 75,
          creatorAdmin: selectedWalletClient.account.address,
          creatorRewardRecipient: selectedWalletClient.account.address,
          interfaceAdmin: selectedWalletClient.account.address,
          interfaceRewardRecipient: selectedWalletClient.account.address,
        },
      });

      const logs = await publicClient.getLogs({
        address: CLANKER_FACTORY_V3_1,
        event: parseAbiItem('event TokenCreated(address indexed tokenAddress,address indexed creatorAdmin,address indexed interfaceAdmin,address creatorRewardRecipient,address interfaceRewardRecipient,uint256 positionId,string name,string symbol,int24 startingTickIfToken0IsNewToken,string metadata,uint256 amountTokensBought,uint256 vaultDuration,uint8 vaultPercentage,address msgSender)'),
        args: { tokenAddress },
        fromBlock: startBlock,
        toBlock: 'latest',
      });
      const txHash = logs[0]?.transactionHash;

      await fetch('/api/launch-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fid: userFid,
          image_url: currentSavedMeme.image_url,
          token_address: tokenAddress,
          tx_hash: txHash,
        }),
      });

      toast({ title: 'Token Launched!', description: tokenAddress, variant: 'default' });
    } catch (error) {
      console.error('Error launching token:', error);
      toast({ title: 'Launch failed', description: error instanceof Error ? error.message : String(error), variant: 'destructive' });
    } finally {
      setLaunching(false);
    }
  };

  const handlePostToZora = async (data: { name: string; symbol: string; description: string }) => {
    // Store the coin data and open wallet selection
    setPendingAction('zora');
    setWalletModalOpen(true);
    // Store data temporarily for later use
    (window as any).tempCoinData = data;
  };

  const executePostToZora = async (selectedWalletClient: any) => {
    const data = (window as any).tempCoinData;
    if (!selectedWalletClient || !publicClient) {
      toast({ title: 'Wallet not connected', description: 'Connect your wallet first', variant: 'destructive' });
      return;
    }
    setPosting(true);
    try {
      let currentSavedMeme = savedMeme;
      if (!currentSavedMeme) {
        const result = await saveMemeToDatabase();
        currentSavedMeme = result?.meme || null;
      }
      if (!currentSavedMeme) {
        throw new Error('No meme image available');
      }

      const metadataUri = await uploadMetadata({
        name: data.name,
        symbol: data.symbol,
        description: data.description,
        image: currentSavedMeme.image_url,
      });

      console.log("🚀 ~ executePostToZora ~ metadataUri:", metadataUri);

      // Get the wallet client from the connector
      const walletClient = await selectedWalletClient.getWalletClient();
      if (!walletClient) {
        throw new Error('Failed to get wallet client from connector');
      }

      const result = await createCoin(
        {
          name: data.name,
          symbol: data.symbol,
          uri: metadataUri,
          payoutRecipient: walletClient.account.address as `0x${string}`,
          platformReferrer: '0x2CD1353Cf0E402770643B54011A63B546a189c44',
          chainId: 8453, // Base chain ID
        },
        walletClient,
        publicClient,
      );

      toast({ title: 'Coin Minted!', description: result.address, variant: 'default' });
    } catch (error) {
      console.error('Error posting to Zora:', error);
      toast({ title: 'Mint failed', description: error instanceof Error ? error.message : String(error), variant: 'destructive' });
    } finally {
      setPosting(false);
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
          template_id: currentTemplate?.id || null,
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
    console.log("🚀 ~ handleSave ~ canvas || !currentTemplate:", canvas, currentTemplate);

    if (!canvas || !currentTemplate) {
      console.error('Cannot save: canvas or template is missing.', { canvas, currentTemplate });
      toast({
        title: 'Save failed',
        description: !canvas && !currentTemplate
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
      await updateTemplateTextBoxes(currentTemplate.id, textObjects.map(obj => obj.toObject()));
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

  // Handle wallet selection
  const handleWalletSelected = async (selectedWalletClient: any) => {
    if (pendingAction === 'launch') {
      await executeLaunchToken(selectedWalletClient);
    } else if (pendingAction === 'zora') {
      await executePostToZora(selectedWalletClient);
    }
    setPendingAction(null);
  };

  if (loading) {
    return <div className="text-center p-8 text-xl font-comic">Loading template...</div>;
  }

  if (error || !currentTemplate) {
    return <div className="text-center p-8 text-xl font-comic text-red-400">{error || 'Template not found.'}</div>;
  }

  return (
    <div className="flex flex-col h-full w-full relative">
      <EditorCanvas template={currentTemplate} />
      {/* Sticky Toolbar at the bottom */}
      <div className="w-full z-50 mt-4 space-y-2">
        <div className="bg-black/60 rounded-lg shadow-lg p-3 pointer-events-auto border border-white/20 backdrop-blur-md space-y-3">

          {/* Row 1: Editing Tools */}
          <div className="flex items-center gap-2">
            <Button onClick={handleAddText} variant="secondary" className="px-4">
              Add Text
            </Button>
            {activeObject && (activeObject.type === 'text' || activeObject.type === 'i-text') && (
              <>
                <div className="h-5 border-l border-white/30 mx-1"></div>
                <div className="flex items-center gap-1">
                  <Button onClick={() => handleScaleChange(0.2, 'inc')} variant="outline" size="icon" title="Increase Scale">
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => handleScaleChange(0.2, 'dec')} variant="outline" size="icon" title="Decrease Scale">
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleDelete} variant="destructive" title="Delete Selected" size="icon">
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Row 2: Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleSaveMeme} variant="secondary" disabled={savingMeme || saving} className="text-sm">
              {savingMeme ? 'Saving...' : 'Save Meme'}
            </Button>
            <Button onClick={handleShare} variant="secondary" title="Share to Farcaster" disabled={sharing || saving} className="text-sm">
              {sharing ? 'Sharing...' : 'Share'}
            </Button>
            <Button onClick={handleLaunchToken} variant="secondary" disabled={launching || savingMeme || saving} className="text-sm">
              {launching ? 'Launching...' : 'Launch Token'}
            </Button>
            <Button onClick={() => setCoinModalOpen(true)} variant="secondary" disabled={posting || savingMeme || saving} className="text-sm">
              {posting ? 'Minting...' : 'Post to Zora'}
            </Button>
          </div>
        </div>

        {/* Row 3: Template Actions (separate panel) */}
        <Button className="w-full" onClick={handleSaveTemplate} variant="outline">
          {saving ? 'Saving...' : 'Save Template'}
        </Button>
      </div>
      <CoinModal
        isOpen={coinModalOpen}
        onClose={() => setCoinModalOpen(false)}
        onSubmit={handlePostToZora}
        defaultValues={{ name: 'My Coin', symbol: 'COIN', description: '' }}
      />
      <WalletSelectionModal
        isOpen={walletModalOpen}
        onClose={() => {
          setWalletModalOpen(false);
          setPendingAction(null);
        }}
        onWalletSelected={handleWalletSelected}
        title={pendingAction === 'launch' ? 'Launch Token' : 'Mint to Zora'}
        description={
          pendingAction === 'launch'
            ? 'Choose a wallet to launch your meme token'
            : 'Choose a wallet to mint your meme as an NFT'
        }
      />
    </div>
  );
}
