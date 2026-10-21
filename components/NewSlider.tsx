"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { BookOpen, Sparkles, ChevronLeft, ChevronRight, Star, ArrowRight } from "lucide-react";
import { calculateRating } from "@/components/StarRating";

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

const getStatusLabel = (status: string) => {
  if (status === "ONGOING") return "Ongoing";
  if (status === "COMPLETE") return "Selesai";
  if (status === "DROP") return "Drop";
  return "Hiatus";
};

const getStatusColor = (status: string) => {
  if (status === "ONGOING") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20";
  if (status === "COMPLETE") return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/20";
  if (status === "DROP") return "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20";
  return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20";
};

export default function NewSlider({ novels }: { novels: Novel[] }) {
  const displayNovels = novels.slice(0, 5);
  const total = displayNovels.length;

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Drag states
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const isMovedRef = useRef(false);

  const goTo = useCallback(
    (idx: number) => {
      setCurrent((idx + total) % total);
    },
    [total]
  );

  const next = useCallback(() => {
    if (total === 0) return;
    goTo(current + 1);
  }, [current, total, goTo]);

  const prev = useCallback(() => {
    if (total === 0) return;
    goTo(current - 1);
  }, [current, total, goTo]);

  // Autoplay timer
  useEffect(() => {
    if (isPaused || isDragging || total <= 1) return;
    const timer = setInterval(() => {
      next();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, isDragging, next, total]);

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setIsDragging(true);
    isMovedRef.current = false;
    setStartX(e.touches[0].clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    if (Math.abs(diff) > 5) {
      isMovedRef.current = true;
    }
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setIsPaused(false);
    if (dragOffset < -40) {
      next();
    } else if (dragOffset > 40) {
      prev();
    }
    setDragOffset(0);
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPaused(true);
    setIsDragging(true);
    isMovedRef.current = false;
    setStartX(e.clientX);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const diff = currentX - startX;
    if (Math.abs(diff) > 5) {
      isMovedRef.current = true;
    }
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setIsPaused(false);
    if (dragOffset < -40) {
      next();
    } else if (dragOffset > 40) {
      prev();
    }
    setDragOffset(0);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setIsPaused(false);
      if (dragOffset < -40) {
        next();
      } else if (dragOffset > 40) {
        prev();
      }
      setDragOffset(0);
    } else {
      setIsPaused(false);
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (isMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (displayNovels.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] bg-white dark:bg-[#18181b] rounded-3xl border border-black/8 dark:border-white/10 opacity-30">
        <BookOpen size={40} strokeWidth={1} />
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full select-none touch-pan-y"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* ─── Outer Clean Window (NO blurry glow behind) ─────── */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full cursor-grab active:cursor-grabbing bg-white dark:bg-[#18181b] border border-black/8 dark:border-white/10"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* ─── Multi-Slide Flex Track ──────────────────────────── */}
        <div
          className={`flex h-full w-full ${
            isDragging
              ? "transition-none"
              : "transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          }`}
          style={{
            transform: `translateX(calc(-${current * 100}% + ${dragOffset}px))`,
          }}
        >
          {displayNovels.map((novel, idx) => (
            <div
              key={novel.id}
              className="w-full shrink-0 h-full relative flex flex-col justify-between"
            >
              {/* Card Content */}
              <div className="relative z-10 flex flex-col sm:flex-row h-full p-4 sm:p-6 gap-4 sm:gap-6 items-center sm:items-stretch">
                {/* Cover Image */}
                <Link
                  href={`/novel/${novel.slug}`}
                  onClick={handleLinkClick}
                  className="shrink-0 w-[105px] xs:w-[120px] sm:w-[145px] md:w-[160px] group relative"
                >
                  <div className="relative aspect-[10/14] rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl group-hover:scale-[1.02] transition-all duration-300 border border-black/8 dark:border-white/10 bg-black/5">
                    {novel.coverImage ? (
                      <img
                        src={novel.coverImage}
                        alt={novel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        draggable={false}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 dark:from-zinc-800 dark:to-zinc-700 flex flex-col items-center justify-center gap-2">
                        <BookOpen size={24} className="opacity-20" />
                        <span className="text-[0.45rem] opacity-20 uppercase font-black tracking-widest">
                          No Cover
                        </span>
                      </div>
                    )}

                    {/* Rating Badge (top right) */}
                    <div className="absolute top-2 right-2 z-10 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1 border border-white/10">
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                      <span className="text-[0.6rem] font-black text-amber-300">{calculateRating(novel.views).toFixed(1)}</span>
                    </div>

                    {/* NEW RELEASE Badge */}
                    <div className="absolute top-0 left-0 z-10">
                      <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-br-xl rounded-tl-xl font-black text-white text-[0.55rem] sm:text-[0.6rem] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <Sparkles size={10} />
                        <span>RILIS #{idx + 1}</span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Info Section */}
                <div className="flex flex-col justify-between flex-1 min-w-0 w-full text-center sm:text-left py-1 pr-2 sm:pr-4">
                  <div>
                    {/* Badges & Status */}
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[0.58rem] font-bold uppercase tracking-wider ${getStatusColor(
                          novel.status
                        )}`}
                      >
                        {getStatusLabel(novel.status)}
                      </span>
                      <span className="text-[0.58rem] font-bold opacity-60 uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10">
                        {novel.type === "WEB" ? "Web Novel" : "Light Novel"}
                      </span>
                    </div>

                    {/* Title */}
                    <Link href={`/novel/${novel.slug}`} onClick={handleLinkClick}>
                      <h3 className="text-base sm:text-lg md:text-xl font-black tracking-tight leading-snug line-clamp-2 mb-1.5 hover:text-amber-700 dark:hover:text-amber-400 transition-colors text-[#2B1810] dark:text-white">
                        {novel.title}
                      </h3>
                    </Link>

                    {/* Author */}
                    <p className="text-xs opacity-60 font-medium truncate mb-3">
                      Oleh <strong className="opacity-90">{novel.author}</strong>
                    </p>

                    {/* Genres */}
                    {novel.genres && novel.genres.length > 0 && (
                      <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mb-3">
                        {novel.genres.slice(0, 3).map((g: any) => (
                          <span
                            key={g.id || g.name}
                            className="text-[0.6rem] font-bold px-2.5 py-0.5 rounded-lg bg-black/4 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[#3E2723] dark:text-[#d1d1d1]"
                          >
                            {g.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA & Chapter Count */}
                  <div className="flex items-center justify-center sm:justify-between gap-3 mt-auto pt-3 border-t border-black/5 dark:border-white/10">
                    <Link
                      href={`/novel/${novel.slug}`}
                      onClick={handleLinkClick}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl font-black uppercase tracking-wider text-[0.65rem] hover:shadow-md transition-all active:scale-95 shadow-sm shadow-amber-600/20"
                    >
                      <span>Baca Sekarang</span>
                      <ArrowRight size={13} />
                    </Link>
                    <span className="text-[0.6rem] font-black uppercase tracking-wider opacity-40 hidden sm:inline">
                      {novel.type === "WEB"
                        ? `${novel._count.chapters} Chapter`
                        : `${novel._count.volumes} Volume`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Navigation Arrows ────────────────────────────── */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-[#202023] border border-black/10 dark:border-white/10 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 cursor-pointer transition-all"
            aria-label="Sebelumnya"
          >
            <ChevronLeft size={18} className="opacity-70 hover:opacity-100" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-[#202023] border border-black/10 dark:border-white/10 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 cursor-pointer transition-all"
            aria-label="Selanjutnya"
          >
            <ChevronRight size={18} className="opacity-70 hover:opacity-100" />
          </button>
        </>
      )}

      {/* ─── Pagination Dots ─────────────────────────────────────────── */}
      {total > 1 && (
        <div className="absolute -bottom-5 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-black/80 border border-black/5 dark:border-white/10 shadow-sm">
          {displayNovels.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === current
                  ? "w-6 h-2 bg-gradient-to-r from-amber-600 to-amber-700 shadow-sm"
                  : "w-2 h-2 bg-black/20 dark:bg-white/30 hover:bg-black/40 dark:hover:bg-white/60"
              }`}
              aria-label={`Novel ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
