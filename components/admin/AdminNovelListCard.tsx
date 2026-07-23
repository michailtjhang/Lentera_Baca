"use client";

import Link from "next/link";
import { Edit2, ExternalLink, BookOpen, List, Settings, Layers, AlertTriangle } from "lucide-react";
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
    return tags.some(t => ADULT_TAGS.some(a => t.name.toLowerCase().includes(a.toLowerCase())));
}

const TYPE_LABELS: Record<string, string> = {
    WEB: "Web Novel",
    LIGHTNOVEL_WEB: "Light Novel",
};

const TYPE_COLORS: Record<string, string> = {
    WEB: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    LIGHTNOVEL_WEB: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
};

const STATUS_COLORS: Record<string, string> = {
    ONGOING: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    COMPLETE: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    DROP: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    HIATUS: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
};

const STATUS_LABELS: Record<string, string> = {
    ONGOING: "Ongoing",
    COMPLETE: "Selesai",
    DROP: "Drop",
    HIATUS: "Hiatus",
};

export default function AdminNovelListCard({ novel }: AdminNovelListCardProps) {
    const isWeb = novel.type === "WEB";
    const countLabel = isWeb ? "Ch" : "Vol";
    const countValue = isWeb ? novel._count.chapters : novel._count.volumes;
    const isAdult = hasAdultContent(novel.tags);

    return (
        <div className="group bg-white dark:bg-white/4 rounded-2xl border border-black/6 dark:border-white/6 hover:border-black/12 dark:hover:border-white/12 hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-300 overflow-hidden">
            <div className="flex items-center gap-4 p-4">
                {/* Cover */}
                <div className="relative w-16 h-22 shrink-0 overflow-hidden rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                    <div className="w-16 h-22 aspect-[10/14]">
                        {novel.coverImage ? (
                            <img
                                src={novel.coverImage}
                                alt={novel.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center">
                                <BookOpen size={18} className="opacity-30" />
                            </div>
                        )}
                    </div>
                    {/* 18+ badge on cover */}
                    {isAdult && (
                        <div className="absolute top-1 left-1 bg-red-500 text-white px-1.5 py-0.5 rounded-md text-[0.45rem] font-black uppercase tracking-widest">
                            18+
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[0.6rem] font-black uppercase tracking-wider ${TYPE_COLORS[novel.type] || "bg-zinc-100 text-zinc-600"}`}>
                            {TYPE_LABELS[novel.type] || novel.type}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-[0.6rem] font-black uppercase tracking-wider ${STATUS_COLORS[novel.status] || "bg-zinc-100 text-zinc-600"}`}>
                            {STATUS_LABELS[novel.status] || novel.status}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-[0.6rem] font-bold uppercase tracking-wider bg-black/5 dark:bg-white/5 opacity-60">
                            {novel.region}
                        </span>
                        {isAdult && (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.6rem] font-black uppercase tracking-wider bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                <AlertTriangle size={9} />
                                Dewasa
                            </span>
                        )}
                    </div>

                    <h3 className="font-black text-base tracking-tight truncate mb-0.5 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                        {novel.title}
                    </h3>
                    <div className="flex items-center gap-3">
                        <p className="text-[0.65rem] font-semibold opacity-40 truncate">
                            {novel.author || "Unknown"}
                        </p>
                        <span className="text-[0.6rem] opacity-30">•</span>
                        <div className="flex items-center gap-1 text-[0.65rem] font-black opacity-40 uppercase tracking-wider">
                            <Layers size={11} />
                            {countValue} {countLabel}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-black/4 dark:bg-white/4 p-1.5 rounded-xl">
                        <Link
                            href={`/admin/novel/${novel.id}/edit`}
                            className="p-2.5 text-black/30 dark:text-white/30 hover:text-[#3E2723] dark:hover:text-white hover:bg-white dark:hover:bg-white/10 rounded-lg transition-all"
                            title="Edit Novel"
                        >
                            <Settings size={15} className="group-hover:rotate-45 transition-transform duration-300" />
                        </Link>

                        {(novel.type === "WEB" || novel.type === "LIGHTNOVEL_WEB") && (
                            <Link
                                href={`/admin/novel/${novel.id}/chapter`}
                                className="p-2.5 text-black/30 dark:text-white/30 hover:text-[#3E2723] dark:hover:text-white hover:bg-white dark:hover:bg-white/10 rounded-lg transition-all"
                                title="Manage Chapters"
                            >
                                <List size={15} />
                            </Link>
                        )}
                    </div>

                    <Link
                        href={`/novel/${novel.slug}`}
                        target="_blank"
                        className="flex items-center gap-1.5 bg-[#3E2723] dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl text-[0.6rem] font-black uppercase tracking-wider hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all"
                    >
                        <ExternalLink size={12} />
                        Preview
                    </Link>

                    <DeleteButton
                        id={novel.id}
                        novelTitle={novel.title}
                        deleteAction={deleteNovel}
                        variant="list"
                    />
                </div>
            </div>
        </div>
    );
}
