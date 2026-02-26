"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

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
    const [readChapterIds, setReadChapterIds] = useState<string[]>([]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const historyKey = "lentera_baca_history";
            const currentHistory = JSON.parse(localStorage.getItem(historyKey) || "{}");
            if (currentHistory[novelId]) {
                setLastReadId(currentHistory[novelId].chapterId);
                setReadChapterIds(currentHistory[novelId].readChapters || []);
            }
        }
    }, [novelId]);

    return (
        <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar border border-black/5 rounded-2xl bg-white/40 shadow-inner">
            <div className="divide-y divide-black/5">
                {chapters.map((chapter) => {
                    const isRead = readChapterIds.includes(chapter.id);
                    const isLastRead = lastReadId === chapter.id;

                    return (
                        <Link
                            key={chapter.id}
                            href={`/novel/${slug}/chapter/chapter-${chapter.order}`}
                            className={`flex items-center gap-4 p-4 hover:bg-white/60 transition-all group ${isLastRead ? "bg-white/80 border-l-4 border-l-[#3E2723]" : ""
                                } ${isRead && !isLastRead ? "opacity-50" : "opacity-100"}`}
                        >
                            <span className="text-lg font-black min-w-[2.5rem] text-[#3E2723] opacity-80">
                                #{chapter.order}
                            </span>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-[#3E2723] group-hover:text-black transition-colors line-clamp-1">
                                    {chapter.title}
                                </h3>
                                {isLastRead && (
                                    <span className="text-[0.6rem] font-bold uppercase tracking-widest text-[#3E2723] bg-[#3E2723]/10 px-2 py-0.5 rounded mt-1 inline-block">
                                        Sedang Dibaca
                                    </span>
                                )}
                            </div>
                            <ChevronRight size={16} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                        </Link>
                    );
                })}
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
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
