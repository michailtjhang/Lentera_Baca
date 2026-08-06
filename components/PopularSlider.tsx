"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { BookOpen, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

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
  if (status === "ONGOING") return "bg-emerald-500 text-white";
  if (status === "COMPLETE") return "bg-blue-500 text-white";
  if (status === "DROP") return "bg-red-500 text-white";
  return "bg-amber-500 text-white";
};

export default function PopularSlider({ novels }: { novels: Novel[] }) {
  // Limit to maximum 5 novels
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
    }, 4500);
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
      <div className="flex items-center justify-center h-full min-h-[300px] opacity-20">
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
      {/* ─── Outer Track Window ─────────────────────────────── */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl h-full cursor-grab active:cursor-grabbing bg-white/40 dark:bg-black/40 backdrop-blur-md border border-black/5 dark:border-white/10"
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
              {/* Background Cover Blurred */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {novel.coverImage && (
                  <img
                    src={novel.coverImage}
                    alt=""
                    className="w-full h-full object-cover scale-110 blur-2xl opacity-35 dark:opacity-20"
                    draggable={false}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[#FDFCF0]/95 via-[#FDFCF0]/80 to-[#FDFCF0]/60 dark:from-[#0f0f0f]/95 dark:via-[#0f0f0f]/85 dark:to-[#0f0f0f]/60" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCF0] via-transparent to-transparent dark:from-[#0f0f0f] opacity-80" />
              </div>

              {/* Card Content */}
              <div className="relative z-10 flex flex-col sm:flex-row h-full p-4 sm:p-6 gap-4 sm:gap-6 items-center sm:items-stretch">
                {/* Cover Image */}
                <Link
                  href={`/novel/${novel.slug}`}
                  onClick={handleLinkClick}
                  className="shrink-0 w-[100px] xs:w-[120px] sm:w-[145px] md:w-[160px] group relative"
                >
                  <div className="relative aspect-[10/14] rounded-2xl overflow-hidden ring-2 ring-amber-500/30 shadow-xl group-hover:shadow-2xl group-hover:scale-[1.02] transition-all duration-300">
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

                    {/* BARU Badge */}
                    <div className="absolute top-0 left-0 z-10">
                      <div className="bg-gradient-to-br from-amber-500 to-orange-600 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-br-xl rounded-tl-xl font-black text-white text-[0.55rem] sm:text-[0.6rem] uppercase tracking-wider flex items-center gap-1 shadow-md">
                        <Sparkles size={10} />
                        <span>BARU #{idx + 1}</span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Info Section */}
                <div className="flex flex-col justify-between flex-1 min-w-0 w-full text-center sm:text-left py-2 pr-3 sm:pr-5">
                  <div>
                    {/* Badges & Status */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[0.55rem] font-black uppercase tracking-wider ${getStatusColor(
                          novel.status
                        )} shadow-sm`}
                      >
                        {getStatusLabel(novel.status)}
                      </span>
                      <span className="text-[0.55rem] font-bold opacity-50 uppercase tracking-wider">
                        {novel.type === "WEB" ? "Web Novel" : "Light Novel"}
                      </span>
                    </div>

                    {/* Title */}
                    <Link href={`/novel/${novel.slug}`} onClick={handleLinkClick}>
                      <h3 className="text-base sm:text-lg md:text-xl font-black tracking-tight leading-snug line-clamp-2 mb-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                        {novel.title}
                      </h3>
                    </Link>

                    {/* Author */}
                    <p className="text-xs sm:text-sm opacity-60 font-semibold truncate mb-2">
                      Oleh {novel.author}
                    </p>

                    {/* Genres */}
                    {novel.genres && novel.genres.length > 0 && (
                      <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mb-3">
                        {novel.genres.slice(0, 3).map((g: any) => (
                          <span
                            key={g.id || g.name}
                            className="text-[0.58rem] font-bold px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5"
                          >
                            {g.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA & Chapter Count */}
                  <div className="flex items-center justify-center sm:justify-between gap-3 mt-auto pt-2 border-t border-black/5 dark:border-white/5">
                    <Link
                      href={`/novel/${novel.slug}`}
                      onClick={handleLinkClick}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-black uppercase tracking-wider text-[0.6rem] hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 shadow-md shadow-amber-600/20"
                    >
                      Baca Sekarang
                      <ChevronRight size={13} />
                    </Link>
                    <span className="text-[0.55rem] font-black uppercase tracking-widest opacity-40 hidden sm:inline">
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
            onClick={prev}
            className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-md border border-black/10 dark:border-white/10 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 cursor-pointer group transition-all"
            aria-label="Sebelumnya"
          >
            <ChevronLeft size={18} className="opacity-70 group-hover:opacity-100" />
          </button>
          <button
            onClick={next}
            className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-md border border-black/10 dark:border-white/10 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 cursor-pointer group transition-all"
            aria-label="Selanjutnya"
          >
            <ChevronRight size={18} className="opacity-70 group-hover:opacity-100" />
          </button>
        </>
      )}

      {/* ─── Pagination Dots ─────────────────────────────────────────── */}
      {total > 1 && (
        <div className="absolute -bottom-5 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-sm">
          {displayNovels.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === current
                  ? "w-6 h-2 bg-gradient-to-r from-amber-500 to-orange-500 shadow-sm"
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



