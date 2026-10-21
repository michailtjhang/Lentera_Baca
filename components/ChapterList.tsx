"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Search, ArrowUpDown, CheckCircle2 } from "lucide-react";
import { getChapterSlug, formatChapterTitle } from "@/lib/slug-utils";
import { ChapterType } from "@prisma/client";

interface Chapter {
    id: string;
    title: string;
    order: number;
    type: ChapterType;
    createdAt: Date | string;
}

interface ChapterListProps {
    chapters: Chapter[];
    slug: string;
    novelId: string;
}

export default function ChapterList({ chapters, slug, novelId }: ChapterListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortAsc, setSortAsc] = useState(true);
    const [lastReadId, setLastReadId] = useState<string | null>(null);
    const [readChapterIds, setReadChapterIds] = useState<string[]>([]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const historyKey = "lentera_baca_history";
                const currentHistory = JSON.parse(localStorage.getItem(historyKey) || "{}");
                if (currentHistory[novelId]) {
                    setLastReadId(currentHistory[novelId].chapterId);
                    setReadChapterIds(currentHistory[novelId].readChapters || []);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }, [novelId]);

    const filteredChapters = useMemo(() => {
        let result = [...chapters];
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter((c) => {
                const title = (c.title || "").toLowerCase();
                const formatted = formatChapterTitle(c, chapters).toLowerCase();
                const order = c.order.toString();
                return title.includes(query) || formatted.includes(query) || order === query;
            });
        }
        if (!sortAsc) {
            result.reverse();
        }
        return result;
    }, [chapters, searchQuery, sortAsc]);

    return (
        <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 p-2 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl backdrop-blur-sm">
                <div className="relative flex-1">
                    <Search
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none"
                    />
                    <input
                        type="text"
                        placeholder="Cari chapter..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-transparent focus:outline-none placeholder:opacity-40 text-[#3E2723] dark:text-white"
                    />
                </div>

                <button
                    type="button"
                    onClick={() => setSortAsc(!sortAsc)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all text-[#3E2723] dark:text-white shrink-0 cursor-pointer"
                >
                    <ArrowUpDown size={13} />
                    <span>{sortAsc ? "Terlama" : "Terbaru"}</span>
                </button>
            </div>

            {/* List */}
            <div className="max-h-[600px] overflow-y-auto pr-1 custom-scrollbar border border-black/5 dark:border-white/10 rounded-3xl bg-white/70 dark:bg-white/5 shadow-sm">
                {filteredChapters.length === 0 ? (
                    <div className="p-8 text-center text-xs opacity-40 italic">
                        Tidak ada chapter yang cocok dengan pencarian.
                    </div>
                ) : (
                    <div className="divide-y divide-black/5 dark:divide-white/5">
                        {filteredChapters.map((chapter) => {
                            const isRead = readChapterIds.includes(chapter.id);
                            const isLastRead = lastReadId === chapter.id;

                            return (
                                <Link
                                    key={chapter.id}
                                    href={`/novel/${slug}/${getChapterSlug(chapter, chapters)}`}
                                    className={`flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 hover:bg-black/3 dark:hover:bg-white/5 transition-all group ${
                                        isLastRead
                                            ? "bg-amber-500/10 dark:bg-amber-500/15 border-l-4 border-l-amber-600 dark:border-l-amber-400"
                                            : isRead
                                            ? "opacity-60 hover:opacity-100"
                                            : ""
                                    }`}
                                >
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black shrink-0 transition-colors ${
                                            isLastRead
                                                ? "bg-amber-600 text-white shadow-sm"
                                                : isRead
                                                ? "bg-black/5 dark:bg-white/5 text-[#3E2723]/60 dark:text-white/60"
                                                : "bg-black/5 dark:bg-white/5 text-[#3E2723] dark:text-white group-hover:bg-[#3E2723] group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black"
                                        }`}
                                    >
                                        {chapter.order}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4
                                            className={`text-sm font-bold truncate transition-colors ${
                                                isLastRead
                                                    ? "text-amber-800 dark:text-amber-300"
                                                    : "text-[#3E2723] dark:text-[#f0f0f0] group-hover:text-amber-700 dark:group-hover:text-amber-400"
                                            }`}
                                        >
                                            {formatChapterTitle(chapter, chapters)}
                                        </h4>

                                        <div className="flex items-center gap-2 mt-0.5">
                                            {isLastRead && (
                                                <span className="text-[0.6rem] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                                                    Sedang Dibaca
                                                </span>
                                            )}
                                            {isRead && !isLastRead && (
                                                <span className="flex items-center gap-1 text-[0.6rem] font-bold opacity-40">
                                                    <CheckCircle2 size={10} className="text-emerald-500" /> Sudah Dibaca
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <ChevronRight
                                        size={16}
                                        className="opacity-0 group-hover:opacity-60 -translate-x-1 group-hover:translate-x-0 transition-all shrink-0 text-[#3E2723] dark:text-white"
                                    />
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(180, 150, 100, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(180, 150, 100, 0.4);
                }
            `}</style>
        </div>
    );
}
