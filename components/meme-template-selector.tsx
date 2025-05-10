"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight, PenLine } from "lucide-react";
import { cn } from "../lib/utils";
import type { memeTemplates } from "../lib/meme-templates";

interface MemeTemplateSelectorProps {
  templates: typeof memeTemplates;
  selectedTemplate: (typeof memeTemplates)[0];
  onSelect: (template: (typeof memeTemplates)[0]) => void;
  onNextClick?: () => void;
}

export function MemeTemplateSelector({
  templates,
  selectedTemplate,
  onSelect,
  onNextClick,
}: MemeTemplateSelectorProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  const [hasSelectedTemplate, setHasSelectedTemplate] = useState(false);

  // Check if mobile on mount and on resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSmallMobile(window.innerWidth < 480);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Check if a template is selected
  useEffect(() => {
    if (selectedTemplate && selectedTemplate.id) {
      setHasSelectedTemplate(true);
    } else {
      setHasSelectedTemplate(false);
    }
  }, [selectedTemplate]);

  // Calculate items per page based on screen size
  const itemsPerPage = isSmallMobile ? 2 : isMobile ? 3 : 6;
  const totalPages = Math.ceil(templates.length / itemsPerPage);

  // Ensure the page with the selected template is shown
  useEffect(() => {
    if (selectedTemplate && templates.length > 0) {
      const templateIndex = templates.findIndex((t) => t.id === selectedTemplate.id);
      if (templateIndex >= 0) {
        const page = Math.floor(templateIndex / itemsPerPage);
        setCurrentPage(page);
      }
    }
  }, [selectedTemplate, templates, itemsPerPage]);

  // Get templates for the current page
  const currentTemplates = templates.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const goToNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Safely compare template IDs (handling both string and number types)
  const isSelected = (template: (typeof memeTemplates)[0]) => {
    if (!selectedTemplate) return false;

    // Convert both to strings for comparison to handle both number and string IDs
    return String(template.id) === String(selectedTemplate.id);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-comic text-yellow-300 mb-2 text-center">
        Choose a Template: Page {currentPage + 1} of {totalPages}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-black/50 rounded-md border-2 border-pink-400">
        {currentTemplates.map((template) => (
          <div
            key={template.id}
            className={cn(
              "cursor-pointer transition-all duration-200 transform hover:scale-105",
              isSelected(template) ? "ring-4 ring-yellow-300 scale-105" : "ring-1 ring-white/30",
            )}
            onClick={() => onSelect(template)}
          >
            <div className="relative aspect-square">
              <Image
                src={template.url || "/placeholder.svg"}
                alt={template.name}
                fill
                className="object-cover rounded-md"
              />

              {isSelected(template) && (
                <div className="absolute bottom-0 left-0 right-0 bg-yellow-300 text-black text-center py-1 text-xs font-bold">
                  SELECTED
                </div>
              )}
            </div>
            <p
              className={cn(
                "mt-1 text-center text-sm font-comic truncate",
                isSelected(template) ? "text-yellow-300" : "text-white/80",
              )}
            >
              {template.name}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
        <Button
          onClick={goToPrevPage}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 font-comic border-2 border-white"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          <span className="whitespace-nowrap text-sm">{isSmallMobile ? "Previous" : "Previous Templates"}</span>
        </Button>

        <div className="flex space-x-1 order-3 sm:order-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                currentPage === index ? "bg-yellow-300 w-4" : "bg-white/30 hover:bg-white/50",
              )}
              onClick={() => setCurrentPage(index)}
            />
          ))}
        </div>

        <Button
          onClick={goToNextPage}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 font-comic border-2 border-white order-2 sm:order-3"
        >
          <span className="whitespace-nowrap text-sm">{isSmallMobile ? "More" : "More Templates"}</span>
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-center mt-6">
        <Button
          onClick={onNextClick}
          disabled={!hasSelectedTemplate}
          className={cn(
            "w-full sm:w-auto bg-gradient-to-r font-comic border-2 border-white transition-all",
            hasSelectedTemplate
              ? "from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 opacity-100"
              : "from-gray-400 to-gray-500 opacity-70 cursor-not-allowed",
          )}
        >
          <PenLine className="mr-2 h-4 w-4" />
          Add Your Text
        </Button>
      </div>

      {!hasSelectedTemplate && (
        <p className="text-center text-yellow-200 text-sm mt-2 animate-pulse">⬆️ Select a meme template first ⬆️</p>
      )}
    </div>
  );
}
