import React from "react";
import { Loader2, BookOpen } from "lucide-react";

export default function ChapterLoading() {
  return (
    <div className="min-h-screen bg-[#FDFCF0] text-[#3E2723] dark:bg-[#121212] dark:text-[#e0e0e0] flex flex-col justify-between animate-in fade-in duration-300">
      {/* Top Floating Bar Placeholder */}
      <div className="w-full h-14 border-b border-black/5 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-20 h-6 bg-black/10 dark:bg-white/10 rounded-lg animate-pulse" />
          <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
          <div className="w-36 h-4 bg-black/10 dark:bg-white/10 rounded-md animate-pulse" />
        </div>
        <div className="w-8 h-8 bg-black/10 dark:bg-white/10 rounded-full animate-pulse" />
      </div>

      {/* Main Chapter Content Skeleton */}
      <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 md:px-12 py-12 flex-1 space-y-8">
        {/* Title Skeleton */}
        <div className="text-center space-y-3 pb-6 border-b border-black/5 dark:border-white/5">
          <div className="w-24 h-4 bg-amber-500/20 rounded-full mx-auto animate-pulse" />
          <div className="w-3/4 max-w-md h-8 bg-black/10 dark:bg-white/10 rounded-2xl mx-auto animate-pulse" />
          <div className="w-1/2 max-w-xs h-4 bg-black/5 dark:bg-white/5 rounded-lg mx-auto animate-pulse" />
        </div>

        {/* Central Loading Indicator */}
        <div className="flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
          <Loader2 size={16} className="animate-spin text-amber-600 dark:text-amber-400" />
          <span>Memuat Isi Chapter...</span>
        </div>

        {/* Paragraph Skeletons */}
        <div className="space-y-4">
          <div className="w-full h-4 bg-black/8 dark:bg-white/8 rounded-md animate-pulse" />
          <div className="w-[96%] h-4 bg-black/8 dark:bg-white/8 rounded-md animate-pulse" />
          <div className="w-[92%] h-4 bg-black/8 dark:bg-white/8 rounded-md animate-pulse" />
          <div className="w-[98%] h-4 bg-black/8 dark:bg-white/8 rounded-md animate-pulse" />
          <div className="w-[85%] h-4 bg-black/8 dark:bg-white/8 rounded-md animate-pulse" />
        </div>

        {/* Image / Illustration Skeleton Box */}
        <div className="w-full h-64 sm:h-80 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-3xl flex flex-col items-center justify-center gap-3 animate-pulse">
          <BookOpen size={32} className="opacity-20" />
          <div className="w-32 h-3 bg-black/10 dark:bg-white/10 rounded-full" />
        </div>

        {/* More Paragraph Skeletons */}
        <div className="space-y-4 pt-2">
          <div className="w-full h-4 bg-black/8 dark:bg-white/8 rounded-md animate-pulse" />
          <div className="w-[94%] h-4 bg-black/8 dark:bg-white/8 rounded-md animate-pulse" />
          <div className="w-[97%] h-4 bg-black/8 dark:bg-white/8 rounded-md animate-pulse" />
          <div className="w-[78%] h-4 bg-black/8 dark:bg-white/8 rounded-md animate-pulse" />
        </div>
      </main>

      {/* Bottom Floating Bar Skeleton */}
      <div className="w-full py-6 flex justify-center px-4">
        <div className="w-full max-w-md h-13 rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-md animate-pulse border border-black/5 dark:border-white/5" />
      </div>
    </div>
  );
}
