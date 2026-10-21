"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, Bookmark, Share2, Check, ArrowRight, BookOpen } from "lucide-react";
import { getChapterSlug, formatChapterTitle } from "@/lib/slug-utils";

interface NovelHeroActionsProps {
    novelId: string;
    slug: string;
    title: string;
    coverImage?: string | null;
    firstChapterOrder: number;
    allChapters: any[];
}

export default function NovelHeroActions({
    novelId,
    slug,
    title,
    coverImage,
    firstChapterOrder,
    allChapters,
}: NovelHeroActionsProps) {
    const [history, setHistory] = useState<{ chapterOrder: number; chapterId: string; readChapters?: string[] } | null>(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [showFloatingBar, setShowFloatingBar] = useState(false);

    // Load read history and bookmarks from localStorage
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const historyKey = "lentera_baca_history";
            const currentHistory = JSON.parse(localStorage.getItem(historyKey) || "{}");
            if (currentHistory[novelId]) {
                setHistory(currentHistory[novelId]);
            }

            const bookmarkKey = "lentera_baca_bookmarks";
            const bookmarks: string[] = JSON.parse(localStorage.getItem(bookmarkKey) || "[]");
            setIsBookmarked(bookmarks.includes(novelId));
        } catch (e) {
            console.error("Failed to parse storage:", e);
        }

        // Floating action bar scroll listener
        const handleScroll = () => {
            const scrollY = window.scrollY;
            // Show after scrolling 350px
            setShowFloatingBar(scrollY > 350);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [novelId]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 2500);
    };

    const toggleBookmark = () => {
        if (typeof window === "undefined") return;
        try {
            const bookmarkKey = "lentera_baca_bookmarks";
            const bookmarks: string[] = JSON.parse(localStorage.getItem(bookmarkKey) || "[]");
            let next: string[];
            if (bookmarks.includes(novelId)) {
                next = bookmarks.filter((id) => id !== novelId);
                setIsBookmarked(false);
                showToast("Dihapus dari Bookmark");
            } else {
                next = [...bookmarks, novelId];
                setIsBookmarked(true);
                showToast("Disimpan ke Bookmark!");
            }
            localStorage.setItem(bookmarkKey, JSON.stringify(next));
        } catch (e) {
            console.error(e);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `Baca novel ${title} di Lentera Baca!`,
                    url: url,
                });
                return;
            } catch (err) {
                // User cancelled or share failed, fallback to copy
            }
        }

        try {
            await navigator.clipboard.writeText(url);
            showToast("Tautan berhasil disalin!");
        } catch (e) {
            showToast("Gagal menyalin tautan");
        }
    };

    const targetOrder = history ? history.chapterOrder : firstChapterOrder;
    const targetChapter = allChapters.find((c) => c.order === targetOrder) || allChapters[0];
    const chapterSlug = targetChapter ? getChapterSlug(targetChapter, allChapters) : `chapter-${targetOrder}`;

    const readChaptersCount = history?.readChapters?.length || 0;
    const totalChaptersCount = allChapters.length;
    const percentRead = totalChaptersCount > 0 ? Math.round((readChaptersCount / totalChaptersCount) * 100) : 0;

    return (
        <div className="space-y-4">
            {/* Reading Progress indicator if user has read before */}
            {history && totalChaptersCount > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#3E2723] dark:text-amber-200 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <BookOpen size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                        <span className="truncate font-medium">
                            Terakhir: <strong className="font-bold">{targetChapter ? formatChapterTitle(targetChapter, allChapters) : `Chapter ${targetOrder}`}</strong>
                        </span>
                    </div>
                    <span className="shrink-0 text-[0.65rem] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300">
                        {readChaptersCount}/{totalChaptersCount} ({percentRead}%)
                    </span>
                </div>
            )}

            {/* Main Action Buttons */}
            <div className="flex items-center gap-3">
                {allChapters.length > 0 ? (
                    <Link
                        href={`/novel/${slug}/${chapterSlug}`}
                        className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-2xl font-black text-sm tracking-wide shadow-lg shadow-amber-600/25 hover:shadow-xl hover:shadow-amber-600/35 hover:-translate-y-0.5 active:scale-[0.98] transition-all group cursor-pointer"
                    >
                        <Play size={18} className="fill-current group-hover:scale-110 transition-transform" />
                        <span>{history ? "Lanjut Membaca" : "Mulai Membaca"}</span>
                        <ArrowRight size={16} className="opacity-70 group-hover:translate-x-1 transition-transform" />
                    </Link>
                ) : (
                    <div className="flex-1 py-4 px-6 text-center text-xs font-bold opacity-40 bg-black/5 dark:bg-white/5 rounded-2xl">
                        Belum ada chapter tersedia
                    </div>
                )}

                {/* Bookmark Button */}
                <button
                    type="button"
                    onClick={toggleBookmark}
                    title={isBookmarked ? "Hapus dari Bookmark" : "Simpan ke Bookmark"}
                    className={`h-13 w-13 shrink-0 flex items-center justify-center rounded-2xl border transition-all active:scale-90 cursor-pointer ${
                        isBookmarked
                            ? "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20"
                            : "bg-white/60 dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 text-[#3E2723] dark:text-white"
                    }`}
                >
                    <Bookmark size={20} className={isBookmarked ? "fill-current" : ""} />
                </button>

                {/* Share Button */}
                <button
                    type="button"
                    onClick={handleShare}
                    title="Bagikan Novel"
                    className="h-13 w-13 shrink-0 flex items-center justify-center rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:border-black/20 dark:hover:border-white/20 text-[#3E2723] dark:text-white transition-all active:scale-90 cursor-pointer"
                >
                    <Share2 size={20} />
                </button>
            </div>

            {/* Toast feedback */}
            {toastMessage && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-full bg-black/90 dark:bg-white/90 text-white dark:text-black text-xs font-bold flex items-center gap-2 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
                    <Check size={14} className="text-amber-400 dark:text-amber-600" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Mobile Sticky Floating Bottom Bar */}
            {allChapters.length > 0 && showFloatingBar && (
                <div className="lg:hidden fixed bottom-4 inset-x-4 z-40 animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="p-3 bg-white/90 dark:bg-[#18181b]/95 backdrop-blur-xl rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            {coverImage ? (
                                <img
                                    src={coverImage}
                                    alt={title}
                                    className="w-10 h-13 object-cover rounded-lg shadow-sm shrink-0 border border-black/5 dark:border-white/10"
                                />
                            ) : (
                                <div className="w-10 h-13 bg-amber-500/10 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                                    📖
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="text-xs font-bold truncate text-[#3E2723] dark:text-white">
                                    {title}
                                </p>
                                <p className="text-[0.65rem] opacity-50 truncate">
                                    {history ? `Lanjutkan: Ch. ${targetOrder}` : `Mulai: Ch. ${firstChapterOrder}`}
                                </p>
                            </div>
                        </div>

                        <Link
                            href={`/novel/${slug}/${chapterSlug}`}
                            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black text-xs shadow-md shadow-amber-600/25 active:scale-95 transition-all"
                        >
                            <Play size={14} className="fill-current" />
                            <span>{history ? "Lanjut" : "Baca"}</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
