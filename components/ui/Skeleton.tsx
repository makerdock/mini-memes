import React from "react";

export function Skeleton({ className }: { className?: string; }) {
    return (
        <div
            className={`animate-pulse bg-gradient-to-r from-gray-300/20 via-gray-400/30 to-gray-300/20 rounded ${className}`}
        />
    );
} 