"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";

interface ReadButtonProps {
    novelId: string;
    slug: string;
    firstChapterOrder: number;
}

export default function ReadButton({ novelId, slug, firstChapterOrder }: ReadButtonProps) {
    const [history, setHistory] = useState<{ chapterOrder: number } | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const historyKey = "lentera_baca_history";
            const currentHistory = JSON.parse(localStorage.getItem(historyKey) || "{}");
            if (currentHistory[novelId]) {
                setHistory(currentHistory[novelId]);
            }
        }
    }, [novelId]);

    const targetOrder = history ? history.chapterOrder : firstChapterOrder;
    const label = history ? "Lanjut Baca" : "Mulai Baca";

    return (
        <Link
            href={`/novel/${slug}/chapter-${targetOrder}`}
            className="flex-1 flex items-center justify-center gap-3 bg-[#3E2723] dark:bg-white text-[#F5F5DC] dark:text-black rounded-[2rem] font-black uppercase tracking-widest text-[0.7rem] hover:shadow-2xl transition-all active:scale-95 group"
        >
            <Play size={16} className="fill-current group-hover:scale-110 transition-transform" />
            {label}
        </Link>
    );
}
