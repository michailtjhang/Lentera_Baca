"use client";

import { useEffect } from "react";

interface ReadingHistoryProps {
    novelId: string;
    chapterId: string;
    chapterOrder: number;
    chapterTitle: string;
}

export default function ReadingHistory({ novelId, chapterId, chapterOrder, chapterTitle }: ReadingHistoryProps) {
    useEffect(() => {
        if (typeof window !== "undefined") {
            const historyKey = "lentera_baca_history";
            const currentHistory = JSON.parse(localStorage.getItem(historyKey) || "{}");

            currentHistory[novelId] = {
                chapterId,
                chapterOrder,
                chapterTitle,
                timestamp: Date.now()
            };

            localStorage.setItem(historyKey, JSON.stringify(currentHistory));
        }
    }, [novelId, chapterId, chapterOrder, chapterTitle]);

    return null;
}
