"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserButton, SignedIn } from "@clerk/nextjs";
import { ChevronLeft, ChevronRight, BookOpen, Home, List } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ReadingHistory from "@/components/ReadingHistory";

interface ReaderLayoutProps {
    novelId: string;
    chapterId: string;
    chapterOrder: number;
    theme: string;
    novelTitle: string;
    chapterTitle: string;
    basePath: string;
    prevChapterLink: string | null;
    nextChapterLink: string | null;
    chapterContent: string;
    chapterType: string;
}

export default function ReaderLayout({
    novelId,
    chapterId,
    chapterOrder,
    theme,
    novelTitle,
    chapterTitle,
    basePath,
    prevChapterLink,
    nextChapterLink,
    chapterContent,
    chapterType,
}: ReaderLayoutProps) {
    const [showNav, setShowNav] = useState(true);

    const handleContainerClick = (e: React.MouseEvent) => {
        // Do not toggle if clicking an interactive element (link, button, etc.)
        const target = e.target as HTMLElement;
        if (target.closest("a, button, input, select, textarea, [role='button']")) {
            return;
        }
        setShowNav(prev => !prev);
    };

    return (
        <div
            onClick={handleContainerClick}
            className="min-h-screen transition-colors duration-500 ease-in-out bg-[#F5F5DC] text-[#3E2723] dark:bg-[#121212] dark:text-[#e0e0e0] select-none md:select-auto cursor-pointer"
        >
            <ReadingHistory
                novelId={novelId}
                chapterId={chapterId}
                chapterOrder={chapterOrder}
                chapterTitle={chapterTitle}
            />

            {/* ─── STICKY TOP NAVBAR ──────────────────────────────────── */}
            <header
                className={`sticky top-0 z-50 border-b border-black/5 dark:border-white/5 px-4 sm:px-6 py-3 backdrop-blur-xl bg-white/80 dark:bg-black/80 transition-all duration-300 ${
                    showNav ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
                }`}
            >
                <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link
                            href={basePath}
                            className="group flex items-center gap-1.5 text-[0.65rem] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity shrink-0"
                        >
                            <ChevronLeft size={16} />
                            <span className="hidden sm:inline">Kembali</span>
                        </Link>
                        <div className="h-4 w-px bg-black/10 dark:bg-white/10 shrink-0" />
                        {/* Novel Title (Compact Font Size) */}
                        <Link
                            href={basePath}
                            className="text-xs sm:text-sm font-bold truncate opacity-80 hover:opacity-100 transition-opacity"
                            title={novelTitle}
                        >
                            {novelTitle}
                        </Link>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <ThemeToggle currentTheme={theme} variant="minimal" />
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                    </div>
                </div>
            </header>

            {/* ─── MAIN READER CONTENT ────────────────────────────────── */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 cursor-text">
                {/* Subnav: Prev - TOC - Next / Detail Novel */}
                <nav
                    className={`flex justify-between items-center mb-8 sm:mb-12 py-3 border-y border-black/5 dark:border-white/5 transition-all duration-300 ${
                        showNav ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                >
                    {prevChapterLink ? (
                        <Link
                            href={prevChapterLink}
                            className="flex items-center gap-1.5 sm:gap-2 text-[0.65rem] font-black uppercase tracking-widest px-3 sm:px-5 py-2 rounded-xl border transition-all active:scale-95 border-black/5 hover:bg-black/5 text-[#3E2723] dark:border-white/10 dark:hover:bg-white/5 dark:text-white shadow-sm"
                        >
                            <ChevronLeft size={14} /> Prev
                        </Link>
                    ) : (
                        <div className="w-[70px] sm:w-[85px]" />
                    )}

                    {/* Center: TOC / Daftar Isi */}
                    <Link
                        href={basePath}
                        className="flex items-center gap-1.5 text-[0.65rem] font-black uppercase tracking-[0.15em] opacity-60 hover:opacity-100 transition-opacity border-b border-current dark:text-gray-300 py-0.5"
                    >
                        <List size={13} />
                        Daftar Isi
                    </Link>

                    {nextChapterLink ? (
                        <Link
                            href={nextChapterLink}
                            className="flex items-center gap-1.5 sm:gap-2 text-[0.65rem] font-black uppercase tracking-widest px-3 sm:px-5 py-2 rounded-xl border transition-all active:scale-95 border-black/5 hover:bg-black/5 text-[#3E2723] dark:border-white/10 dark:hover:bg-white/5 dark:text-white shadow-sm"
                        >
                            Next <ChevronRight size={14} />
                        </Link>
                    ) : (
                        /* When last chapter: replace with Home / Detail Novel button */
                        <Link
                            href={basePath}
                            className="flex items-center gap-1.5 sm:gap-2 text-[0.65rem] font-black uppercase tracking-widest px-3 sm:px-4 py-2 rounded-xl bg-[#3E2723] text-[#F5F5DC] dark:bg-white dark:text-black transition-all active:scale-95 shadow-md hover:shadow-lg"
                            title="Ke Detail Novel"
                        >
                            <Home size={13} />
                            <span>Detail Novel</span>
                        </Link>
                    )}
                </nav>

                {/* Chapter Title Heading (Compact & clean font size) */}
                <header className="mb-10 text-center">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-snug dark:text-white">
                        {chapterTitle}
                    </h1>
                </header>

                {/* Chapter Body Content */}
                <div
                    className={`text-base sm:text-lg md:text-xl leading-[1.8] sm:leading-[2] space-y-6 opacity-90 prose prose-base sm:prose-lg dark:prose-invert max-w-none prose-p:mb-6 prose-img:w-full prose-img:h-auto prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-8 prose-img:mx-auto prose-img:block ${
                        chapterType === "ILLUSTRATION"
                            ? "prose-img:max-h-[90vh] prose-img:object-contain"
                            : ""
                    }`}
                    dangerouslySetInnerHTML={{ __html: chapterContent }}
                />

                {/* Bottom Nav: Prev - TOC - Next / Detail Novel */}
                <nav
                    className={`mt-16 sm:mt-24 flex justify-between items-center border-t border-black/5 pt-8 sm:pt-12 dark:border-white/5 transition-all duration-300 ${
                        showNav ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                >
                    {prevChapterLink ? (
                        <Link
                            href={prevChapterLink}
                            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border transition-all active:scale-95 border-black/5 hover:bg-black/5 text-[#3E2723] dark:border-white/10 dark:hover:bg-white/5 dark:text-white shadow-sm"
                            title="Sebelumnya"
                        >
                            <ChevronLeft size={22} />
                        </Link>
                    ) : (
                        <div className="w-12 sm:w-14" />
                    )}

                    <Link
                        href={basePath}
                        className="flex items-center gap-2 px-6 sm:px-8 h-12 sm:h-14 rounded-2xl border font-bold text-xs sm:text-sm transition-all active:scale-95 border-black/5 hover:bg-black/5 text-[#3E2723] dark:border-white/10 dark:hover:bg-white/5 dark:text-white shadow-sm"
                    >
                        Daftar Isi
                    </Link>

                    {nextChapterLink ? (
                        <Link
                            href={nextChapterLink}
                            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border transition-all active:scale-95 border-black/5 hover:bg-black/5 text-[#3E2723] dark:border-white/10 dark:hover:bg-white/5 dark:text-white shadow-sm"
                            title="Selanjutnya"
                        >
                            <ChevronRight size={22} />
                        </Link>
                    ) : (
                        <Link
                            href={basePath}
                            className="flex items-center justify-center gap-1.5 px-4 h-12 sm:h-14 rounded-2xl bg-[#3E2723] text-[#F5F5DC] dark:bg-white dark:text-black font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-md"
                            title="Ke Detail Novel"
                        >
                            <Home size={16} />
                            <span className="hidden sm:inline">Detail Novel</span>
                        </Link>
                    )}
                </nav>
            </main>
        </div>
    );
}
