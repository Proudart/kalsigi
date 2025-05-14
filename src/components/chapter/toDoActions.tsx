"use client";

import { Share2, MessageSquare } from "lucide-react";

export default function ActionButton() {
    return (
        <div className="flex gap-4">
            <button
                onClick={() => document.getElementById('share-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-1 p-2 rounded-lg bg-background-200 hover:bg-background-300 transition-colors"
            >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
            </button>

            <button
                onClick={() => document.getElementById('chapter-comments')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-1 p-2 rounded-lg bg-background-200 hover:bg-background-300 transition-colors"
            >
                <MessageSquare className="w-4 h-4" />
                <span>Comments</span>
            </button>
        </div>
    );
}
