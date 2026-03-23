"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, BookOpen, ZoomIn, ZoomOut } from "lucide-react";

const BG_THEMES = [
    { label: "Putih", value: "white", bg: "#FFFFFF", text: "#1A1A1A" },
    { label: "Krem", value: "cream", bg: "#F5ECD7", text: "#2C1810" },
    { label: "Abu", value: "gray", bg: "#2D2D2D", text: "#E8E8E8" },
    { label: "Malam", value: "night", bg: "#0F0F0F", text: "#D4C5A9" },
];

interface EPUBReaderProps {
    fileUrl: string;
    title: string;
}

export default function EPUBReader({ fileUrl, title }: EPUBReaderProps) {
    const viewerRef = useRef<HTMLDivElement>(null);
    const bookRef = useRef<any>(null);
    const renditionRef = useRef<any>(null);
    const [theme, setTheme] = useState(BG_THEMES[1]);
    const [fontSize, setFontSize] = useState(100);
    const [showUI, setShowUI] = useState(true);
    const [currentCfi, setCurrentCfi] = useState<string>("");
    const touchStartX = useRef<number>(0);
    const touchStartY = useRef<number>(0);
    const uiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    // Keyboard
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") nextPage();
            if (e.key === "ArrowLeft") prevPage();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
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
                <div className="flex items-center gap-3">
                    <BookOpen size={18} opacity={0.6} />
                    <span className="font-bold text-sm truncate max-w-[200px]" style={{ color: theme.text }}>
                        {title}
                    </span>
                </div>
                <div className="flex items-center gap-2">
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
