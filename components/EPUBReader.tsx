"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, BookOpen, ZoomIn, ZoomOut, Maximize, Minimize, ArrowLeft } from "lucide-react";
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
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 transition-all duration-300"
                style={{
                    backgroundColor: theme.value === "night" ? "rgba(15,15,15,0.95)" : "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(12px)",
                    borderBottom: `1px solid ${theme.value === "night" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                    opacity: showUI ? 1 : 0,
                    transform: showUI ? "translateY(0)" : "translateY(-100%)",
                    pointerEvents: showUI ? "all" : "none",
                }}
            >
                <div className="flex items-center gap-4">
                    <Link
                        href={`/novel/${novelSlug}`}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all"
                        style={{ color: theme.text }}
                        title="Kembali ke Novel"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="h-6 w-px bg-black/10 dark:bg-white/10 mx-1" />
                    <span className="font-black text-sm uppercase tracking-widest truncate max-w-[200px]" style={{ color: theme.text }}>
                        {title}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 border-r border-black/5 dark:border-white/5 pr-4 mr-2">
                        {BG_THEMES.map((t) => (
                            <button
                                key={t.value}
                                title={t.label}
                                onClick={() => setTheme(t)}
                                className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                                style={{
                                    backgroundColor: t.bg,
                                    borderColor: theme.value === t.value ? theme.text : "transparent",
                                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                                }}
                            />
                        ))}
                    </div>

                    <button
                        onClick={toggleFullScreen}
                        className="p-2 rounded-full hover:opacity-70 transition-opacity"
                        style={{ color: theme.text }}
                        title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                        {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setFontSize((f) => Math.max(f - 10, 70))} className="p-2 hover:opacity-70" style={{ color: theme.text }}>
                        <ZoomOut size={16} />
                    </button>
                    <span className="text-xs font-bold min-w-[3rem] text-center" style={{ color: theme.text }}>{fontSize}%</span>
                    <button onClick={() => setFontSize((f) => Math.min(f + 10, 160))} className="p-2 hover:opacity-70" style={{ color: theme.text }}>
                        <ZoomIn size={16} />
                    </button>
                </div>
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
