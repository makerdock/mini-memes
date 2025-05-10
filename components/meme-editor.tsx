"use client";

import { useRef, useEffect, useState } from "react";
import type { memeTemplates } from "../lib/meme-templates";
import { DraggableText } from "../components/draggable-text";

export interface CustomTextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  size: number;
}

interface MemeEditorProps {
  template: (typeof memeTemplates)[0];
  topText: string;
  bottomText: string;
  customTextItems?: CustomTextItem[];
  onCustomTextPositionChange?: (id: string, x: number, y: number) => void;
  onCustomTextSizeChange?: (id: string, size: number) => void;
  onSelectCustomText?: (id: string) => void;
  selectedCustomTextId?: string;
  preview?: boolean;
}

export function MemeEditor({
  template,
  topText,
  bottomText,
  customTextItems = [],
  onCustomTextPositionChange,
  onCustomTextSizeChange,
  onSelectCustomText,
  selectedCustomTextId,
  preview = false,
}: MemeEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  const [canvasScale, setCanvasScale] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset error state
    setError(null);
    setImageLoaded(false);

    // Ensure template and URL exist
    if (!template || !template.url) {
      setError("Template not found");
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = template.url;

    img.onload = () => {
      try {
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;
        setCanvasDimensions({ width: img.width, height: img.height });
        setImageLoaded(true);

        // Calculate scale between displayed size and actual canvas size
        if (containerRef.current) {
          const containerWidth = containerRef.current.clientWidth;
          const scale = containerWidth / img.width;
          setCanvasScale(scale);
        }

        // Draw the image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Determine text positions based on template
        let topTextY = canvas.height * 0.05;
        let bottomTextY = canvas.height * 0.95;
        const textBaseline = "top";
        const bottomTextBaseline = "bottom";
        const fontSize = canvas.height * 0.08;

        // Template-specific adjustments - safely access template.id
        const templateId = typeof template.id === "string" ? Number.parseInt(template.id, 10) : template.id;

        if (templateId === 2) {
          // Drake
          topTextY = canvas.height * 0.25;
          bottomTextY = canvas.height * 0.75;
        } else if (templateId === 4) {
          // Fancy Winnie
          topTextY = canvas.height * 0.25;
          bottomTextY = canvas.height * 0.75;
        } else if (templateId === 6) {
          // Anakin & Padme
          topTextY = canvas.height * 0.25;
          bottomTextY = canvas.height * 0.75;
        } else if (templateId === 7) {
          // Button Choice
          topTextY = canvas.height * 0.15;
          bottomTextY = canvas.height * 0.85;
        }

        // Set text style
        ctx.font = `bold ${fontSize}px Impact, sans-serif`;
        ctx.textAlign = "center";
        ctx.lineWidth = canvas.height * 0.008;

        // Draw top text
        if (topText) {
          ctx.strokeStyle = "black";
          ctx.fillStyle = "white";
          ctx.textBaseline = textBaseline as CanvasTextBaseline;

          const x = canvas.width / 2;
          const y = topTextY;

          // Handle text wrapping for long text
          wrapText(ctx, topText.toUpperCase(), x, y, canvas.width * 0.9, fontSize * 1.2);
        }

        // Draw bottom text
        if (bottomText) {
          ctx.strokeStyle = "black";
          ctx.fillStyle = "white";
          ctx.textBaseline = bottomTextBaseline as CanvasTextBaseline;

          const x = canvas.width / 2;
          const y = bottomTextY;

          // Handle text wrapping for long text
          wrapText(ctx, bottomText.toUpperCase(), x, y, canvas.width * 0.9, fontSize * 1.2, true);
        }

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
  }, [template, topText, bottomText]);

  // Update scale when container size changes
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasDimensions.width > 0) {
        const containerWidth = containerRef.current.clientWidth;
        const scale = containerWidth / canvasDimensions.width;
        setCanvasScale(scale);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [canvasDimensions.width]);

  // Function to wrap text
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

  // Handle custom text position changes
  const handleCustomTextPositionChange = (id: string, x: number, y: number) => {
    if (onCustomTextPositionChange) {
      onCustomTextPositionChange(id, x, y);
    }
  };

  // Handle custom text size changes
  const handleCustomTextSizeChange = (id: string, size: number) => {
    if (onCustomTextSizeChange) {
      onCustomTextSizeChange(id, size);
    }
  };

  // Handle selecting a custom text element
  const handleSelectCustomText = (id: string) => {
    if (onSelectCustomText) {
      onSelectCustomText(id);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${preview ? "" : "border-4 border-dashed border-pink-400 p-2 rounded-lg"}`}
    >
      <canvas ref={canvasRef} className="w-full h-auto rounded-md shadow-neon" />

      {/* Render draggable custom text elements */}
      {imageLoaded &&
        !preview &&
        customTextItems.map((item) => (
          <DraggableText
            key={item.id}
            id={item.id}
            text={item.text}
            initialX={item.x}
            initialY={item.y}
            initialSize={item.size}
            canvasWidth={canvasDimensions.width}
            canvasHeight={canvasDimensions.height}
            onPositionChange={handleCustomTextPositionChange}
            onSizeChange={handleCustomTextSizeChange}
            selected={selectedCustomTextId === item.id}
            onSelect={handleSelectCustomText}
          />
        ))}

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

      {!error && imageLoaded && !topText && !bottomText && customTextItems.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-lg font-comic text-yellow-300 bg-black/70 p-2 rounded-md">
            Add text above to create your meme!
          </p>
        </div>
      )}
    </div>
  );
}
