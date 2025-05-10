"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

export interface DraggableTextProps {
  id: string;
  text: string;
  initialX?: number;
  initialY?: number;
  initialSize?: number;
  canvasWidth: number;
  canvasHeight: number;
  onPositionChange: (id: string, x: number, y: number) => void;
  onSizeChange: (id: string, size: number) => void;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function DraggableText({
  id,
  text,
  initialX,
  initialY,
  initialSize = 24,
  canvasWidth,
  canvasHeight,
  onPositionChange,
  onSizeChange,
  selected,
  onSelect,
}: DraggableTextProps) {
  const [position, setPosition] = useState({
    x: initialX || canvasWidth / 2,
    y: initialY || canvasHeight / 2,
  });
  const [fontSize, setFontSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementOffset = useRef({ x: 0, y: 0 });

  // Update position if initialX/Y changes
  useEffect(() => {
    if (initialX !== undefined && initialY !== undefined) {
      setPosition({ x: initialX, y: initialY });
    }
  }, [initialX, initialY]);

  // Update font size if initialSize changes
  useEffect(() => {
    if (initialSize !== undefined) {
      setFontSize(initialSize);
    }
  }, [initialSize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();

    // Select the text element
    onSelect(id);

    // Store the initial mouse position
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
    };

    // Store the current element position
    elementOffset.current = {
      x: position.x,
      y: position.y,
    };

    // Set dragging state
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();

    // Select the text element
    onSelect(id);

    if (e.touches[0]) {
      // Store the initial touch position
      dragStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };

      // Store the current element position
      elementOffset.current = {
        x: position.x,
        y: position.y,
      };
    }

    // Set dragging state
    setIsDragging(true);
  };

  const handleIncreaseSize = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const newSize = Math.min(fontSize + 4, 72); // Max size 72px
    setFontSize(newSize);
    onSizeChange(id, newSize);
  };

  const handleDecreaseSize = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const newSize = Math.max(fontSize - 4, 12); // Min size 12px
    setFontSize(newSize);
    onSizeChange(id, newSize);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      // Calculate the mouse movement delta
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;

      // Calculate new position based on the original position plus the delta
      const newX = elementOffset.current.x + deltaX;
      const newY = elementOffset.current.y + deltaY;

      // Constrain to container bounds
      const textWidth = textRef.current?.offsetWidth || 0;
      const textHeight = textRef.current?.offsetHeight || 0;

      const constrainedX = Math.max(textWidth / 2, Math.min(newX, canvasWidth - textWidth / 2));
      const constrainedY = Math.max(textHeight / 2, Math.min(newY, canvasHeight - textHeight / 2));

      setPosition({ x: constrainedX, y: constrainedY });
      onPositionChange(id, constrainedX, constrainedY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return;

      // Calculate the touch movement delta
      const deltaX = e.touches[0].clientX - dragStartPos.current.x;
      const deltaY = e.touches[0].clientY - dragStartPos.current.y;

      // Calculate new position based on the original position plus the delta
      const newX = elementOffset.current.x + deltaX;
      const newY = elementOffset.current.y + deltaY;

      // Constrain to container bounds
      const textWidth = textRef.current?.offsetWidth || 0;
      const textHeight = textRef.current?.offsetHeight || 0;

      const constrainedX = Math.max(textWidth / 2, Math.min(newX, canvasWidth - textWidth / 2));
      const constrainedY = Math.max(textHeight / 2, Math.min(newY, canvasHeight - textHeight / 2));

      setPosition({ x: constrainedX, y: constrainedY });
      onPositionChange(id, constrainedX, constrainedY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, id, canvasWidth, canvasHeight, onPositionChange]);

  return (
    <div
      ref={textRef}
      className={cn(
        "absolute cursor-move select-none px-2 py-1 text-white text-center font-bold",
        "text-shadow-meme transform transition-transform",
        isDragging ? "scale-105" : "",
        selected ? "ring-2 ring-yellow-300" : "",
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
        textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
        fontSize: `${fontSize}px`,
        fontFamily: "Impact, sans-serif",
        maxWidth: "80%",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={() => onSelect(id)}
    >
      {text || "DRAG ME"}

      {/* Size controls - only show when selected */}
      {selected && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/70 rounded-md p-1">
          <button
            onClick={handleDecreaseSize}
            className="text-white hover:text-yellow-300 p-1 rounded-full"
            aria-label="Decrease text size"
          >
            <ArrowDownIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleIncreaseSize}
            className="text-white hover:text-yellow-300 p-1 rounded-full"
            aria-label="Increase text size"
          >
            <ArrowUpIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
