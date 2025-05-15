"use client";

import { useMemeStore } from '@/lib/stores/use-meme-store';
import { ChangeEventHandler, useEffect, useRef, useState } from "react";
import DraggableTextBox from './draggable-text-box';
import { Button } from './ui/button';
import { Input } from './ui/input';

export interface CustomTextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  size: number;
}

interface MemeEditorProps {
  // template: (typeof MEME_TEMPLATES)[0];
  // topText: string;
  // bottomText: string;
  // // customTextItems?: CustomTextItem[];
  // onCustomTextPositionChange?: (id: string, x: number, y: number) => void;
  // onCustomTextSizeChange?: (id: string, size: number) => void;
  // onSelectCustomText?: (id: string) => void;
  // selectedCustomTextId?: string;
  preview?: boolean;
}

export function MemeEditor({
  // template,
  // topText,
  // bottomText,
  // customTextItems = [],
  // onCustomTextPositionChange,
  // onCustomTextSizeChange,
  // onSelectCustomText,
  // selectedCustomTextId,
  preview = false,
}: MemeEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  const { setGeneratedMeme, setActiveTab, selectedCustomTextId, setSelectedCustomTextId, selectedTemplate, updateActiveTextbox } = useMemeStore();
  const customTextItems = selectedTemplate.textOverlays;
  // const [canvasScale, setCanvasScale] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset error state
    setError(null);
    setImageLoaded(false);

    // Ensure template and URL exist
    if (!selectedTemplate || !selectedTemplate.imageUrl) {
      setError("Template not found");
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = selectedTemplate.imageUrl;

    img.onload = () => {
      try {
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;
        setCanvasDimensions({ width: img.width, height: img.height });
        setImageLoaded(true);

        // Calculate scale between displayed size and actual canvas size
        // if (containerRef.current) {
        //   const containerWidth = containerRef.current.clientWidth;
        //   const scale = containerWidth / img.width;
        //   setCanvasScale(scale);
        // }

        // Draw the image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Determine text positions based on template
        // const topTextY = canvas.height * 0.05;
        // const bottomTextY = canvas.height * 0.95;
        // const textBaseline = "top";
        // const bottomTextBaseline = "bottom";
        const fontSize = canvas.height * 0.08;

        // Template-specific adjustments - safely access template.id
        // const templateId = typeof template.id === "string" ? Number.parseInt(template.id, 10) : template.id;

        // if (templateId === 2) {
        //   // Drake
        //   topTextY = canvas.height * 0.25;
        //   bottomTextY = canvas.height * 0.75;
        // } else if (templateId === 4) {
        //   // Fancy Winnie
        //   topTextY = canvas.height * 0.25;
        //   bottomTextY = canvas.height * 0.75;
        // } else if (templateId === 6) {
        //   // Anakin & Padme
        //   topTextY = canvas.height * 0.25;
        //   bottomTextY = canvas.height * 0.75;
        // } else if (templateId === 7) {
        //   // Button Choice
        //   topTextY = canvas.height * 0.15;
        //   bottomTextY = canvas.height * 0.85;
        // }

        // Set text style
        ctx.font = `bold ${fontSize}px Impact, sans-serif`;
        ctx.textAlign = "center";
        ctx.lineWidth = canvas.height * 0.008;

        // Draw top text
        // if (topText) {
        //   ctx.strokeStyle = "black";
        //   ctx.fillStyle = "white";
        //   ctx.textBaseline = textBaseline as CanvasTextBaseline;

        //   const x = canvas.width / 2;
        //   const y = topTextY;

        //   // Handle text wrapping for long text
        //   wrapText(ctx, topText.toUpperCase(), x, y, canvas.width * 0.9, fontSize * 1.2);
        // }

        // // Draw bottom text
        // if (bottomText) {
        //   ctx.strokeStyle = "black";
        //   ctx.fillStyle = "white";
        //   ctx.textBaseline = bottomTextBaseline as CanvasTextBaseline;

        //   const x = canvas.width / 2;
        //   const y = bottomTextY;

        //   // Handle text wrapping for long text
        //   wrapText(ctx, bottomText.toUpperCase(), x, y, canvas.width * 0.9, fontSize * 1.2, true);
        // }

        // We don't draw custom text items on the canvas directly
        // They are rendered as HTML elements for dragging
      } catch (err) {
        console.error("Error rendering meme:", err);
        setError("Error rendering meme");
      }
    };

    img.onerror = () => {
      setError("Failed to load image");
      setImageLoaded(false);
    };
  }, [selectedTemplate]);

  // Update scale when container size changes
  useEffect(() => {
    const handleResize = () => {
      // if (containerRef.current && canvasDimensions.width > 0) {
      //   const containerWidth = containerRef.current.clientWidth;
      //   const scale = containerWidth / canvasDimensions.width;
      //   setCanvasScale(scale);
      // }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [canvasDimensions.width]);

  // // Update custom text position
  // const updateCustomTextPosition = (id: string, x: number, y: number) => {
  //   updateActiveTextbox(customTextItems.map((item) => (item.id === id ? { ...item, x, y } : item)));
  // };

  // // Update custom text size
  // const updateCustomTextSize = (id: string, size: number) => {
  //   updateActiveTextbox(customTextItems.map((item) => (item.id === id ? { ...item, size } : item)));
  // };

  // // Select a custom text item
  // const selectCustomText = (id: string) => {
  //   setSelectedCustomTextId(id);
  // };

  const generateMeme = async () => {
    if (!containerRef.current) return;

    try {
      // Get the canvas element from the MemeEditor component
      const canvas = containerRef.current.querySelector("canvas");
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

  // Function to wrap text
  // function wrapText(
  //   ctx: CanvasRenderingContext2D,
  //   text: string,
  //   x: number,
  //   y: number,
  //   maxWidth: number,
  //   lineHeight: number,
  //   isBottom = false,
  // ) {
  //   if (!text) return;

  //   const words = text.split(" ");
  //   let line = "";
  //   const lines: string[] = [];

  //   // Break into lines
  //   for (let n = 0; n < words.length; n++) {
  //     const testLine = line + words[n] + " ";
  //     const metrics = ctx.measureText(testLine);
  //     const testWidth = metrics.width;

  //     if (testWidth > maxWidth && n > 0) {
  //       lines.push(line);
  //       line = words[n] + " ";
  //     } else {
  //       line = testLine;
  //     }
  //   }

  //   if (line.trim()) {
  //     lines.push(line);
  //   }

  //   // Adjust y position for bottom text to start from bottom
  //   if (isBottom && lines.length > 1) {
  //     y -= lineHeight * (lines.length - 1);
  //   }

  //   // Draw each line
  //   for (let i = 0; i < lines.length; i++) {
  //     const lineY = isBottom ? y + i * lineHeight : y + i * lineHeight;
  //     ctx.strokeText(lines[i], x, lineY);
  //     ctx.fillText(lines[i], x, lineY);
  //   }
  // }


  // Update custom text position
  const updateCustomTextPosition = (id: string, x: number, y: number) => {
    updateActiveTextbox(id, { x, y });
  };

  // Update custom text size
  const updateCustomTextSize = (id: string, size: number) => {
    updateActiveTextbox(id, { size });
  };

  // Select a custom text item
  const selectCustomText = (id: string) => {
    setSelectedCustomTextId(id);
  };

  function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    isBottom = false,
  ) {
    if (!text) return;

    const words = text.split(" ");
    let line = "";
    const lines: string[] = [];

    // Break into lines
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }

    if (line.trim()) {
      lines.push(line);
    }

    // Adjust y position for bottom text to start from bottom
    if (isBottom && lines.length > 1) {
      y -= lineHeight * (lines.length - 1);
    }

    // Draw each line
    for (let i = 0; i < lines.length; i++) {
      const lineY = isBottom ? y + i * lineHeight : y + i * lineHeight;
      ctx.strokeText(lines[i], x, lineY);
      ctx.fillText(lines[i], x, lineY);
    }
  }

  const handleTitleChange: ChangeEventHandler<HTMLInputElement> = e => {
    const value = e.target.value;
    const name = e.target.name;
    console.log({ value, name });
    updateActiveTextbox(name, { text: value });

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!ctx || !canvas) {
      return;
    }

    const currTextbox = selectedTemplate.textOverlays.find(textbox => textbox.areaId === name);
    if (!currTextbox) return;

    wrapText(ctx, value.toUpperCase(), currTextbox?.x, currTextbox?.y, canvas?.width * 0.9, currTextbox.size * 1.2);
  };

  return (
    <div
      className={`relative w-full ${preview ? "" : "border-4 border-dashed border-pink-400 p-2 rounded-lg"}`}
    >

      <div
        ref={containerRef}
        className='h-fit w-fit bg-red-400 relative'
      >
        <canvas ref={canvasRef} className="w-full h-auto rounded-md shadow-neon" />

        {customTextItems.map(item =>
          <DraggableTextBox
            key={item.areaId}
            containerRef={containerRef}
            updateCustomTextPosition={updateCustomTextPosition}
            updateCustomTextSize={updateCustomTextSize}
            selectCustomText={selectCustomText}
            item={item}
            selected={selectedCustomTextId === item.areaId}
          />
        )}
      </div>

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-md">
          <p className="text-red-400 font-comic p-4 text-center">{error}. Please try selecting another template.</p>
        </div>
      )}

      {!error && !imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
          <div className="animate-spin h-8 w-8 border-4 border-yellow-300 rounded-full border-t-transparent"></div>
        </div>
      )}

      {/* add the bottom sticky input here */}
      <div className='grid gap-4 mt-4'>
        {customTextItems.map(textBox => <Input
          key={textBox.areaId}
          value={textBox.text}
          name={textBox.areaId}
          onChange={handleTitleChange}
          className="bg-black/50 border-2 border-green-400 text-white font-comic backdrop-blur-md"
        />)}

        <Button
          onClick={generateMeme}
          className='w-full'>Generate Meme</Button>
      </div>
    </div>
  );
}
