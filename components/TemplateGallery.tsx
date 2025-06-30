"use client";

import Link from "next/link";
import { useState } from "react";
import { Skeleton } from "./ui/Skeleton";
import { BottomNavigation } from "./ui/BottomNavigation";
import type { MemeTemplate } from "../lib/meme-templates";

interface TemplateGalleryProps {
    templates: MemeTemplate[];
    error?: string | null;
}

export function TemplateGallery({ templates, error }: TemplateGalleryProps) {
    const loading = !error && templates.length === 0;
    const [tappedTemplate, setTappedTemplate] = useState<string | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);

    return (
        <>
            {error && <div className="text-center text-red-400">{error}</div>}
            {isNavigating && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-black/80 border-2 border-cyan-400 rounded-lg p-6 animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-cyan-400 font-comic">Loading template...</span>
                        </div>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-8">
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="block bg-black/30 border-2 border-cyan-400 rounded-md">
                            <Skeleton className="w-full h-48" />
                        </div>
                    ))
                    : templates.map((template: MemeTemplate) => (
                        <Link
                            key={template.id}
                            href={`/template/${template.id}`}
                            className={`block bg-black/30 border-2 rounded-md transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                                tappedTemplate === template.id.toString()
                                    ? 'border-yellow-400 bg-yellow-400/20 scale-105 animate-pulse'
                                    : 'border-cyan-400 hover:bg-black/50 hover:border-cyan-300'
                            }`}
                            onClick={() => {
                                setTappedTemplate(template.id.toString());
                                setIsNavigating(true);
                                // Reset after animation
                                setTimeout(() => setTappedTemplate(null), 300);
                            }}
                        >
                            <div className="relative">
                                <img
                                    src={template.image_url}
                                    alt={template.template_id}
                                    className="w-full h-48 object-cover rounded"
                                />
                                {tappedTemplate === template.id.toString() && (
                                    <div className="absolute inset-0 bg-yellow-400/20 rounded animate-pulse" />
                                )}
                            </div>
                        </Link>
                    ))}
            </div>
            <BottomNavigation />
        </>
    );
} 