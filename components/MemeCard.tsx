import Image from "next/image";
import { Heart } from "lucide-react";

function formatDate(dateString?: string) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" });
}

export function MemeCard({ meme }: { meme: { image_url: string; caption?: string; likes_count?: number; created_at?: string; }; }) {
    return (
        <div className="rounded-lg overflow-hidden shadow-md bg-cyan-950/80 border border-cyan-700 hover:scale-105 transition-transform cursor-pointer">
            <div className="aspect-square relative w-full mb-2">
                <img
                    src={meme.image_url}
                    alt={meme.caption || "Meme image"}
                    className="object-contain bg-black aspect-square"
                    sizes="(max-width: 768px) 100vw, 33vw"
                />
            </div>

            {meme.caption && (
                <div className="p-2 text-sm text-cyan-100 truncate">
                    {meme.caption}
                </div>
            )}

            <div className="flex items-center justify-between px-2 pb-2 text-xs text-cyan-300">
                <span className="flex items-center gap-1">
                    {/* /farcaster */}
                </span>
                {meme.created_at && (
                    <span className="ml-auto text-cyan-400/80">
                        {formatDate(meme.created_at)}
                    </span>
                )}
            </div>
        </div>
    );
} 