"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
        <div className="mb-8 p-6 bg-white/60 border border-black/5 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1">Terakhir Dibaca</p>
                    <h3 className="text-xl font-bold">
                        Bab {history.chapterOrder}: {history.chapterTitle}
                    </h3>
                </div>
                <Link
                    href={`/novel/${slug}/chapter/${history.chapterId}`}
                    className="w-full md:w-auto bg-[#3E2723] text-[#F5F5DC] px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95 text-center"
                >
                    Lanjutkan Membaca
                </Link>
            </div>
        </div>
    );
}
