"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { UserButton, SignedIn } from "@clerk/nextjs";
import { 
    ChevronLeft, 
    ChevronRight, 
    ArrowLeft, 
    ArrowUp, 
    List, 
    Home, 
    BookOpen, 
    Type, 
    X, 
    Search, 
    Loader2,
    Sparkles,
    CheckCircle2
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ReadingHistory from "@/components/ReadingHistory";

interface ChapterListItem {
    id: string;
    order: number;
    title: string | null;
    type: string;
    formattedTitle: string;
    link: string;
    isCurrent: boolean;
}

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
    chapters?: ChapterListItem[];
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
    chapters = [],
}: ReaderLayoutProps) {
    // Floating navigation toggle state (hidden by default, toggled on click)
    const [showNav, setShowNav] = useState(false);
    const [showChapterDrawer, setShowChapterDrawer] = useState(false);
    const [chapterFilter, setChapterFilter] = useState("");
    const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");
    const [scrollProgress, setScrollProgress] = useState(0);
    const [contentImagesLoaded, setContentImagesLoaded] = useState(false);
    const [imageCount, setImageCount] = useState(0);
    const [loadedImageCount, setLoadedImageCount] = useState(0);
    const [showHint, setShowHint] = useState(true);

    const contentRef = useRef<HTMLDivElement>(null);

    // Load persisted font size preference
    useEffect(() => {
        try {
            const savedSize = localStorage.getItem("lentera_reader_fontsize");
            if (savedSize === "large" || savedSize === "xlarge" || savedSize === "normal") {
                setFontSize(savedSize);
            }
        } catch (e) {}
    }, []);

    // Dismiss floating hint after 4 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowHint(false);
        }, 4000);
        return () => clearTimeout(timer);
    }, []);

    // Calculate reading scroll progress
    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight > 0) {
                const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
                setScrollProgress(progress);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Image loading tracking for illustrations & embedded images
    useEffect(() => {
        if (!contentRef.current) return;

        const images = contentRef.current.querySelectorAll("img");
        setImageCount(images.length);

        if (images.length === 0) {
            setContentImagesLoaded(true);
            return;
        }

        let loaded = 0;
        const total = images.length;

        images.forEach((img) => {
            // Apply modern comic styling and skeleton classes
            img.classList.add("transition-all", "duration-500", "ease-out");

            if (img.complete && img.naturalHeight !== 0) {
                loaded += 1;
                img.classList.remove("opacity-0", "scale-98");
                img.classList.add("opacity-100", "scale-100");
            } else {
                img.classList.add("opacity-0", "scale-98");
                
                img.onload = () => {
                    loaded += 1;
                    setLoadedImageCount(loaded);
                    img.classList.remove("opacity-0", "scale-98");
                    img.classList.add("opacity-100", "scale-100");
                    if (loaded >= total) {
                        setContentImagesLoaded(true);
                    }
                };

                img.onerror = () => {
                    loaded += 1;
                    setLoadedImageCount(loaded);
                    img.classList.remove("opacity-0");
                    img.classList.add("opacity-50");
                    if (loaded >= total) {
                        setContentImagesLoaded(true);
                    }
                };
            }
        });

        setLoadedImageCount(loaded);
        if (loaded >= total) {
            setContentImagesLoaded(true);
        }
    }, [chapterContent]);

    // Handle container click to toggle floating nav
    const handleContainerClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        // Do not toggle if clicking an interactive element (links, buttons, inputs, modals)
        if (target.closest("a, button, input, select, textarea, [role='button'], [data-interactive='true']")) {
            return;
        }
        setShowNav((prev) => !prev);
        setShowHint(false);
    };

    const handleFontSizeCycle = (e: React.MouseEvent) => {
        e.stopPropagation();
        const nextSize = fontSize === "normal" ? "large" : fontSize === "large" ? "xlarge" : "normal";
        setFontSize(nextSize);
        try {
            localStorage.setItem("lentera_reader_fontsize", nextSize);
        } catch (e) {}
    };

    const scrollToTop = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const filteredChapters = chapters.filter((c) => {
        if (!chapterFilter) return true;
        const q = chapterFilter.toLowerCase();
        return (
            c.formattedTitle.toLowerCase().includes(q) ||
            (c.title && c.title.toLowerCase().includes(q)) ||
            `bab ${c.order}`.includes(q)
        );
    });

    const fontSizeClasses = {
        normal: "text-base sm:text-lg md:text-xl leading-[1.8] sm:leading-[2]",
        large: "text-lg sm:text-xl md:text-2xl leading-[1.9] sm:leading-[2.1]",
        xlarge: "text-xl sm:text-2xl md:text-3xl leading-[2] sm:leading-[2.2]",
    }[fontSize];

    return (
        <div
            onClick={handleContainerClick}
            className="min-h-screen transition-colors duration-500 ease-in-out bg-[#FDFCF0] text-[#3E2723] dark:bg-[#121212] dark:text-[#e0e0e0] select-none md:select-auto cursor-pointer relative"
        >
            <ReadingHistory
                novelId={novelId}
                chapterId={chapterId}
                chapterOrder={chapterOrder}
                chapterTitle={chapterTitle}
            />

            {/* ─── SLIM TOP READING PROGRESS BAR ───────────────────────── */}
            <div className="fixed top-0 left-0 right-0 h-1 z-[60] bg-black/5 dark:bg-white/10 pointer-events-none">
                <div
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 transition-all duration-150"
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>

            {/* ─── FLOATING TOP COMIC NAVIGATION BAR ────────────────────── */}
            <header
                data-interactive="true"
                className={`fixed top-0 inset-x-0 z-50 backdrop-blur-2xl bg-[#2B1810]/95 dark:bg-[#141416]/95 text-white border-b border-white/10 shadow-2xl transition-all duration-300 ease-out ${
                    showNav ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                    {/* Left: Back to Novel Detail & Titles */}
                    <div className="flex items-center gap-3 min-w-0">
                        <Link
                            href={basePath}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold transition-all shrink-0 shadow-sm border border-white/10"
                            title="Kembali ke Halaman Detail Novel"
                        >
                            <ArrowLeft size={15} />
                            <span className="font-black tracking-tight">Detail Novel</span>
                        </Link>

                        <div className="h-4 w-px bg-white/20 shrink-0 hidden xs:block" />

                        <div className="flex flex-col min-w-0">
                            <span
                                className="text-xs sm:text-sm font-extrabold truncate text-white/95"
                                title={novelTitle}
                            >
                                {novelTitle}
                            </span>
                            <span
                                className="text-[10px] sm:text-[11px] font-bold text-amber-300 dark:text-amber-400 truncate opacity-90"
                                title={chapterTitle}
                            >
                                {chapterTitle}
                            </span>
                        </div>
                    </div>

                    {/* Right: Font Size, Theme & Profile */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {/* Font Size Toggle Button */}
                        <button
                            type="button"
                            onClick={handleFontSizeCycle}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-black transition-all border border-white/10 text-white cursor-pointer"
                            title={`Ukuran Font: ${fontSize.toUpperCase()} (Klik untuk ubah)`}
                        >
                            <Type size={14} />
                            <span className="text-[11px] uppercase tracking-wider font-mono">
                                {fontSize === "normal" ? "A" : fontSize === "large" ? "A+" : "A++"}
                            </span>
                        </button>

                        {/* Theme Toggle */}
                        <div className="shrink-0">
                            <ThemeToggle currentTheme={theme} variant="minimal" />
                        </div>

                        <SignedIn>
                            <div className="shrink-0">
                                <UserButton />
                            </div>
                        </SignedIn>
                    </div>
                </div>
            </header>

            {/* ─── INITIAL FLOATING HINT (AUTO-FADES) ────────────────────── */}
            {showHint && !showNav && (
                <aside
                    aria-label="Petunjuk navigasi"
                    className="fixed top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-500"
                >
                    <div className="px-4 py-2 rounded-full bg-black/75 dark:bg-white/90 backdrop-blur-md text-white dark:text-black text-xs font-bold shadow-xl flex items-center gap-2 border border-white/20 dark:border-black/20">
                        <Sparkles size={14} className="text-amber-400 dark:text-amber-600 animate-pulse" />
                        <span>Ketuk layar untuk navigasi & kembali ke novel</span>
                    </div>
                </aside>
            )}

            {/* ─── MAIN READER CONTENT ─────────────────────────────────── */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 md:px-12 py-10 sm:py-16 cursor-text relative">
                {/* Chapter Title Heading */}
                <header className="mb-10 sm:mb-14 text-center">
                    <span className="text-[0.65rem] sm:text-xs font-black uppercase tracking-[0.25em] text-amber-700 dark:text-amber-400 mb-2 inline-block">
                        {novelTitle}
                    </span>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-snug dark:text-white mt-1">
                        {chapterTitle}
                    </h1>
                </header>

                {/* Image Loading State Banner (If Chapter Has Images Still Downloading) */}
                {imageCount > 0 && !contentImagesLoaded && (
                    <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center animate-pulse">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                            <Loader2 size={15} className="animate-spin text-amber-600" />
                            <span>
                                Memuat ilustrasi bab ({loadedImageCount}/{imageCount})...
                            </span>
                        </div>
                    </div>
                )}

                {/* Chapter HTML Content */}
                <div
                    ref={contentRef}
                    className={`space-y-6 opacity-95 prose dark:prose-invert max-w-none prose-p:mb-6 prose-img:w-full prose-img:h-auto prose-img:rounded-3xl prose-img:shadow-2xl prose-img:my-8 prose-img:mx-auto prose-img:block prose-img:border prose-img:border-black/10 dark:prose-img:border-white/10 ${fontSizeClasses} ${
                        chapterType === "ILLUSTRATION"
                            ? "prose-img:max-h-[95vh] prose-img:object-contain prose-img:shadow-none"
                            : ""
                    }`}
                    dangerouslySetInnerHTML={{ __html: chapterContent }}
                />

                {/* ─── BOTTOM END-OF-CHAPTER CARD ───────────────────────── */}
                <div className="mt-16 sm:mt-24 pt-10 border-t border-black/10 dark:border-white/10 text-center space-y-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40">
                        Akhir dari {chapterTitle}
                    </p>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        {prevChapterLink && (
                            <Link
                                href={prevChapterLink}
                                className="px-5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <ChevronLeft size={16} /> Bab Sebelumnya
                            </Link>
                        )}
                        <Link
                            href={basePath}
                            className="px-5 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-xs font-bold transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Home size={15} /> Detail Novel
                        </Link>
                        {nextChapterLink && (
                            <Link
                                href={nextChapterLink}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2"
                            >
                                Bab Selanjutnya <ChevronRight size={16} />
                            </Link>
                        )}
                    </div>
                </div>
            </main>

            {/* ─── FLOATING BOTTOM COMIC NAVIGATION BAR ─────────────────── */}
            <div
                data-interactive="true"
                className={`fixed bottom-4 sm:bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none transition-all duration-300 ease-out ${
                    showNav ? "translate-y-0 opacity-100 scale-100" : "translate-y-16 opacity-0 scale-95"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <nav
                    aria-label="Navigasi membaca melayang"
                    className="pointer-events-auto backdrop-blur-2xl bg-[#2B1810]/95 dark:bg-[#141416]/95 text-white border border-white/15 dark:border-white/10 shadow-2xl rounded-full sm:rounded-2xl p-1.5 sm:p-2 flex items-center justify-between gap-1 sm:gap-2 max-w-lg w-full ring-1 ring-white/10 select-none"
                >
                    {/* Previous Chapter Button */}
                    {prevChapterLink ? (
                        <Link
                            href={prevChapterLink}
                            className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 rounded-full sm:rounded-xl hover:bg-white/10 text-white text-xs font-black uppercase tracking-wider active:scale-95 transition-all shrink-0"
                            title="Bab Sebelumnya"
                        >
                            <ChevronLeft size={16} />
                            <span className="hidden sm:inline">Prev</span>
                        </Link>
                    ) : (
                        <button
                            disabled
                            className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 rounded-full sm:rounded-xl text-white/25 text-xs font-bold cursor-not-allowed shrink-0"
                            title="Sudah di bab pertama"
                        >
                            <ChevronLeft size={16} />
                            <span className="hidden sm:inline">Prev</span>
                        </button>
                    )}

                    {/* Center: Chapter Selector Button (Opens Drawer) */}
                    <button
                        type="button"
                        onClick={() => setShowChapterDrawer(true)}
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-full sm:rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold text-white transition-all min-w-0 flex-1 max-w-[240px] cursor-pointer border border-white/10"
                        title="Daftar Bab Novel"
                    >
                        <List size={14} className="text-amber-400 shrink-0" />
                        <span className="truncate font-black">{chapterTitle}</span>
                        <span className="text-[10px] opacity-60 shrink-0 hidden xs:inline">
                            (Pilih Bab)
                        </span>
                    </button>

                    {/* Next Chapter / Finish Button */}
                    {nextChapterLink ? (
                        <Link
                            href={nextChapterLink}
                            className="flex items-center gap-1 sm:gap-1.5 px-4 sm:px-5 py-2 rounded-full sm:rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-amber-600/30 active:scale-95 transition-all shrink-0"
                            title="Bab Selanjutnya"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight size={16} />
                        </Link>
                    ) : (
                        <Link
                            href={basePath}
                            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full sm:rounded-xl bg-amber-600/25 hover:bg-amber-600/40 text-amber-300 text-xs font-bold transition-all shrink-0 border border-amber-500/30"
                            title="Kembali ke Detail Novel"
                        >
                            <Home size={14} />
                            <span className="hidden sm:inline">Selesai</span>
                        </Link>
                    )}

                    {/* Quick Scroll To Top Button */}
                    <button
                        type="button"
                        onClick={scrollToTop}
                        className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all shrink-0 cursor-pointer"
                        title="Kembali ke Atas"
                    >
                        <ArrowUp size={16} />
                    </button>
                </nav>
            </div>

            {/* ─── CHAPTER LIST BOTTOM DRAWER (MODERN COMIC TOC) ────────── */}
            {showChapterDrawer && (
                <div
                    data-interactive="true"
                    className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
                    onClick={() => setShowChapterDrawer(false)}
                >
                    <div
                        className="bg-[#FDFCF0] dark:bg-[#18181b] text-[#3E2723] dark:text-white w-full max-w-2xl mx-auto rounded-t-[2.5rem] shadow-2xl border-t border-black/10 dark:border-white/10 max-h-[80vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Drawer Header */}
                        <div className="p-5 sm:p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                                    Daftar Chapter
                                </span>
                                <h3 className="text-lg font-black tracking-tight truncate">
                                    {novelTitle}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowChapterDrawer(false)}
                                className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors cursor-pointer shrink-0"
                                aria-label="Tutup daftar chapter"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Search Filter Box */}
                        <div className="px-5 py-3 border-b border-black/5 dark:border-white/10">
                            <div className="relative">
                                <Search
                                    size={15}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none"
                                />
                                <input
                                    type="text"
                                    value={chapterFilter}
                                    onChange={(e) => setChapterFilter(e.target.value)}
                                    placeholder="Cari nomor atau judul bab..."
                                    className="w-full pl-9 pr-4 py-2 rounded-xl text-xs font-medium bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 outline-none focus:ring-2 focus:ring-amber-500/30"
                                />
                            </div>
                        </div>

                        {/* Chapter List */}
                        <div className="p-4 sm:p-6 overflow-y-auto space-y-1.5 flex-1 divide-y divide-black/5 dark:divide-white/5">
                            {filteredChapters.map((ch) => {
                                const isCurrent = ch.id === chapterId;
                                return (
                                    <Link
                                        key={ch.id}
                                        href={ch.link}
                                        onClick={() => setShowChapterDrawer(false)}
                                        className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                                            isCurrent
                                                ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 font-black border border-amber-500/25"
                                                : "hover:bg-black/5 dark:hover:bg-white/5 font-bold text-xs sm:text-sm opacity-80 hover:opacity-100"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span
                                                className={`text-[0.65rem] font-mono px-2 py-1 rounded-lg ${
                                                    isCurrent
                                                        ? "bg-amber-600 text-white"
                                                        : "bg-black/5 dark:bg-white/10 opacity-60"
                                                }`}
                                            >
                                                #{ch.order}
                                            </span>
                                            <span className="truncate">{ch.formattedTitle}</span>
                                        </div>

                                        {isCurrent && (
                                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 shrink-0 ml-2">
                                                <CheckCircle2 size={13} />
                                                <span className="hidden sm:inline">Sedang Dibaca</span>
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}

                            {filteredChapters.length === 0 && (
                                <div className="p-8 text-center opacity-50 text-xs">
                                    Tidak ada bab yang cocok dengan pencarian.
                                </div>
                            )}
                        </div>

                        {/* Drawer Footer Link to Novel Detail */}
                        <div className="p-4 border-t border-black/5 dark:border-white/10 flex items-center justify-between bg-black/2 dark:bg-white/2 text-xs">
                            <span className="opacity-50">Total {chapters.length} Bab</span>
                            <Link
                                href={basePath}
                                className="font-black text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1.5"
                            >
                                <Home size={13} />
                                <span>Buka Halaman Detail Novel</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
