"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MemeCard } from "@/components/MemeCard";
import { useEffect, useState } from "react";

export default function ProfilePage() {
    const { context } = useMiniKit();
    const user = context?.user;
    const fid = user?.fid;

    const [memes, setMemes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const PAGE_SIZE = 12;
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        if (!fid) return;
        setLoading(true);
        setError(null);
        fetch(`/api/user-memes?fid=${fid}&limit=${PAGE_SIZE}&offset=0`)
            .then(res => res.json())
            .then(data => {
                setMemes(data.memes || []);
                setTotal(data.total || 0);
                setOffset(data.memes?.length || 0);
            })
            .catch(err => {
                setError("Failed to load memes");
            })
            .finally(() => setLoading(false));
    }, [fid]);

    const loadMore = () => {
        setLoadingMore(true);
        fetch(`/api/user-memes?fid=${fid}&limit=${PAGE_SIZE}&offset=${offset}`)
            .then(res => res.json())
            .then(data => {
                setMemes(prev => [...prev, ...(data.memes || [])]);
                setOffset(prev => prev + (data.memes?.length || 0));
            })
            .catch(() => setError("Failed to load more memes"))
            .finally(() => setLoadingMore(false));
    };

    const memeCount = memes.length;

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            {/* Profile Header */}
            <div className="flex flex-col items-center gap-4 mb-8">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-cyan-400">
                    <Image
                        // @ts-expect-error: Replace 'pfp' with the correct user image property if available
                        src={user?.avatar || user?.profileImage || "/placeholder-user.jpg"}
                        alt="Profile picture"
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                    />
                </div>
                <h2 className="text-2xl font-bold text-yellow-300 font-comic">
                    {user?.username || "Username"}
                </h2>
                <div className="flex items-center gap-4">
                    <span className="text-cyan-200">{memeCount} Memes</span>
                    <Button variant="outline" className="ml-2">Edit Profile</Button>
                </div>
            </div>

            {/* Meme Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 min-h-[200px]">
                {loading && (
                    <>
                        <div className="aspect-square bg-cyan-900/30 rounded-lg animate-pulse" />
                        <div className="aspect-square bg-cyan-900/30 rounded-lg animate-pulse" />
                        <div className="aspect-square bg-cyan-900/30 rounded-lg animate-pulse" />
                    </>
                )}
                {!loading && memes.length === 0 && (
                    <div className="col-span-3 text-center text-cyan-300 py-8">No memes yet.</div>
                )}
                {!loading && memes.map((meme) => (
                    <MemeCard key={meme.id} meme={meme} />
                ))}
            </div>
            {error && <div className="text-red-400 text-center mt-4">{error}</div>}
            {!loading && memes.length < total && (
                <div className="flex justify-center mt-6">
                    <Button onClick={loadMore} disabled={loadingMore} variant="secondary">
                        {loadingMore ? "Loading..." : "Load More"}
                    </Button>
                </div>
            )}
        </div>
    );
} 