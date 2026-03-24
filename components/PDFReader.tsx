"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Sun,
    Moon,
    BookOpen,
    X,
    Maximize,
    Minimize,
    ArrowLeft,
    Settings,
} from "lucide-react";
import Link from "next/link";

// Setup worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const BG_THEMES = [
    { label: "Putih", value: "white", bg: "#FFFFFF", text: "#1A1A1A" },
    { label: "Krem", value: "cream", bg: "#F5ECD7", text: "#2C1810" },
    { label: "Abu", value: "gray", bg: "#2D2D2D", text: "#E8E8E8" },
    { label: "Malam", value: "night", bg: "#0F0F0F", text: "#D4C5A9" },
];

interface PDFReaderProps {
    fileUrl: string;
    title: string;
    novelSlug: string;
}

export default function PDFReader({ fileUrl, title, novelSlug }: PDFReaderProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [theme, setTheme] = useState(BG_THEMES[1]); // default krem - nyaman di mata
    const [showUI, setShowUI] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [containerWidth, setContainerWidth] = useState<number>(800);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

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

    // Swipe state
    const touchStartX = useRef<number>(0);
    const touchStartY = useRef<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const uiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Calculate container width
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth - 32);
            }
        };
        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    // Auto-hide UI after 3s
    const resetUITimer = useCallback(() => {
        setShowUI(true);
        if (uiTimerRef.current) clearTimeout(uiTimerRef.current);
        uiTimerRef.current = setTimeout(() => setShowUI(false), 3000);
    }, []);

    useEffect(() => {
        resetUITimer();
        return () => { if (uiTimerRef.current) clearTimeout(uiTimerRef.current); };
    }, [resetUITimer]);

    // Keyboard navigation & Protection
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            resetUITimer();
            // Prevention
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p')) {
                e.preventDefault();
                return;
            }
            if (e.key === "ArrowRight" || e.key === "ArrowDown") nextPage();
            if (e.key === "ArrowLeft" || e.key === "ArrowUp") prevPage();
            if (e.key === "+" || e.key === "=") zoomIn();
            if (e.key === "-") zoomOut();
        };

        const handleContext = (e: MouseEvent) => e.preventDefault();

        window.addEventListener("keydown", handleKey);
        window.addEventListener("contextmenu", handleContext);
        return () => {
            window.removeEventListener("keydown", handleKey);
            window.removeEventListener("contextmenu", handleContext);
        };
    });

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setIsLoading(false);
    }

    function nextPage() {
        setCurrentPage((p) => Math.min(p + 1, numPages));
    }
    function prevPage() {
        setCurrentPage((p) => Math.max(p - 1, 1));
    }
    function zoomIn() {
        setScale((s) => Math.min(s + 0.2, 3.0));
    }
    function zoomOut() {
        setScale((s) => Math.max(s - 0.2, 0.5));
    }

    // Touch / Swipe handlers
    function handleTouchStart(e: React.TouchEvent) {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        resetUITimer();
    }

    function handleTouchEnd(e: React.TouchEvent) {
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        // Only trigger swipe if horizontal movement dominates
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            if (dx < 0) nextPage();  // swipe kiri → halaman berikutnya
            else prevPage();          // swipe kanan → halaman sebelumnya
        }
    }

    return (
        <div
            className="relative min-h-screen flex flex-col select-none"
            style={{ backgroundColor: theme.bg, color: theme.text, transition: "background-color 0.3s, color 0.3s" }}
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
                        <Settings size={22} className={showSettings ? 'animate-spin-slow' : ''} />
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

                        <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] opacity-30 mb-4 ml-2">Ukuran Zoom</p>
                        <div className="flex items-center justify-between p-2 bg-black/5 dark:bg-white/5 rounded-2xl">
                            <button
                                onClick={zoomOut}
                                className="p-3 rounded-xl hover:bg-black/5 transition-all active:scale-90"
                            >
                                <ZoomOut size={18} />
                            </button>
                            <span className="font-black text-xs tabular-nums tracking-widest">
                                {Math.round(scale * 100)}%
                            </span>
                            <button
                                onClick={zoomIn}
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

            {/* PDF Content */}
            <div
                ref={containerRef}
                className="flex-1 flex items-center justify-center pt-16 pb-20 px-4 overflow-auto"
            >
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
                        <div
                            className="w-12 h-12 rounded-full border-4 animate-spin"
                            style={{ borderColor: `${theme.text}20`, borderTopColor: theme.text }}
                        />
                        <p className="text-sm font-medium opacity-60" style={{ color: theme.text }}>
                            Memuat halaman...
                        </p>
                    </div>
                )}

                <Document
                    file={fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading=""
                    error={
                        <div className="flex flex-col items-center justify-center h-[70vh] gap-4 text-center">
                            <X size={48} opacity={0.3} />
                            <p className="font-bold opacity-60">Gagal memuat PDF</p>
                        </div>
                    }
                >
                    <Page
                        pageNumber={currentPage}
                        width={Math.min(containerWidth * scale, containerWidth)}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        className="shadow-2xl rounded-lg overflow-hidden pointer-events-none select-none"
                    />
                </Document>
            </div>

            {/* Bottom Navigation Bar */}
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
                {/* Prev Button */}
                <button
                    onClick={prevPage}
                    disabled={currentPage <= 1}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-70 active:scale-95"
                    style={{
                        backgroundColor: `${theme.text}10`,
                        color: theme.text,
                        border: `1px solid ${theme.text}20`,
                    }}
                >
                    <ChevronLeft size={18} />
                    <span className="hidden sm:inline">Sebelumnya</span>
                </button>

                {/* Page Indicator + Slider */}
                <div className="flex flex-col items-center gap-2 flex-1 max-w-xs mx-4">
                    <span className="text-xs font-black tracking-wider" style={{ color: theme.text, opacity: 0.6 }}>
                        {currentPage} / {numPages}
                    </span>
                    <input
                        type="range"
                        min={1}
                        max={numPages || 1}
                        value={currentPage}
                        onChange={(e) => setCurrentPage(Number(e.target.value))}
                        className="w-full h-1 rounded-full appearance-none cursor-pointer"
                        style={{ accentColor: theme.text }}
                    />
                </div>

                {/* Next Button */}
                <button
                    onClick={nextPage}
                    disabled={currentPage >= numPages}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-70 active:scale-95"
                    style={{
                        backgroundColor: theme.text,
                        color: theme.bg,
                        border: `1px solid ${theme.text}`,
                    }}
                >
                    <span className="hidden sm:inline">Berikutnya</span>
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
