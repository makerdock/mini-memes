"use client";

import { useToast } from "@/hooks/use-toast";
import { getDefaultTextBoxProps } from '@/lib/fabric-defaults';
import type { MemeTemplate } from '@/lib/meme-templates';
import { updateTemplateTextBoxes } from '@/lib/meme-templates';
import { useMemeStore } from '@/stores/use-meme-store';
import { useEditorStore } from '@/stores/useEditorStore';
import { Text } from 'fabric';
import { Minus, Plus, Trash, Save, CaseSensitive, Check } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletClient, usePublicClient, useConnect, useAccount, type Connector } from 'wagmi';
import { parseAbiItem } from 'viem';
import { Clanker } from 'clanker-sdk';
import { createCoin } from '@zoralabs/coins-sdk';
import { uploadMetadata } from '@/lib/utils';
import { CoinModal } from './CoinModal';
import { LaunchTokenModal } from './LaunchTokenModal';
import { LaunchSuccessModal } from './LaunchSuccessModal';
import { ZoraSuccessModal } from './ZoraSuccessModal';
import EditorCanvas from './EditorCanvas';
import { Button } from "./ui/button";
import { BottomNavigation } from './ui/BottomNavigation';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import sdk from "@farcaster/frame-sdk";

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
  const [textInputValue, setTextInputValue] = useState<string>('');
  const [isEditingText, setIsEditingText] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentTemplate, setCurrentTemplate] = useState<MemeTemplate | null>(template || null);
  const [loading, setLoading] = useState(!!templateId && !template);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { context } = useMiniKit();
  const userFid = context?.user.fid;
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();
  const [savingMeme, setSavingMeme] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [posting, setPosting] = useState(false);
  const [launchModalOpen, setLaunchModalOpen] = useState(false);
  const [launchSuccessOpen, setLaunchSuccessOpen] = useState(false);
  const [launchedAddress, setLaunchedAddress] = useState("");
  const [launchedImage, setLaunchedImage] = useState("");
  const [coinModalOpen, setCoinModalOpen] = useState(false);
  const [zoraModalOpen, setZoraModalOpen] = useState(false);
  const [zoraLink, setZoraLink] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [showTextTools, setShowTextTools] = useState(false);
  const { address } = useAccount();

  const CLANKER_FACTORY_V3_1 = '0x2A787b2362021cC3eEa3C24C4748a6cD5B687382';

  // Get allowed FIDs from environment variable
  const allowedSaveFids = process.env.NEXT_PUBLIC_ALLOWED_SAVE_FIDS?.split(',').map(fid => parseInt(fid.trim())) || [];

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
      const newActiveObject = canvas.getActiveObject();
      setActiveObject(newActiveObject);

      if (newActiveObject && newActiveObject.type === 'text') {
        setShowTextTools(true);
        setIsEditingText(true);
        setTextInputValue((newActiveObject as Text).text || '');
        // Focus the input after a small delay to ensure it's rendered
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        setShowTextTools(false);
        setIsEditingText(false);
      }
    };

    const handleSelectionCleared = () => {
      setActiveObject(null);
      setShowTextTools(false);
      setIsEditingText(false);
      setTextInputValue('');
    };
    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', handleSelectionCleared);
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
          text: "I made a mini-meme, and you should too!",
          embeds: [currentSavedMeme.image_url, 'https://mini-memes.xyz/'],
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

  const handleLaunchToken = async (data: { name: string; symbol: string; description: string; }) => {
    setLaunchModalOpen(false);
    if (!canvas) {
      toast({ title: 'No canvas', description: 'Canvas not ready', variant: 'destructive' });
      return;
    }
    if (!userFid) {
      toast({ title: 'User not found', description: 'No FID found for user', variant: 'destructive' });
      return;
    }

    try {
      const farcasterConnector = connectors.find((connector: Connector) => connector.id === "farcaster");
      await executeLaunchToken(farcasterConnector, data);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const executeLaunchToken = async (
    selectedWalletClient: any,
    data: { name: string; symbol: string; description: string; }
  ) => {
    console.log("🚀 ~ executeLaunchToken ~ selectedWalletClient:", selectedWalletClient);
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

      const clanker = new Clanker({ wallet: walletClient, publicClient });

      if (!address) {
        throw new Error('Wallet address not found');
      }

      const tokenAddress = await clanker.deployToken({
        name: data.name,
        symbol: data.symbol,
        image: currentSavedMeme.image_url,
        metadata: { description: data.description },
        context: { interface: 'Mini Memes', platform: 'Mini Memes', messageId: userFid?.toString() || '', id: data.symbol },
        pool: { quoteToken: '0x4200000000000000000000000000000000000006', initialMarketCap: '1' },
        devBuy: { ethAmount: '0' },
        rewardsConfig: {
          creatorReward: 75,
          creatorAdmin: address,
          creatorRewardRecipient: address,
          interfaceAdmin: address,
          interfaceRewardRecipient: address,
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
      setLaunchedAddress(tokenAddress);
      setLaunchedImage(currentSavedMeme.image_url);
      setLaunchSuccessOpen(true);
      toast({ title: 'Token Launched!', description: tokenAddress, variant: 'default' });
    } catch (error) {
      console.error('Error launching token:', error);
      toast({ title: 'Launch failed', description: error instanceof Error ? error.message : String(error), variant: 'destructive' });
    } finally {
      setLaunching(false);
    }
  };

  const handlePostToZora = async (data: { name: string; symbol: string; description: string; }) => {
    setCoinModalOpen(false);
    (window as any).tempCoinData = data;
    try {
      if (!isConnected && connectors[0]) {
        await connect({ connector: connectors[0] });
      }
      if (connectors[0]) {
        await executePostToZora(connectors[0]);
      } else {
        toast({ title: 'Wallet not available', description: 'No Farcaster wallet connector found', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
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

      if (!walletClient?.account?.address) {
        throw new Error('Wallet not connected or address not found');
      }

      const metadataUri = await uploadMetadata({
        name: data.name,
        symbol: data.symbol,
        description: data.description,
        image: currentSavedMeme.image_url,
      });

      console.log("🚀 ~ executePostToZora ~ metadataUri:", metadataUri);

      const result = await createCoin(
        {
          name: data.name,
          symbol: data.symbol,
          uri: metadataUri,
          payoutRecipient: walletClient?.account?.address as `0x${string}`,
          platformReferrer: '0x2CD1353Cf0E402770643B54011A63B546a189c44',
          chainId: 8453, // Base chain ID
        },
        walletClient,
        publicClient,
      );

      const link = `https://zora.co/coin/base:${result.address}`;
      setZoraLink(link);
      setContractAddress(result.address || '');
      setZoraModalOpen(true);
      // toast({ title: 'Coin Minted!', description: result.address || 'Unknown address', variant: 'default' });
    } catch (error) {
      console.error('Error posting to Zora:', error);
      toast({ title: 'Mint failed', description: error instanceof Error ? error.message : String(error), variant: 'destructive' });
    } finally {
      setPosting(false);
    }
  };

  const handleShareZora = async () => {
    try {
      await sdk.actions.composeCast({
        text: "I made a mini-meme and coined it!",
        embeds: [zoraLink],
      });
      toast({ title: 'Shared!', description: 'Coin shared to Farcaster!', variant: 'default' });
      setZoraModalOpen(false);
    } catch (error) {
      console.error('Error sharing coin:', error);
      toast({ title: 'Share failed', description: error instanceof Error ? error.message : String(error), variant: 'destructive' });
    }
  };

  const handleShareLaunch = async () => {
    try {
      await sdk.actions.composeCast({
        text: `I made a mini-meme and clanked it! CA:${launchedAddress}`,
        embeds: [launchedImage, 'https://mini-memes.xyz/'],
      });
      toast({ title: 'Shared!', description: 'Token shared to Farcaster!', variant: 'default' });
      setLaunchSuccessOpen(false);
    } catch (error) {
      console.error('Error sharing token:', error);
      toast({ title: 'Share failed', description: error instanceof Error ? error.message : String(error), variant: 'destructive' });
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
      const image = new window.Image();
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
    const text = new Text('New Text', {
      ...getDefaultTextBoxProps(),
      left: 50,
      top: 50,
      lockUniScaling: true,
      originX: 'center',
      originY: 'center',
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
    setShowTextTools(true);
    setIsEditingText(true);
    setTextInputValue('New Text');
    // Focus the input after a small delay
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Scale handlers
  const handleScaleChange = (delta: number, direction: 'inc' | 'dec') => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && active.type === 'text') {
      const step = delta;
      const currentScale = active.scaleX || 1;
      const newScale = Math.max(0.1, currentScale + (direction === 'inc' ? step : -step));
      active.set({ scaleX: newScale, scaleY: newScale });
      active.setCoords();
      canvas.setActiveObject(active);
      canvas.requestRenderAll();
    }
  };

  // Handle text input changes
  const handleTextInputChange = (value: string) => {
    setTextInputValue(value);
    if (!canvas || !activeObject) return;

    if (activeObject.type === 'text') {
      activeObject.set('text', value);
      canvas.requestRenderAll();
    }
  };

  // Handle submit button click
  const handleTextSubmit = () => {
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    setIsEditingText(false);
    setTextInputValue('');
    setShowTextTools(false);
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
      const textObjects = canvas.getObjects().filter(obj => obj.type === 'text');
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

    // Check if there are any text objects remaining
    const hasTextObjects = canvas.getObjects().some(obj => obj.type === 'text');
    if (!hasTextObjects) {
      setShowTextTools(false);
      setIsEditingText(false);
    }
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


  if (loading) {
    return <div className="text-center p-8 text-xl font-comic">Loading template...</div>;
  }

  if (error || !currentTemplate) {
    return <div className="text-center p-8 text-xl font-comic text-red-400">{error || 'Template not found.'}</div>;
  }

  return (
    <div className="flex flex-col h-full w-full relative pb-16 space-y-2">
      <EditorCanvas template={currentTemplate} />

      {/* Floating Text Input */}
      <AnimatePresence>
        {isEditingText && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sticky bottom-20 left-0 right-0 z-50"
          >
            <div className="bg-black/60 rounded-lg shadow-lg p-3 pointer-events-auto border border-white/20 backdrop-blur-md flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={textInputValue}
                onChange={(e) => handleTextInputChange(e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter text..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTextSubmit();
                  }
                }}
              />
              <Button
                onClick={handleTextSubmit}
                size="icon"
                className="bg-green-600 hover:bg-green-700 text-white"
                title="Submit and deselect"
              >
                <Check className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Toolbar at the bottom */}
      <div className="w-full z-50 space-y-2">
        <div className="bg-black/60 rounded-lg shadow-lg p-3 pointer-events-auto border border-white/20 backdrop-blur-md space-y-3">

          {/* Row 1: Editing Tools */}
          <div className="space-y-2">
            {/* Add Text Button - Dynamic Width */}
            <motion.div
              layout
              className="flex items-center gap-2"
            >
              <motion.div
                layout
                animate={{
                  width: showTextTools ? "auto" : "100%"
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex-1"
              >
                <Button
                  onClick={handleAddText}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white border-0"
                >
                  Add Text
                </Button>
              </motion.div>

              {/* Font Controls - Animated entry */}
              <AnimatePresence>
                {showTextTools && (
                  <motion.div
                    initial={{ opacity: 0, width: 0, x: -20 }}
                    animate={{ opacity: 1, width: "auto", x: 0 }}
                    exit={{ opacity: 0, width: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex items-center gap-2 overflow-hidden"
                  >
                    <div className="h-5 border-l border-white/30"></div>
                    <div className="flex items-center gap-1">
                      <CaseSensitive className="w-4 h-4 text-white/70" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => handleScaleChange(0.2, 'dec')}
                        variant="outline"
                        size="icon"
                        title="Decrease Font Size"
                        disabled={!activeObject || activeObject.type !== 'text'}
                        className="h-8 w-8"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => handleScaleChange(0.2, 'inc')}
                        variant="outline"
                        size="icon"
                        title="Increase Font Size"
                        disabled={!activeObject || activeObject.type !== 'text'}
                        className="h-8 w-8"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    {activeObject && activeObject.type === 'text' && (
                      <>
                        <div className="h-4 border-l border-white/30"></div>
                        <Button onClick={handleDelete} variant="destructive" title="Delete Selected" size="icon" className="h-8 w-8">
                          <Trash className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Row 2: Action Buttons */}
          {allowedSaveFids.includes(userFid || 0) ? (
            // Four buttons layout for allowed FIDs
            <div className="grid grid-cols-2 gap-2">
              {/* Top Left: Share */}
              <Button onClick={handleShare} variant="secondary" title="Share to Farcaster" disabled={sharing || saving} className="text-sm flex items-center gap-2">
                <Image src="/farcaster.png" alt="Farcaster" width={16} height={16} className="w-4 h-4" />
                {sharing ? 'Sharing...' : 'Share'}
              </Button>
              {/* Top Right: Coin It */}
              <Button onClick={() => setCoinModalOpen(true)} variant="secondary" disabled={posting || savingMeme || saving} className="text-sm flex items-center gap-2">
                <Image src="/Zorb.svg" alt="Zora" width={16} height={16} className="w-4 h-4" />
                {posting ? 'Minting...' : 'Coin It'}
              </Button>
              {/* Bottom Left: Clank it */}
              <Button onClick={() => setLaunchModalOpen(true)} variant="secondary" disabled={launching || savingMeme || saving} className="text-sm flex items-center gap-2">
                <Image src="/clanker.png" alt="Clanker" width={16} height={16} className="w-4 h-4" />
                {launching ? 'Launching...' : 'Clank it'}
              </Button>
              {/* Bottom Right: Save Meme */}
              <Button onClick={handleSaveMeme} variant="secondary" disabled={savingMeme || saving} className="text-sm flex items-center gap-2">
                <Save className="w-4 h-4" />
                {savingMeme ? 'Saving...' : 'Save Meme'}
              </Button>
            </div>
          ) : (
            // Three buttons layout for other users
            <div className="space-y-2">
              {/* Top: Share - Full Width */}
              <Button onClick={handleShare} variant="secondary" title="Share to Farcaster" disabled={sharing || saving} className="w-full text-sm flex items-center justify-center gap-2">
                <Image src="/farcaster.png" alt="Farcaster" width={16} height={16} className="w-4 h-4" />
                {sharing ? 'Sharing...' : 'Share'}
              </Button>
              {/* Bottom Row: Two buttons side by side */}
              <div className="grid grid-cols-2 gap-2">
                {/* Bottom Left: Coin It */}
                <Button onClick={() => setCoinModalOpen(true)} variant="secondary" disabled={posting || savingMeme || saving} className="text-sm flex items-center gap-2">
                  <Image src="/Zorb.svg" alt="Zora" width={16} height={16} className="w-4 h-4" />
                  {posting ? 'Minting...' : 'Coin It'}
                </Button>
                {/* Bottom Right: Clank it */}
                <Button onClick={() => setLaunchModalOpen(true)} variant="secondary" disabled={launching || savingMeme || saving} className="text-sm flex items-center gap-2">
                  <Image src="/clanker.png" alt="Clanker" width={16} height={16} className="w-4 h-4" />
                  {launching ? 'Launching...' : 'Clank it'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Row 3: Template Actions (separate panel) */}
        {/* <Button className="w-full" onClick={handleSaveTemplate} variant="outline">
          {saving ? 'Saving...' : 'Save Template'}
        </Button> */}
      </div>
      <CoinModal
        isOpen={coinModalOpen}
        onClose={() => setCoinModalOpen(false)}
        onSubmit={handlePostToZora}
        defaultValues={{ name: 'My Coin', symbol: 'COIN', description: '' }}
      />
      <LaunchTokenModal
        isOpen={launchModalOpen}
        onClose={() => setLaunchModalOpen(false)}
        onSubmit={handleLaunchToken}
        defaultValues={{ name: 'Meme Token', symbol: 'MEME', description: 'Token launched from Mini Memes' }}
      />
      <LaunchSuccessModal
        isOpen={launchSuccessOpen}
        onClose={() => setLaunchSuccessOpen(false)}
        onShare={handleShareLaunch}
        tokenAddress={launchedAddress}
        imageUrl={launchedImage}
      />
      <ZoraSuccessModal
        isOpen={zoraModalOpen}
        onClose={() => setZoraModalOpen(false)}
        onShare={handleShareZora}
        zoraLink={zoraLink}
        contractAddress={contractAddress}
      />
      <BottomNavigation />
    </div>
  );
}
