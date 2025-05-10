"use client";

import { Input } from "../components/ui/input";
import { X } from "lucide-react";

interface DraggableTextInputProps {
  id: string;
  value: string;
  onChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
}

export function DraggableTextInput({ id, value, onChange, onRemove }: DraggableTextInputProps) {
  return (
    <div className="relative flex items-center mb-2">
      <Input
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        placeholder="Enter custom text"
        className="pr-10 bg-black/50 border-2 border-purple-400 text-white font-comic"
      />
      <button
        onClick={() => onRemove(id)}
        className="absolute right-2 p-1 rounded-full hover:bg-red-500/20 text-red-400"
        aria-label="Remove text"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
