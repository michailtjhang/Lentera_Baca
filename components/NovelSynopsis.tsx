"use client";

import { useState } from "react";
import { Hash, ChevronDown, ChevronUp } from "lucide-react";

interface NovelSynopsisProps {
    description?: string | null;
}

export default function NovelSynopsis({ description }: NovelSynopsisProps) {
    const [expanded, setExpanded] = useState(false);

    if (!description) {
        return (
            <div className="bg-white/40 dark:bg-white/5 p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5">
                <h3 className="text-[0.65rem] font-black uppercase tracking-[0.3em] opacity-30 mb-6 flex items-center gap-2">
                    <Hash size={14} /> Sinopsis
                </h3>
                <p className="text-base opacity-40 font-serif italic">Tidak ada deskripsi tersedia.</p>
            </div>
        );
    }

    return (
        <div className="bg-white/40 dark:bg-white/5 p-6 sm:p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5 relative">
            <h3 className="text-[0.65rem] font-black uppercase tracking-[0.3em] opacity-40 mb-4 flex items-center gap-2">
                <Hash size={14} /> Sinopsis
            </h3>

            <div className="relative">
                <div
                    className={`text-base sm:text-lg leading-[1.8] font-medium opacity-85 prose prose-lg dark:prose-invert max-w-none prose-p:font-serif transition-all duration-300 ${
                        expanded ? "" : "line-clamp-4 max-h-[160px] overflow-hidden"
                    }`}
                    dangerouslySetInnerHTML={{ __html: description }}
                />

                {!expanded && (
                    <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#FDFCF0] via-[#FDFCF0]/80 to-transparent dark:from-[#121212] dark:via-[#121212]/80 pointer-events-none" />
                )}
            </div>

            <button
                onClick={() => setExpanded(!expanded)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
                <span>{expanded ? "Sembunyikan" : "Lihat Selengkapnya"}</span>
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
        </div>
    );
}
