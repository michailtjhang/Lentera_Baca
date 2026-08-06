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
            <div className="bg-white/40 dark:bg-white/5 p-6 sm:p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5">
                <h3 className="text-[0.65rem] font-black uppercase tracking-[0.3em] opacity-30 mb-4 flex items-center gap-2">
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
                    className={`text-base sm:text-[1rem] leading-[1.85] font-medium opacity-80 prose prose-base dark:prose-invert max-w-none prose-p:font-serif transition-all duration-300 ${
                        expanded ? "" : "max-h-[130px] overflow-hidden"
                    }`}
                    dangerouslySetInnerHTML={{ __html: description }}
                />

                {!expanded && (
                    <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white/80 to-transparent dark:from-zinc-900/80 dark:to-transparent pointer-events-none rounded-b-[2.5rem]" />
                )}
            </div>

            <button
                onClick={() => setExpanded(!expanded)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[0.65rem] font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
                <span>{expanded ? "Sembunyikan" : "Lihat Selengkapnya"}</span>
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
        </div>
    );
}

