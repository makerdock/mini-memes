"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "../components/ui/button";
import { PenLine } from "lucide-react";
import { cn } from "../lib/utils";
import type { MemeTemplate } from "../lib/meme-templates";

// NOTE: This component is now only used for in-place template selection. Navigation to /template/:templateId is handled on the home page.

interface MemeTemplateSelectorProps {
  templates: MemeTemplate[];
  selectedTemplate: MemeTemplate;
  onSelect: (template: MemeTemplate) => void;
  onNextClick?: () => void;
}

export function MemeTemplateSelector({
  templates,
  selectedTemplate,
  onSelect,
  onNextClick,
}: MemeTemplateSelectorProps) {
  console.log("🚀 ~ selectedTemplate:", selectedTemplate);
  const [hasSelectedTemplate, setHasSelectedTemplate] = useState(false);

  // Check if a template is selected
  useEffect(() => {
    if (selectedTemplate && selectedTemplate.id) {
      setHasSelectedTemplate(true);
    } else {
      setHasSelectedTemplate(false);
    }
  }, [selectedTemplate]);

  // Safely compare template IDs (handling both string and number types)
  const isSelected = (template: MemeTemplate) => {
    if (!selectedTemplate) return false;
    return String(template.id) === String(selectedTemplate.id);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-comic text-yellow-300 mb-2 text-center">
        Choose a Template
      </h3>

      <div className="grid grid-cols-2 gap-4 p-4 bg-black/50 rounded-md border-2 border-pink-400">
        {templates.map((template) => (
          <div
            key={template.id}
            className={cn(
              "cursor-pointer transition-all duration-200 transform hover:scale-105 rounded-sm overflow-hidden aspect-square",
              isSelected(template) ? "ring-4 ring-yellow-300 scale-105" : "ring-1 ring-white/30",
            )}
            onClick={() => onSelect(template)}
          >
            <Image
              src={template.imageUrl || "/placeholder.svg"}
              alt={template.templateId}
              fill
              className="object-cover aspect-square h-full w-full"
            />
          </div>
        ))}
      </div>

      {selectedTemplate && <div className="flex justify-center mt-6 sticky bottom-4">
        <Button
          onClick={onNextClick}
          disabled={!hasSelectedTemplate}
          className={cn(
            "w-full sm:w-auto bg-gradient-to-r font-comic border-2 border-white transition-all sticky bottom-4",
            hasSelectedTemplate
              ? "from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 opacity-100"
              : "from-gray-400 to-gray-500 opacity-70 cursor-not-allowed",
          )}
        >
          <PenLine className="mr-2 h-4 w-4" />
          Add Your Text
        </Button>
      </div>}

      {!hasSelectedTemplate && (
        <p className="text-center text-yellow-200 text-sm mt-2 animate-pulse">⬆️ Select a meme template first ⬆️</p>
      )}
    </div>
  );
}
