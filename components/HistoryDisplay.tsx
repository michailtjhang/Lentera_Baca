"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { getChapterSlug, formatChapterTitle } from "@/lib/slug-utils";

interface HistoryData {
    chapterId: string;
    chapterOrder: number;
    chapterTitle: string;
    timestamp: number;
}

interface HistoryDisplayProps {
    novelId: string;
    slug: string;
    allChapters: any[];
}

export default function HistoryDisplay({ novelId, slug, allChapters }: HistoryDisplayProps) {
    const [history, setHistory] = useState<HistoryData | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const historyKey = "lentera_baca_history";
                const currentHistory = JSON.parse(localStorage.getItem(historyKey) || "{}");
                if (currentHistory[novelId]) {
                    setHistory(currentHistory[novelId]);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }, [novelId]);

    if (!history) return null;

    const targetChapter =
        allChapters.find((c) => c.id === history.chapterId) ||
        allChapters.find((c) => c.order === history.chapterOrder);
    const chapterSlug = targetChapter ? getChapterSlug(targetChapter, allChapters) : `chapter-${history.chapterOrder}`;

    return (
        <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-amber-900/90 via-[#3E2723] to-[#2B1810] text-amber-50 rounded-3xl shadow-xl border border-amber-500/20 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/20">
                        <BookOpen size={18} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-amber-200/80">
                                Lanjutkan Membaca
                            </p>
                        </div>
                        <h4 className="text-base sm:text-lg font-black truncate text-white mt-0.5">
                            {targetChapter ? formatChapterTitle(targetChapter, allChapters) : history.chapterTitle}
                        </h4>
                    </div>
                </div>

                <Link
                    href={`/novel/${slug}/${chapterSlug}`}
                    className="group w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                    <span>Lanjut</span>
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
    );
}
