"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, BookOpen, ZoomIn, ZoomOut, Maximize, Minimize, ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";

const BG_THEMES = [
    { label: "Putih", value: "white", bg: "#FFFFFF", text: "#1A1A1A" },
    { label: "Krem", value: "cream", bg: "#F5ECD7", text: "#2C1810" },
    { label: "Abu", value: "gray", bg: "#2D2D2D", text: "#E8E8E8" },
    { label: "Malam", value: "night", bg: "#0F0F0F", text: "#D4C5A9" },
];

interface EPUBReaderProps {
    fileUrl: string;
    title: string;
    novelSlug: string;
}

export default function EPUBReader({ fileUrl, title, novelSlug }: EPUBReaderProps) {
    const viewerRef = useRef<HTMLDivElement>(null);
    const bookRef = useRef<any>(null);
    const renditionRef = useRef<any>(null);
    const [theme, setTheme] = useState(BG_THEMES[1]);
    const [fontSize, setFontSize] = useState(100);
    const [showUI, setShowUI] = useState(true);
    const [currentCfi, setCurrentCfi] = useState<string>("");
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const touchStartX = useRef<number>(0);
    const touchStartY = useRef<number>(0);
    const uiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
            setIsFullScreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullScreen(false);
            }
        }
    };

    // Track full screen change
    useEffect(() => {
        const handleFS = () => setIsFullScreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handleFS);
        return () => document.removeEventListener("fullscreenchange", handleFS);
    }, []);

    const resetUITimer = useCallback(() => {
        setShowUI(true);
        if (uiTimerRef.current) clearTimeout(uiTimerRef.current);
        uiTimerRef.current = setTimeout(() => setShowUI(false), 3000);
    }, []);

    useEffect(() => {
        resetUITimer();
        return () => { if (uiTimerRef.current) clearTimeout(uiTimerRef.current); };
    }, [resetUITimer]);

    useEffect(() => {
        let isMounted = true;

        const loadEpub = async () => {
            const ePub = (await import("epubjs")).default;
            if (!isMounted || !viewerRef.current) return;

            const book = ePub(fileUrl);
            bookRef.current = book;

            const rendition = book.renderTo(viewerRef.current, {
                width: "100%",
                height: "100%",
                flow: "paginated",
                spread: "none",
            });
            renditionRef.current = rendition;

            rendition.themes.default({
                body: {
                    background: theme.bg,
                    color: theme.text,
                    "font-size": `${fontSize}%`,
                    "line-height": "1.8",
                    padding: "0 1.5rem",
                },
                p: { "margin-bottom": "1em" },
            });

            rendition.on("locationChanged", (loc: any) => {
                setCurrentCfi(loc.start);
            });

            await rendition.display();
        };

        loadEpub();
        return () => {
            isMounted = false;
            bookRef.current?.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fileUrl]);

    // Update theme when changed
    useEffect(() => {
        if (!renditionRef.current) return;
        renditionRef.current.themes.default({
            body: {
                background: theme.bg,
                color: theme.text,
                "font-size": `${fontSize}%`,
                "line-height": "1.8",
                padding: "0 1.5rem",
            },
        });
        renditionRef.current.views().forEach((view: any) => view.pane?.render());
    }, [theme, fontSize]);

    const nextPage = useCallback(() => {
        renditionRef.current?.next();
        resetUITimer();
    }, [resetUITimer]);

    const prevPage = useCallback(() => {
        renditionRef.current?.prev();
        resetUITimer();
    }, [resetUITimer]);

    // Keyboard & Protection
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p')) {
                e.preventDefault();
                return;
            }
            if (e.key === "ArrowRight") nextPage();
            if (e.key === "ArrowLeft") prevPage();
        };

        const handleContext = (e: MouseEvent) => e.preventDefault();

        window.addEventListener("keydown", handleKey);
        window.addEventListener("contextmenu", handleContext);
        
        return () => {
            window.removeEventListener("keydown", handleKey);
            window.removeEventListener("contextmenu", handleContext);
        };
    }, [nextPage, prevPage]);

    function handleTouchStart(e: React.TouchEvent) {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        resetUITimer();
    }
    function handleTouchEnd(e: React.TouchEvent) {
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            if (dx < 0) nextPage();
            else prevPage();
        }
    }

    return (
        <div
            className="relative min-h-screen flex flex-col"
            style={{ backgroundColor: theme.bg, color: theme.text, transition: "background-color 0.3s" }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={resetUITimer}
            onMouseMove={resetUITimer}
        >
            {/* Top Bar */}
            <div
                className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-4 py-3 transition-all duration-300"
                style={{
                    backgroundColor: theme.value === "night" ? "rgba(15,15,15,0.95)" : "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(12px)",
                    borderBottom: `1px solid ${theme.value === "night" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                    opacity: showUI ? 1 : 0,
                    transform: showUI ? "translateY(0)" : "translateY(-100%)",
                    pointerEvents: showUI ? "all" : "none",
                }}
            >
                {/* Left: Back */}
                <div className="flex items-center gap-2 z-10">
                    <Link
                        href={`/novel/${novelSlug}`}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all active:scale-90"
                        style={{ color: theme.text }}
                    >
                        <ArrowLeft size={22} />
                    </Link>
                </div>

                {/* Center: Title (Responsive) */}
                <div className="absolute left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/5 dark:bg-white/5 rounded-full border border-black/5 dark:border-white/5 max-w-[45%] md:max-w-[60%]">
                    <span className="font-black text-[0.65rem] md:text-sm uppercase tracking-[0.2em] truncate block text-center" style={{ color: theme.text }}>
                        {title}
                    </span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 z-10">
                    <button
                        onClick={toggleFullScreen}
                        className="p-2.5 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest hidden md:flex items-center gap-2"
                        style={{ color: theme.text }}
                    >
                        {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
                        <span className="hidden lg:inline">{isFullScreen ? "Kecilkan" : "Layar Penuh"}</span>
                    </button>
                    
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2.5 rounded-2xl transition-all active:scale-95 ${showSettings ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                        style={{ color: showSettings ? undefined : theme.text }}
                    >
                        <Settings size={22} />
                    </button>
                </div>

                {/* Settings Dropdown */}
                {showSettings && (
                    <div 
                        className="absolute top-full right-4 mt-4 w-72 bg-white dark:bg-[#1A1A1A] p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-black/5 animate-in fade-in slide-in-from-top-4 duration-300"
                        style={{ color: theme.text }}
                    >
                        <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] opacity-30 mb-4 ml-2">Tema Bacaan</p>
                        <div className="grid grid-cols-4 gap-3 mb-8">
                            {BG_THEMES.map((t) => (
                                <button
                                    key={t.value}
                                    onClick={() => setTheme(t)}
                                    className="aspect-square rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 flex items-center justify-center p-1"
                                    style={{
                                        backgroundColor: t.bg,
                                        borderColor: theme.value === t.value ? theme.text : "transparent",
                                    }}
                                >
                                    {theme.value === t.value && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.text }} />}
                                </button>
                            ))}
                        </div>

                        <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] opacity-30 mb-4 ml-2">Ukuran Font</p>
                        <div className="flex items-center justify-between p-2 bg-black/5 dark:bg-white/5 rounded-2xl">
                            <button
                                onClick={() => setFontSize((f) => Math.max(f - 10, 70))}
                                className="p-3 rounded-xl hover:bg-black/5 transition-all active:scale-90"
                            >
                                <ZoomOut size={18} />
                            </button>
                            <span className="font-black text-xs tabular-nums tracking-widest">
                                {fontSize}%
                            </span>
                            <button
                                onClick={() => setFontSize((f) => Math.min(f + 10, 160))}
                                className="p-3 rounded-xl hover:bg-black/5 transition-all active:scale-90"
                            >
                                <ZoomIn size={18} />
                            </button>
                        </div>
                        
                        <button
                            onClick={toggleFullScreen}
                            className="w-full mt-6 py-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black text-[0.6rem] uppercase tracking-widest md:hidden flex items-center justify-center gap-3"
                        >
                            {isFullScreen ? <Minimize size={14} /> : <Maximize size={14} />}
                            {isFullScreen ? "Keluar Layar Penuh" : "Mode Layar Penuh"}
                        </button>
                    </div>
                )}
            </div>

            {/* EPUB Viewer */}
            <div ref={viewerRef} className="flex-1 pt-16 pb-20" style={{ minHeight: "80vh" }} />

            {/* Bottom Bar */}
            <div
                className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300"
                style={{
                    backgroundColor: theme.value === "night" ? "rgba(15,15,15,0.95)" : "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(12px)",
                    borderTop: `1px solid ${theme.value === "night" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                    opacity: showUI ? 1 : 0,
                    transform: showUI ? "translateY(0)" : "translateY(100%)",
                    pointerEvents: showUI ? "all" : "none",
                }}
            >
                <button
                    onClick={prevPage}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm hover:opacity-70 active:scale-95 transition-all"
                    style={{ backgroundColor: `${theme.text}10`, color: theme.text, border: `1px solid ${theme.text}20` }}
                >
                    <ChevronLeft size={18} />
                    <span className="hidden sm:inline">Sebelumnya</span>
                </button>
                <span className="text-xs font-black opacity-40" style={{ color: theme.text }}>EPUB • Swipe untuk navigasi</span>
                <button
                    onClick={nextPage}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm hover:opacity-70 active:scale-95 transition-all"
                    style={{ backgroundColor: theme.text, color: theme.bg }}
                >
                    <span className="hidden sm:inline">Berikutnya</span>
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
