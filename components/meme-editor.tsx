"use client";

// Import Fabric.js
import * as fabricModule from 'fabric';
// Use a dynamic import approach to avoid SSR issues
const fabric = typeof window !== 'undefined' ? fabricModule : null;
import { Plus, Trash2 } from 'lucide-react';
import { ChangeEventHandler, useEffect, useRef, useState } from "react";
import FabricTextControls from './fabric-text-controls';
import { Button } from './ui/button';

export interface CustomTextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  size: number;
}

interface MemeEditorProps {
  preview?: boolean;
}

export function MemeEditor({
  preview = false,
}: MemeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setCanvasDimensions] = useState({ width: 0, height: 0 });
  const { setGeneratedMeme, setActiveTab, selectedCustomTextId, setSelectedCustomTextId, selectedTemplate, updateActiveTextbox, removeTextOverlay } = useMemeStore();
  const customTextItems = selectedTemplate.textOverlays;
  const [fabricCanvas, setFabricCanvas] = useState<any | null>(null);
  const [textObjects, setTextObjects] = useState<Record<string, any>>({});
  const [selectedTextObject, setSelectedTextObject] = useState<any | null>(null);
  const [showTextControls, setShowTextControls] = useState(false);

  // Initialize Fabric canvas
  useEffect(() => {
    if (!containerRef.current || !fabric) return;

    // Clean up existing canvas if any
    if (fabricCanvas) {
      fabricCanvas.dispose();
    }

    // Create a new Fabric canvas
    const canvas = new fabric.Canvas('meme-canvas', {
      selection: false,
      preserveObjectStacking: true,
    });

    setFabricCanvas(canvas);

    // Event listeners for object selection
    canvas.on('mouse:down', (options: any) => {
      if (options.target && options.target.data) {
        setSelectedCustomTextId(options.target.data.areaId);
        setSelectedTextObject(options.target);
        setShowTextControls(true);
      } else {
        setSelectedCustomTextId(null);
        setSelectedTextObject(null);
        setShowTextControls(false);
      }
    });

    // Event listeners for object modification
    canvas.on('object:modified', (options: any) => {
      const target = options.target;
      if (target && target.data) {
        const areaId = target.data.areaId;
        updateActiveTextbox(areaId, {
          x: target.left || 0,
          y: target.top || 0,
          size: target.fontSize as number || 32,
        });
      }
    });

    // Cleanup on unmount
    return () => {
      canvas.dispose();
    };
  }, [fabricCanvas, setSelectedCustomTextId, updateActiveTextbox]);

  // Load template image and text overlays when template changes
  useEffect(() => {
    if (!fabricCanvas || !selectedTemplate || !fabric) return;

    // Reset error state
    setError(null);
    setImageLoaded(false);

    // Clear the canvas
    // fabricCanvas?.clear();

    // Set canvas dimensions based on container width
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      fabricCanvas.setWidth(containerWidth);
      fabricCanvas.setHeight(containerWidth * 0.75); // Arbitrary aspect ratio, can be adjusted
    }

    // Ensure template and URL exist
    if (!selectedTemplate || !selectedTemplate.imageUrl) {
      setError("Template not found");
      return;
    }

    // Load the template image
    if (!fabric) return;
    fabric.Image.fromURL(selectedTemplate.imageUrl, (img: any) => {
      try {
        // Adjust image to fit canvas
        const canvasWidth = fabricCanvas.getWidth() || 500;
        const canvasHeight = fabricCanvas.getHeight() || 375;

        // Scale image to fit canvas
        const scale = Math.min(
          canvasWidth / img.width!,
          canvasHeight / img.height!
        );

        img.scaleX = scale;
        img.scaleY = scale;

        // Center the image on canvas
        img.set({
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
        });

        // Add image to canvas
        fabricCanvas.add(img);
        fabricCanvas.sendToBack(img);

        // Set canvas dimensions to match scaled image
        const scaledWidth = img.width! * scale;
        const scaledHeight = img.height! * scale;
        setCanvasDimensions({ width: scaledWidth, height: scaledHeight });

        // Set image loaded state
        setImageLoaded(true);

        // Add text elements for each overlay
        const newTextObjects: Record<string, any> = {};

        customTextItems.forEach((item) => {
          // Calculate scaled positions
          const scaledX = (item.x / img.width!) * scaledWidth;
          const scaledY = (item.y / img.height!) * scaledHeight;

          const text = new fabric.Text(item.text, {
            left: scaledX,
            top: scaledY,
            fontSize: item.size * scale,
            fill: item.color,
            fontFamily: 'Impact, sans-serif',  // Always use Impact font
            strokeWidth: 1.5,
            stroke: '#000000',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            selectable: true,
            hasControls: true,
            lockRotation: false,
            data: { areaId: item.areaId },
          });

          fabricCanvas.add(text);
          newTextObjects[item.areaId] = text;
        });

        setTextObjects(newTextObjects);
        fabricCanvas.renderAll();
      } catch (err) {
        console.error("Error rendering meme:", err);
        setError("Error rendering meme");
      }
    }, { crossOrigin: 'anonymous' });

  }, [selectedTemplate, fabricCanvas, customTextItems]);

  // Update text objects when user edits text
  useEffect(() => {
    if (!fabricCanvas || !textObjects) return;

    customTextItems.forEach((item) => {
      const textObject = textObjects[item.areaId];
      if (textObject) {
        textObject.set('text', item.text);
        // If the text was selected, update size and position in the store
        if (item.areaId === selectedCustomTextId) {
          textObject.set({
            fontSize: item.size,
            left: item.x,
            top: item.y,
          });
        }
      }
    });

    fabricCanvas.renderAll();
  }, [customTextItems, textObjects, fabricCanvas, selectedCustomTextId, customTextItems]);

  // Handle text selection
  useEffect(() => {
    if (!fabricCanvas || !textObjects) return;

    fabricCanvas.getObjects().forEach((obj: any) => {
      if (fabric && obj.type === 'text' && obj.data) {
        const isSelected = obj.data.areaId === selectedCustomTextId;
        obj.set({
          borderColor: isSelected ? '#00ff00' : '#aaaaaa',
          cornerColor: isSelected ? '#00ff00' : '#aaaaaa',
        });
      }
    });

    fabricCanvas.renderAll();
  }, [selectedCustomTextId, fabricCanvas, textObjects]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleTitleChange: ChangeEventHandler<HTMLInputElement> = e => {
    const value = e.target.value;
    const name = e.target.name;
    updateActiveTextbox(name, { text: value });
  };

  const generateMeme = async () => {
    if (!fabricCanvas) return;

    try {
      // Temporarily hide selection borders and controls
      const objects = fabricCanvas.getObjects();
      objects.forEach((obj: any) => {
        if (fabric && obj.type === 'text') {
          obj.set({
            selectable: false,
            hasControls: false,
            hasBorders: false,
            borderColor: 'transparent',
            cornerColor: 'transparent',
          });
        }
      });
      fabricCanvas.renderAll();

      // Convert canvas to data URL
      const dataUrl = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1.0,
      });

      // Restore object properties
      objects.forEach((obj: any) => {
        if (fabric && obj.type === 'text') {
          obj.set({
            selectable: true,
            hasControls: true,
            hasBorders: true,
            borderColor: obj.data?.areaId === selectedCustomTextId ? '#00ff00' : '#aaaaaa',
            cornerColor: obj.data?.areaId === selectedCustomTextId ? '#00ff00' : '#aaaaaa',
          });
        }
      });
      fabricCanvas.renderAll();

      // Set the generated meme
      setGeneratedMeme(dataUrl);
      setActiveTab("share");
    } catch (error) {
      console.error("Error generating meme:", error);
    }
  };

  return (
    <div
      className={`relative w-full ${preview ? "" : "border-4 border-dashed border-pink-400 p-2 rounded-lg"}`}
    >
      <div
        ref={containerRef}
        className='relative'
      >
        <canvas id="meme-canvas" className="w-full h-auto rounded-md shadow-neon" />

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
      </div>

      {/* Text Controls */}
      {showTextControls && selectedTextObject && (
        <div className="my-4">
          <FabricTextControls
            canvas={fabricCanvas}
            selectedObject={selectedTextObject}
            onTextChanged={(text) => {
              if (selectedCustomTextId) {
                updateActiveTextbox(selectedCustomTextId, { text });
              }
            }}
          />
        </div>
      )}

      {/* Text inputs */}
      <div className='grid gap-4 mt-4'>
        {/* Text selector buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {customTextItems.map(textBox => (
            <div
              key={textBox.areaId}
              className={`p-2 border-2 rounded cursor-pointer flex items-center justify-between ${selectedCustomTextId === textBox.areaId ? 'border-green-400 bg-green-900/30' : 'border-white/30 bg-black/40'}`}
            >
              <span
                className="flex-grow truncate text-sm px-1"
                onClick={() => {
                  setSelectedCustomTextId(textBox.areaId);
                  const obj = textObjects[textBox.areaId];
                  if (obj) {
                    setSelectedTextObject(obj);
                    setShowTextControls(true);
                    if (fabricCanvas) {
                      fabricCanvas.setActiveObject(obj);
                      fabricCanvas.renderAll();
                    }
                  }
                }}
              >
                {textBox.text || textBox.areaId}
              </span>
              {/* Only show delete button for text boxes that aren't part of the original template */}
              {textBox.areaId.startsWith('text-') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (fabricCanvas && textObjects[textBox.areaId]) {
                      // Remove from fabric canvas
                      fabricCanvas.remove(textObjects[textBox.areaId]);
                      fabricCanvas.renderAll();

                      // Remove from text objects
                      const updatedTextObjects = { ...textObjects };
                      delete updatedTextObjects[textBox.areaId];
                      setTextObjects(updatedTextObjects);

                      // Remove from store
                      removeTextOverlay(textBox.areaId);

                      // Clear selection if the deleted item was selected
                      if (selectedCustomTextId === textBox.areaId) {
                        setSelectedCustomTextId(null);
                        setSelectedTextObject(null);
                        setShowTextControls(false);
                      }
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}

          {/* Add new text button */}
          <Button
            className="col-span-full bg-gradient-to-r from-purple-500 to-pink-500 mt-2"
            onClick={() => {
              if (!fabricCanvas || !fabric) return;

              // Generate a new unique ID
              const newId = `text-${Date.now()}`;
              const canvasCenter = {
                x: fabricCanvas.getWidth() / 2,
                y: fabricCanvas.getHeight() / 2
              };

              // Add new text to store
              const newTextItem = {
                areaId: newId,
                text: 'New text',
                font: 'Impact',
                size: 32,
                color: '#ffffff',
                x: canvasCenter.x,
                y: canvasCenter.y
              };

              // Create new text object in Fabric
              const newText = new fabric.Text(newTextItem.text, {
                left: canvasCenter.x,
                top: canvasCenter.y,
                fontSize: newTextItem.size,
                fill: newTextItem.color,
                fontFamily: 'Impact, sans-serif',
                strokeWidth: 1.5,
                stroke: '#000000',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
                selectable: true,
                hasControls: true,
                data: { areaId: newId }
              });

              // Add to canvas
              fabricCanvas.add(newText);
              fabricCanvas.setActiveObject(newText);
              fabricCanvas.renderAll();

              // Update text objects and set as selected
              setTextObjects({ ...textObjects, [newId]: newText });
              setSelectedTextObject(newText);
              setSelectedCustomTextId(newId);
              setShowTextControls(true);

              // Add to store
              updateActiveTextbox(newId, { text: 'New text' });
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Text
          </Button>
        </div>

        <Button
          onClick={generateMeme}
          className='w-full bg-gradient-to-r from-blue-500 to-cyan-500 mt-4'>Generate Meme</Button>
      </div>
    </div>
  );
}