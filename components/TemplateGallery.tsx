"use client";

import Link from "next/link";
import { Skeleton } from "./ui/Skeleton";
import { BottomNavigation } from "./ui/BottomNavigation";
import type { MemeTemplate } from "../lib/meme-templates";

interface TemplateGalleryProps {
    templates: MemeTemplate[];
    error?: string | null;
}

export function TemplateGallery({ templates, error }: TemplateGalleryProps) {
    const loading = !error && templates.length === 0;

    return (
        <>
            {error && <div className="text-center text-red-400">{error}</div>}
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
                            className="block bg-black/30 border-2 border-cyan-400 rounded-md hover:bg-black/50 transition"
                        >
                            <img
                                src={template.image_url}
                                alt={template.template_id}
                                className="w-full h-48 object-cover rounded"
                            />
                        </Link>
                    ))}
            </div>
            <BottomNavigation />
        </>
    );
} 