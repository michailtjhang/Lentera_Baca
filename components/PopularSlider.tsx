"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { BookOpen, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";

interface Novel {
    id: string;
    slug: string;
    title: string;
    author: string;
    coverImage: string | null;
    type: string;
    status: string;
    views: number;
    genres: { id?: string; name: string }[];
    _count: { chapters: number; volumes: number };
}

const rankBadges = [
    { label: "#1", emoji: "👑", ring: "ring-amber-400/60 shadow-amber-400/30", bg: "bg-gradient-to-br from-amber-400 to-yellow-600", glow: "shadow-[0_0_40px_rgba(251,191,36,0.3)]" },
    { label: "#2", emoji: "🥈", ring: "ring-slate-300/60 shadow-slate-300/20", bg: "bg-gradient-to-br from-slate-300 to-slate-500", glow: "shadow-[0_0_30px_rgba(148,163,184,0.2)]" },
    { label: "#3", emoji: "🥉", ring: "ring-amber-700/60 shadow-amber-700/20", bg: "bg-gradient-to-br from-amber-700 to-orange-800", glow: "shadow-[0_0_30px_rgba(180,83,9,0.2)]" },
    { label: "#4", emoji: "✨", ring: "ring-zinc-500/40 shadow-zinc-500/10", bg: "bg-gradient-to-br from-zinc-600 to-zinc-800", glow: "shadow-[0_0_20px_rgba(113,113,122,0.15)]" },
];

const getStatusLabel = (status: string) => {
    if (status === "ONGOING") return "Ongoing";
    if (status === "COMPLETE") return "Selesai";
    if (status === "DROP") return "Drop";
    return "Hiatus";
};

const getStatusColor = (status: string) => {
    if (status === "ONGOING") return "bg-emerald-500 text-white";
    if (status === "COMPLETE") return "bg-blue-500 text-white";
    if (status === "DROP") return "bg-red-500 text-white";
    return "bg-amber-500 text-white";
};

export default function PopularSlider({ novels }: { novels: Novel[] }) {
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [direction, setDirection] = useState<"left" | "right">("right");

    const total = novels.length;

    const goTo = useCallback(
        (idx: number, dir?: "left" | "right") => {
            setDirection(dir || (idx > current ? "right" : "left"));
            setCurrent(idx);
        },
        [current]
    );

    const next = useCallback(() => {
        goTo((current + 1) % total, "right");
    }, [current, total, goTo]);

    const prev = useCallback(() => {
        goTo((current - 1 + total) % total, "left");
    }, [current, total, goTo]);

    // Autoplay
    useEffect(() => {
        if (isPaused || total <= 1) return;
        const timer = setInterval(next, 4500);
        return () => clearInterval(timer);
    }, [isPaused, next, total]);

    if (novels.length === 0) {
        return (
            <div className="flex items-center justify-center h-full opacity-20">
                <BookOpen size={40} strokeWidth={1} />
            </div>
        );
    }

    const novel = novels[current];
    const badge = rankBadges[current] || rankBadges[3];

    return (
        <div
            className="relative w-full h-full"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* ─── Main card ─────────────────────────────────────── */}
            <div className={`relative rounded-3xl overflow-hidden h-full ${badge.glow} transition-shadow duration-700`}>
                {/* Background cover blurred */}
                <div className="absolute inset-0 z-0">
                    {novel.coverImage && (
                        <img
                            src={novel.coverImage}
                            alt=""
                            className="w-full h-full object-cover scale-110 blur-2xl opacity-40 dark:opacity-20"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FDFCF0]/90 via-[#FDFCF0]/70 to-transparent dark:from-[#0f0f0f]/95 dark:via-[#0f0f0f]/80 dark:to-[#0f0f0f]/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCF0]/80 to-transparent dark:from-[#0f0f0f]/60" />
                </div>

                {/* Content grid */}
                <div className="relative z-10 flex h-full p-5 sm:p-6 gap-5 sm:gap-6">
                    {/* Cover */}
                    <Link
                        href={`/novel/${novel.slug}`}
                        className="shrink-0 w-[120px] sm:w-[150px] md:w-[170px] group"
                    >
                        <div className={`relative aspect-[10/14] rounded-2xl overflow-hidden ring-2 ${badge.ring} shadow-xl group-hover:shadow-2xl group-hover:scale-[1.03] transition-all duration-500`}>
                            {novel.coverImage ? (
                                <img
                                    src={novel.coverImage}
                                    alt={novel.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 dark:from-zinc-800 dark:to-zinc-700 flex flex-col items-center justify-center gap-2">
                                    <BookOpen size={24} className="opacity-20" />
                                    <span className="text-[0.45rem] opacity-20 uppercase font-black tracking-widest">No Cover</span>
                                </div>
                            )}

                            {/* Rank overlay */}
                            <div className="absolute top-0 left-0 z-10">
                                <div className={`${badge.bg} px-2.5 py-1.5 rounded-br-xl rounded-tl-xl font-black text-white text-xs flex items-center gap-1 shadow-lg`}>
                                    <span className="text-sm">{badge.emoji}</span>
                                    <span className="text-[0.65rem] tracking-wider">{badge.label}</span>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Info */}
                    <div className="flex flex-col justify-center flex-1 min-w-0 py-1">
                        {/* Mini label */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-md text-[0.55rem] font-black uppercase tracking-wider ${getStatusColor(novel.status)}`}>
                                {getStatusLabel(novel.status)}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[0.55rem] font-bold opacity-40">
                                <TrendingUp size={10} className="text-amber-500" />
                                {(novel.views || 0).toLocaleString("id-ID")} views
                            </span>
                        </div>

                        {/* Title */}
                        <Link href={`/novel/${novel.slug}`}>
                            <h3 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight leading-tight line-clamp-2 mb-1.5 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                                {novel.title}
                            </h3>
                        </Link>

                        <p className="text-xs sm:text-sm opacity-50 font-medium truncate mb-3">
                            {novel.author}
                        </p>

                        {/* Genres */}
                        {novel.genres && novel.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {novel.genres.slice(0, 3).map((g: any) => (
                                    <span
                                        key={g.id || g.name}
                                        className="text-[0.6rem] font-bold px-2.5 py-0.5 rounded-lg bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5"
                                    >
                                        {g.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* CTA */}
                        <div className="flex items-center gap-3 mt-auto">
                            <Link
                                href={`/novel/${novel.slug}`}
                                className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl font-black uppercase tracking-wider text-[0.6rem] hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 shadow-md shadow-amber-700/20"
                            >
                                Baca Sekarang
                                <ChevronRight size={14} />
                            </Link>
                            <span className="text-[0.55rem] font-black uppercase tracking-widest opacity-30">
                                {novel.type === "WEB"
                                    ? `${novel._count.chapters} Chapter`
                                    : `${novel._count.volumes} Volume`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Navigation arrows ────────────────────────────── */}
            {total > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-xl bg-white/80 dark:bg-black/60 backdrop-blur-md border border-black/5 dark:border-white/10 flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-all shadow-md hover:scale-110 active:scale-95 cursor-pointer group"
                        aria-label="Sebelumnya"
                    >
                        <ChevronLeft size={16} className="opacity-60 group-hover:opacity-100" />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-xl bg-white/80 dark:bg-black/60 backdrop-blur-md border border-black/5 dark:border-white/10 flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-all shadow-md hover:scale-110 active:scale-95 cursor-pointer group"
                        aria-label="Selanjutnya"
                    >
                        <ChevronRight size={16} className="opacity-60 group-hover:opacity-100" />
                    </button>
                </>
            )}

            {/* ─── Dots ─────────────────────────────────────────── */}
            {total > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 dark:bg-black/40 backdrop-blur-md border border-black/5 dark:border-white/10">
                    {novels.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className={`rounded-full transition-all duration-300 cursor-pointer ${
                                i === current
                                    ? "w-5 h-2 bg-gradient-to-r from-amber-500 to-orange-500 shadow-sm"
                                    : "w-2 h-2 bg-black/15 dark:bg-white/20 hover:bg-black/30 dark:hover:bg-white/40"
                            }`}
                            aria-label={`Novel ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
