"use client";

import Link from "next/link";
import { Edit2, ExternalLink, BookOpen, List, Settings, Layers, AlertTriangle, Eye } from "lucide-react";
import DeleteButton from "./DeleteButton";
import { deleteNovel } from "@/app/actions/novel-actions";

interface AdminNovelListCardProps {
    novel: {
        id: string;
        title: string;
        slug: string;
        coverImage: string | null;
        type: string;
        region: string;
        status: string;
        author: string | null;
        views?: number;
        tags?: { name: string }[];
        _count: {
            chapters: number;
            volumes: number;
        };
    };
}

const ADULT_TAGS = ["18+", "adult", "mature", "r18", "smut", "ecchi"];

function hasAdultContent(tags?: { name: string }[]): boolean {
    if (!tags) return false;
    return tags.some((t) => ADULT_TAGS.some((a) => t.name.toLowerCase().includes(a.toLowerCase())));
}

const TYPE_LABELS: Record<string, string> = {
    WEB: "Web Novel",
    LIGHTNOVEL_WEB: "Light Novel",
};

const TYPE_COLORS: Record<string, string> = {
    WEB: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50",
    LIGHTNOVEL_WEB: "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50",
};

const STATUS_COLORS: Record<string, string> = {
    ONGOING: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50",
    COMPLETE: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50",
    DROP: "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/50",
    HIATUS: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50",
};

const STATUS_LABELS: Record<string, string> = {
    ONGOING: "Ongoing",
    COMPLETE: "Selesai",
    DROP: "Drop",
    HIATUS: "Hiatus",
};

export default function AdminNovelListCard({ novel }: AdminNovelListCardProps) {
    const isWeb = novel.type === "WEB";
    const countLabel = isWeb ? "Chapter" : "Volume";
    const countValue = isWeb ? novel._count.chapters : novel._count.volumes;
    const isAdult = hasAdultContent(novel.tags);
    const views = novel.views || 0;

    return (
        <div className="group bg-white dark:bg-white/4 rounded-2xl border border-black/8 dark:border-white/8 hover:border-amber-500/30 dark:hover:border-amber-500/30 hover:shadow-lg dark:hover:shadow-black/25 transition-all duration-300 overflow-hidden">
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Main Info Left: Cover + Metadata */}
                <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                    {/* Cover Thumbnail */}
                    <div className="relative w-14 sm:w-16 h-20 sm:h-22 shrink-0 overflow-hidden rounded-xl shadow-md group-hover:shadow-lg transition-all border border-black/5 dark:border-white/10 bg-black/5">
                        {novel.coverImage ? (
                            <img
                                src={novel.coverImage}
                                alt={novel.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center">
                                <BookOpen size={18} className="opacity-30" />
                            </div>
                        )}

                        {/* 18+ badge on cover */}
                        {isAdult && (
                            <div className="absolute top-1 left-1 bg-red-600 text-white px-1.5 py-0.5 rounded-md text-[0.5rem] font-black uppercase tracking-wider shadow">
                                18+
                            </div>
                        )}
                    </div>

                    {/* Novel Text Details */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                        {/* Badges Row */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-[0.6rem] font-bold uppercase tracking-wider border ${TYPE_COLORS[novel.type] || "bg-zinc-100 text-zinc-600"}`}>
                                {TYPE_LABELS[novel.type] || novel.type}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[0.6rem] font-bold uppercase tracking-wider border ${STATUS_COLORS[novel.status] || "bg-zinc-100 text-zinc-600"}`}>
                                {STATUS_LABELS[novel.status] || novel.status}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[0.6rem] font-bold uppercase tracking-wider bg-black/5 dark:bg-white/5 opacity-60">
                                {novel.region}
                            </span>
                            {isAdult && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.6rem] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                                    <AlertTriangle size={10} />
                                    Dewasa
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h3 className="font-black text-sm sm:text-base tracking-tight leading-snug line-clamp-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors text-[#2B1810] dark:text-white">
                            {novel.title}
                        </h3>

                        {/* Author & Stats */}
                        <div className="flex flex-wrap items-center gap-3 text-xs opacity-60 font-medium">
                            <span className="truncate max-w-[140px] sm:max-w-[200px]">
                                {novel.author || "Tanpa Penulis"}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-bold text-amber-800 dark:text-amber-300">
                                <Layers size={12} />
                                {countValue} {countLabel}
                            </span>
                            {views > 0 && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 font-bold">
                                        <Eye size={12} />
                                        {views.toLocaleString("id-ID")} view
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions Right / Bottom on Mobile */}
                <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-white/5 shrink-0">
                    {/* Edit Button */}
                    <Link
                        href={`/admin/novel/${novel.id}/edit`}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-black/4 dark:bg-white/5 hover:bg-black/8 dark:hover:bg-white/10 text-[#3E2723] dark:text-white transition-all"
                        title="Edit Info Novel"
                    >
                        <Settings size={14} className="group-hover:rotate-45 transition-transform duration-300" />
                        <span className="sm:hidden lg:inline">Edit</span>
                    </Link>

                    {/* Chapters Button */}
                    {(novel.type === "WEB" || novel.type === "LIGHTNOVEL_WEB") && (
                        <Link
                            href={`/admin/novel/${novel.id}/chapter`}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/20 transition-all"
                            title="Kelola Daftar Chapter"
                        >
                            <List size={14} />
                            <span>Bab</span>
                        </Link>
                    )}

                    {/* Preview Button */}
                    <Link
                        href={`/novel/${novel.slug}`}
                        target="_blank"
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#3E2723] text-[#F5F5DC] dark:bg-white dark:text-black hover:opacity-90 active:scale-95 transition-all"
                        title="Lihat Pratinjau Publik"
                    >
                        <ExternalLink size={13} />
                        <span className="sm:hidden lg:inline">Lihat</span>
                    </Link>

                    {/* Delete Button */}
                    <div className="shrink-0">
                        <DeleteButton
                            id={novel.id}
                            novelTitle={novel.title}
                            deleteAction={deleteNovel}
                            variant="list"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
