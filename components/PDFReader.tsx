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
} from "lucide-react";

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
}

export default function PDFReader({ fileUrl, title }: PDFReaderProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [theme, setTheme] = useState(BG_THEMES[1]); // default krem - nyaman di mata
    const [showUI, setShowUI] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [containerWidth, setContainerWidth] = useState<number>(800);

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

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            resetUITimer();
            if (e.key === "ArrowRight" || e.key === "ArrowDown") nextPage();
            if (e.key === "ArrowLeft" || e.key === "ArrowUp") prevPage();
            if (e.key === "+" || e.key === "=") zoomIn();
            if (e.key === "-") zoomOut();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
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
                    <span className="font-bold text-sm truncate max-w-[200px] md:max-w-none" style={{ color: theme.text }}>
                        {title}
                    </span>
                </div>

                {/* Theme Picker */}
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

                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={zoomOut}
                        className="p-2 rounded-full hover:opacity-70 transition-opacity"
                        style={{ color: theme.text }}
                    >
                        <ZoomOut size={16} />
                    </button>
                    <span className="text-xs font-bold min-w-[3rem] text-center" style={{ color: theme.text }}>
                        {Math.round(scale * 100)}%
                    </span>
                    <button
                        onClick={zoomIn}
                        className="p-2 rounded-full hover:opacity-70 transition-opacity"
                        style={{ color: theme.text }}
                    >
                        <ZoomIn size={16} />
                    </button>
                </div>
            </div>

            {/* PDF Content */}
            <div
                ref={containerRef}
                className="flex-1 flex items-start justify-center pt-16 pb-20 px-4 overflow-auto"
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
                        className="shadow-2xl rounded-lg overflow-hidden"
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
