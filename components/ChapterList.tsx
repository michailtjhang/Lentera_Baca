"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Chapter {
    id: string;
    title: string;
    order: number;
    createdAt: Date | string;
}

interface ChapterListProps {
    chapters: Chapter[];
    slug: string;
    novelId: string;
}

export default function ChapterList({ chapters, slug, novelId }: ChapterListProps) {
    const [lastReadId, setLastReadId] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const historyKey = "lentera_baca_history";
            const currentHistory = JSON.parse(localStorage.getItem(historyKey) || "{}");
            if (currentHistory[novelId]) {
                setLastReadId(currentHistory[novelId].chapterId);
            }
        }
    }, [novelId]);

    return (
        <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar border border-black/5 rounded-2xl bg-white/40">
            <div className="divide-y divide-black/5">
                {chapters.map((chapter) => (
                    <Link
                        key={chapter.id}
                        href={`/novel/${slug}/chapter/${chapter.id}`}
                        className={`flex items-center gap-6 p-5 hover:bg-white/60 transition-all group ${lastReadId === chapter.id ? "bg-white/80 border-l-4 border-l-[#3E2723]" : ""
                            }`}
                    >
                        <span className="text-2xl font-black opacity-90 min-w-[3rem] text-[#3E2723]">
                            #{chapter.order}
                        </span>
                        <div className="flex-1">
                            <h3 className="text-[1.05rem] font-medium text-[#3E2723] opacity-90 group-hover:opacity-100 transition-opacity">
                                {chapter.title}
                            </h3>
                            {lastReadId === chapter.id && (
                                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[#3E2723]/60 bg-[#3E2723]/5 px-2 py-0.5 rounded mt-1 inline-block">
                                    Sedang Dibaca
                                </span>
                            )}
                        </div>
                        <span className="text-sm font-bold opacity-0 group-hover:opacity-40 transition-opacity">
                            Baca →
                        </span>
                    </Link>
                ))}
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(62, 39, 35, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(62, 39, 35, 0.2);
                }
            `}</style>
        </div>
    );
}
