"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HistoryData {
    chapterId: string;
    chapterOrder: number;
    chapterTitle: string;
    timestamp: number;
}

interface HistoryDisplayProps {
    novelId: string;
    slug: string;
}

export default function HistoryDisplay({ novelId, slug }: HistoryDisplayProps) {
    const [history, setHistory] = useState<HistoryData | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const historyKey = "lentera_baca_history";
            const currentHistory = JSON.parse(localStorage.getItem(historyKey) || "{}");
            if (currentHistory[novelId]) {
                setHistory(currentHistory[novelId]);
            }
        }
    }, [novelId]);

    if (!history) return null;

    return (
        <div className="mb-6 p-5 bg-gradient-to-r from-[#3E2723] to-[#5D4037] text-[#F5F5DC] rounded-2xl shadow-lg border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] opacity-60 mb-1">Terakhir Dibaca</p>
                    <h3 className="text-lg font-bold line-clamp-1">
                        Bab {history.chapterOrder}: {history.chapterTitle}
                    </h3>
                </div>
                <Link
                    href={`/novel/${slug}/chapter/chapter-${history.chapterOrder}`}
                    className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-[#F5F5DC] text-[#3E2723] px-6 py-2.5 rounded-xl font-bold hover:bg-white transition-all active:scale-95 shadow-md"
                >
                    Lanjutkan
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
    );
}
