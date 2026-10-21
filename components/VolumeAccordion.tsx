"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
    ChevronDown, 
    ChevronRight, 
    Image as ImageIcon, 
    Book, 
    Sparkles, 
    LogOut, 
    Layers, 
    Search, 
    ArrowUpDown, 
    CheckCircle2, 
    Eye 
} from "lucide-react";
import { ChapterType } from "@prisma/client";
import { getChapterSlug, formatChapterTitle } from "@/lib/slug-utils";

interface Chapter {
    id: string;
    title?: string | null;
    order: number;
    type: ChapterType;
}

interface Volume {
    id: string;
    title: string;
    order: number;
    chapters: Chapter[];
}

interface VolumeAccordionProps {
    volumes: Volume[];
    standaloneChapters: Chapter[];
    allChapters: Chapter[];
    slug: string;
    novelId: string;
}

export default function VolumeAccordion({
    volumes,
    standaloneChapters,
    allChapters,
    slug,
    novelId,
}: VolumeAccordionProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortAsc, setSortAsc] = useState(true);
    const [lastReadId, setLastReadId] = useState<string | null>(null);
    const [readChapterIds, setReadChapterIds] = useState<string[]>([]);

    const [openVolumes, setOpenVolumes] = useState<Record<string, boolean>>(() => {
        // Open all volumes or at least the latest by default
        const initial: Record<string, boolean> = {};
        volumes.forEach((v) => {
            initial[v.id] = true;
        });
        return initial;
    });

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

    const toggleVolume = (id: string) => {
        setOpenVolumes((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleAll = (open: boolean) => {
        const next: Record<string, boolean> = {};
        volumes.forEach((v) => {
            next[v.id] = open;
        });
        setOpenVolumes(next);
    };

    const getChapterIcon = (type: ChapterType) => {
        switch (type.toString()) {
            case "PROLOGUE":
                return <Sparkles size={14} className="text-indigo-500" />;
            case "ILLUSTRATION":
                return <ImageIcon size={14} className="text-blue-500" />;
            case "EPILOGUE":
                return <LogOut size={14} className="text-amber-500" />;
            case "SIDESTORY":
                return <Sparkles size={14} className="text-purple-500" />;
            case "INTERLUDE":
                return <Layers size={14} className="text-teal-500" />;
            default:
                return <Book size={14} className="opacity-40" />;
        }
    };

    const getChapterBadge = (type: ChapterType) => {
        switch (type.toString()) {
            case "PROLOGUE":
                return "Prolog";
            case "ILLUSTRATION":
                return "Ilustrasi";
            case "EPILOGUE":
                return "Epilog";
            case "SIDESTORY":
                return "Side Story";
            case "INTERLUDE":
                return "Selingan";
            default:
                return null;
        }
    };

    // Filter and sort chapters
    const filterChapters = (chapters: Chapter[]) => {
        let result = [...chapters];
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter((c) => {
                const title = (c.title || "").toLowerCase();
                const formatted = formatChapterTitle(c, allChapters).toLowerCase();
                const order = c.order.toString();
                return title.includes(query) || formatted.includes(query) || order === query;
            });
        }
        if (!sortAsc) {
            result.reverse();
        }
        return result;
    };

    const filteredStandalone = useMemo(() => filterChapters(standaloneChapters), [
        standaloneChapters,
        searchQuery,
        sortAsc,
        allChapters,
    ]);

    const renderChapterLink = (chapter: Chapter, volIndex?: number) => {
        const isRead = readChapterIds.includes(chapter.id);
        const isLastRead = lastReadId === chapter.id;

        return (
            <Link
                key={chapter.id}
                href={`/novel/${slug}/${getChapterSlug(chapter, allChapters)}`}
                className={`flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 hover:bg-black/4 dark:hover:bg-white/5 transition-all group border-b border-black/5 dark:border-white/5 last:border-0 ${
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
                    {volIndex !== undefined ? volIndex + 1 : chapter.order}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                        {getChapterIcon(chapter.type)}
                        <h4
                            className={`text-sm font-bold truncate transition-colors ${
                                isLastRead
                                    ? "text-amber-800 dark:text-amber-300"
                                    : "text-[#3E2723] dark:text-[#f0f0f0] group-hover:text-amber-700 dark:group-hover:text-amber-400"
                            }`}
                        >
                            {formatChapterTitle(chapter, allChapters)}
                        </h4>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                        {getChapterBadge(chapter.type) && (
                            <span className="text-[0.6rem] font-black uppercase tracking-wider opacity-50">
                                {getChapterBadge(chapter.type)}
                            </span>
                        )}
                        {isLastRead && (
                            <span className="text-[0.6rem] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                                Terakhir Dibaca
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
    };

    return (
        <div className="space-y-4">
            {/* Toolbar: Search & Sort Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl backdrop-blur-sm">
                {/* Search */}
                <div className="relative flex-1">
                    <Search
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none"
                    />
                    <input
                        type="text"
                        placeholder="Cari judul atau nomor chapter..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-transparent focus:outline-none placeholder:opacity-40 text-[#3E2723] dark:text-white"
                    />
                </div>

                {/* Sort & Toggle Buttons */}
                <div className="flex items-center gap-2 shrink-0 px-2 sm:px-0">
                    <button
                        type="button"
                        onClick={() => setSortAsc(!sortAsc)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all text-[#3E2723] dark:text-white cursor-pointer"
                        title={sortAsc ? "Urutan: Terlama ke Terbaru" : "Urutan: Terbaru ke Terlama"}
                    >
                        <ArrowUpDown size={13} />
                        <span>{sortAsc ? "Terlama" : "Terbaru"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            const allOpen = Object.values(openVolumes).every(Boolean);
                            toggleAll(!allOpen);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all text-[#3E2723] dark:text-white cursor-pointer"
                    >
                        {Object.values(openVolumes).every(Boolean) ? "Tutup Semua" : "Buka Semua"}
                    </button>
                </div>
            </div>

            {/* Standalone Chapters (Prologue, etc.) */}
            {filteredStandalone.length > 0 && (
                <div className="bg-white/70 dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/10 overflow-hidden shadow-sm">
                    <div className="px-6 py-3.5 bg-black/3 dark:bg-white/5 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                        <h4 className="text-[0.65rem] font-black uppercase tracking-[0.2em] opacity-50">
                            Pendahuluan / Lainnya
                        </h4>
                        <span className="text-[0.65rem] font-bold opacity-40">
                            {filteredStandalone.length} Chapter
                        </span>
                    </div>
                    <div className="divide-y divide-black/5 dark:divide-white/5">
                        {filteredStandalone.map((c) => renderChapterLink(c))}
                    </div>
                </div>
            )}

            {/* Volumes */}
            {volumes.map((vol) => {
                const volChapters = filterChapters(vol.chapters);
                const isOpen = !!openVolumes[vol.id];

                return (
                    <div
                        key={vol.id}
                        className="bg-white/70 dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/10 overflow-hidden shadow-sm transition-all"
                    >
                        {/* Volume Accordion Header */}
                        <button
                            type="button"
                            onClick={() => toggleVolume(vol.id)}
                            className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between hover:bg-black/2 dark:hover:bg-white/5 transition-colors cursor-pointer text-left"
                        >
                            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#3E2723] to-[#5D4037] dark:from-amber-600 dark:to-amber-800 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
                                    {vol.order}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base sm:text-lg font-black tracking-tight text-[#3E2723] dark:text-white truncate">
                                        {vol.title}
                                    </h3>
                                    <p className="text-[0.65rem] font-bold opacity-40 mt-0.5">
                                        {volChapters.length} dari {vol.chapters.length} Konten Tersedia
                                    </p>
                                </div>
                            </div>

                            <div
                                className={`transition-transform duration-300 shrink-0 ml-2 ${
                                    isOpen ? "rotate-180" : ""
                                }`}
                            >
                                <ChevronDown size={20} className="opacity-40" />
                            </div>
                        </button>

                        {/* Volume Chapters List */}
                        {isOpen && (
                            <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                                <div className="bg-white/80 dark:bg-black/30 rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden">
                                    {volChapters.length > 0 ? (
                                        volChapters.map((c, i) => renderChapterLink(c, i))
                                    ) : (
                                        <div className="p-8 text-center opacity-40 italic text-xs">
                                            {searchQuery ? "Tidak ada chapter yang cocok dengan pencarian." : "Belum ada chapter di volume ini."}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
