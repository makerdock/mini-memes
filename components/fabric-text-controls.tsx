"use client";

// Import Fabric.js
import * as fabricModule from 'fabric';
// Use a dynamic import approach to avoid SSR issues
const fabric = typeof window !== 'undefined' ? fabricModule : null;
import { useState, useEffect, useRef } from 'react';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { 
  Bold, 
  Italic, 
  AlignCenter, 
  AlignLeft, 
  AlignRight, 
  Underline,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus
} from 'lucide-react';

interface FabricTextControlsProps {
  canvas: any | null;
  selectedObject: any | null;
  onTextChanged: (text: string) => void;
}

export default function FabricTextControls({
  canvas,
  selectedObject,
  onTextChanged
}: FabricTextControlsProps) {
  const [textValue, setTextValue] = useState('');
  const [fontSize, setFontSize] = useState(32);
  const [textAlign, setTextAlign] = useState<string>('center');
  const [fontStyle, setFontStyle] = useState({
    bold: false,
    italic: false,
    underline: false,
  });
  const [textColor, setTextColor] = useState('#ffffff');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Update controls when selected object changes
  useEffect(() => {
    if (!selectedObject) {
      return;
    }

    setTextValue(selectedObject.text || '');
    setFontSize(selectedObject.fontSize as number || 32);
    setTextAlign(selectedObject.textAlign || 'center');
    setTextColor(selectedObject.fill as string || '#ffffff');
    setFontStyle({
      bold: selectedObject.fontWeight === 'bold',
      italic: selectedObject.fontStyle === 'italic',
      underline: selectedObject.underline || false,
    });
  }, [selectedObject]);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setTextValue(newText);
    
    if (selectedObject && canvas) {
      selectedObject.set('text', newText);
      canvas.renderAll();
      onTextChanged(newText);
    }
  };

  // Handle font size change
  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0];
    setFontSize(newSize);
    
    if (selectedObject && canvas) {
      selectedObject.set('fontSize', newSize);
      canvas.renderAll();
    }
  };

  // Quick size adjustments
  const adjustFontSize = (increment: number) => {
    const newSize = Math.max(8, fontSize + increment); // Minimum size of 8
    setFontSize(newSize);
    
    if (selectedObject && canvas) {
      selectedObject.set('fontSize', newSize);
      canvas.renderAll();
    }
  };

  // Handle text alignment
  const handleTextAlign = (align: string) => {
    setTextAlign(align);
    
    if (selectedObject && canvas) {
      selectedObject.set('textAlign', align);
      canvas.renderAll();
    }
  };

  // Handle color change
  const handleColorChange = (color: string) => {
    setTextColor(color);
    
    if (selectedObject && canvas) {
      selectedObject.set('fill', color);
      canvas.renderAll();
    }
  };

  // Toggle font styles
  const toggleFontStyle = (style: 'bold' | 'italic' | 'underline') => {
    const newStyles = { ...fontStyle };
    
    if (style === 'bold') {
      newStyles.bold = !newStyles.bold;
      if (selectedObject && canvas) {
        selectedObject.set({
          fontWeight: newStyles.bold ? 'bold' : 'normal',
          fontFamily: 'Impact, sans-serif'  // Ensure Impact font is maintained
        });
      }
    } else if (style === 'italic') {
      newStyles.italic = !newStyles.italic;
      if (selectedObject && canvas) {
        selectedObject.set({
          fontStyle: newStyles.italic ? 'italic' : 'normal',
          fontFamily: 'Impact, sans-serif'  // Ensure Impact font is maintained
        });
      }
    } else if (style === 'underline') {
      newStyles.underline = !newStyles.underline;
      if (selectedObject && canvas) {
        selectedObject.set({
          underline: newStyles.underline,
          fontFamily: 'Impact, sans-serif'  // Ensure Impact font is maintained
        });
      }
    }
    
    setFontStyle(newStyles);
    
    if (canvas) {
      canvas.renderAll();
    }
  };

  // Reset text rotation
  const resetRotation = () => {
    if (selectedObject && canvas) {
      selectedObject.set('angle', 0);
      canvas.renderAll();
    }
  };

  // Bring forward/send backward in stack
  const adjustZIndex = (bringForward: boolean) => {
    if (!selectedObject || !canvas) return;
    
    if (bringForward) {
      canvas.bringForward(selectedObject);
    } else {
      canvas.sendBackwards(selectedObject);
    }
    
    canvas.renderAll();
  };

  return (
    <div className="p-3 bg-black/50 border border-cyan-400 rounded-md space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-cyan-300">Text</label>
        <Input
          value={textValue}
          onChange={handleTextChange}
          className="bg-black/40 border-cyan-400 text-white"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm text-cyan-300">Size: {fontSize}px</label>
          <div className="flex space-x-1">
            <Button 
              size="icon" 
              variant="outline" 
              className="h-6 w-6" 
              onClick={() => adjustFontSize(-2)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Button 
              size="icon" 
              variant="outline" 
              className="h-6 w-6" 
              onClick={() => adjustFontSize(2)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <Slider 
          value={[fontSize]} 
          min={8} 
          max={72} 
          step={1} 
          onValueChange={handleFontSizeChange} 
        />
      </div>
      
      <div className="flex justify-between">
        <div className="flex space-x-1">
          <Button 
            size="sm" 
            variant={fontStyle.bold ? "default" : "outline"} 
            onClick={() => toggleFontStyle('bold')}
            className="h-8"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant={fontStyle.italic ? "default" : "outline"}
            onClick={() => toggleFontStyle('italic')}
            className="h-8"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant={fontStyle.underline ? "default" : "outline"}
            onClick={() => toggleFontStyle('underline')}
            className="h-8"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex space-x-1">
          <Button 
            size="sm" 
            variant={textAlign === 'left' ? "default" : "outline"}
            onClick={() => handleTextAlign('left')}
            className="h-8"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant={textAlign === 'center' ? "default" : "outline"}
            onClick={() => handleTextAlign('center')}
            className="h-8"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant={textAlign === 'right' ? "default" : "outline"}
            onClick={() => handleTextAlign('right')}
            className="h-8"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Color picker */}
      <div className="space-y-2 relative">
        <div className="flex justify-between items-center">
          <label className="text-sm text-cyan-300">Text Color</label>
          <div 
            className="w-8 h-8 rounded-md border border-white cursor-pointer"
            style={{ backgroundColor: textColor }}
            onClick={() => setShowColorPicker(!showColorPicker)}
          ></div>
        </div>
        
        {showColorPicker && (
          <div 
            ref={colorPickerRef}
            className="absolute right-0 z-10 p-2 bg-black/80 border border-cyan-500 rounded-md"
          >
            <div className="grid grid-cols-6 gap-1">
              {[
                '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
                '#00ffff', '#ff00ff', '#c0c0c0', '#808080', '#800000', '#808000',
                '#008000', '#800080', '#008080', '#000080', '#ffa500', '#a52a2a',
                '#f0e68c', '#90ee90', '#add8e6', '#ff69b4', '#7fffd4', '#fa8072'
              ].map(color => (
                <div
                  key={color}
                  className="w-6 h-6 rounded-sm cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    handleColorChange(color);
                    setShowColorPicker(false);
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button 
          size="sm" 
          variant="outline"
          onClick={resetRotation}
          className="h-8">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset Rotation
        </Button>
        
        <div className="flex space-x-1">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => adjustZIndex(false)}
            className="h-8">
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => adjustZIndex(true)}
            className="h-8">
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}