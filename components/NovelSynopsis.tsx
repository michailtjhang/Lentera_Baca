"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";

interface NovelSynopsisProps {
    description?: string | null;
}

export default function NovelSynopsis({ description }: NovelSynopsisProps) {
    const [expanded, setExpanded] = useState(false);

    if (!description) {
        return (
            <div className="bg-white/60 dark:bg-white/5 p-6 sm:p-8 rounded-3xl border border-black/5 dark:border-white/10 backdrop-blur-sm">
                <h3 className="text-[0.65rem] font-black uppercase tracking-[0.25em] opacity-40 mb-3 flex items-center gap-2">
                    <BookOpen size={14} className="text-amber-600 dark:text-amber-400" /> Sinopsis Cerita
                </h3>
                <p className="text-sm opacity-40 italic">Tidak ada deskripsi tersedia untuk novel ini.</p>
            </div>
        );
    }

    return (
        <div className="bg-white/60 dark:bg-white/5 p-6 sm:p-8 rounded-3xl border border-black/5 dark:border-white/10 backdrop-blur-sm relative">
            <h3 className="text-[0.65rem] font-black uppercase tracking-[0.25em] opacity-50 mb-3 flex items-center gap-2">
                <BookOpen size={14} className="text-amber-600 dark:text-amber-400" /> Sinopsis Cerita
            </h3>

            <div className="relative">
                <div
                    className={`text-sm sm:text-base leading-[1.8] font-normal opacity-85 prose prose-sm sm:prose-base dark:prose-invert max-w-none transition-all duration-300 ${
                        expanded ? "" : "max-h-[140px] overflow-hidden"
                    }`}
                    dangerouslySetInnerHTML={{ __html: description }}
                />

                {!expanded && (
                    <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white/95 to-transparent dark:from-[#18181b]/95 dark:to-transparent pointer-events-none rounded-b-3xl" />
                )}
            </div>

            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold transition-all cursor-pointer"
            >
                <span>{expanded ? "Tutup Sinopsis" : "Baca Sinopsis Lengkap"}</span>
                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
        </div>
    );
}
