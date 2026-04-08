"use client";

import Link from "next/link";
import { Edit2, ExternalLink, BookOpen, Trash2, Settings, List, Layers } from "lucide-react";
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
        author: string | null;
        _count: {
            chapters: number;
            volumes: number;
        };
    };
}

export default function AdminNovelListCard({ novel }: AdminNovelListCardProps) {
    const isWeb = novel.type === "WEB" || novel.type === "LIGHTNOVEL_WEB";
    const isLight = novel.type === "LIGHTNOVEL_WEB" || novel.type === "LIGHTNOVEL_PDF" || novel.type === "EPUB";
    const typeLabels: Record<string, string> = {
        WEB: "Web Novel",
        LIGHTNOVEL_WEB: "L-Novel (Web)",
        LIGHTNOVEL_PDF: "L-Novel (PDF)",
        EPUB: "L-Novel (EPUB)",
    };

    const countLabel = isWeb ? "CHAPTER" : "VOLUME";
    const countValue = isWeb ? novel._count.chapters : novel._count.volumes;

    return (
        <div className="group relative bg-white rounded-[1.5rem] p-3 pr-6 flex items-center gap-6 border border-[#3E2723]/10 hover:border-[#3E2723]/20 transition-all duration-500 hover:shadow-[0_20px_50px_-15px_rgba(62,39,35,0.08)]">
            {/* Cover Image Container */}
            <div className="relative w-24 h-32 flex-shrink-0 overflow-hidden rounded-[1.25rem] shadow-lg group-hover:scale-105 transition-transform duration-500">
                {novel.coverImage ? (
                    <img 
                        src={novel.coverImage} 
                        alt={novel.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-[#3E2723]/5 flex items-center justify-center">
                        <BookOpen size={24} className="text-[#3E2723]/20" />
                    </div>
                )}
                {/* Type Badge Overlay */}
                <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[0.5rem] font-black uppercase tracking-widest">
                    {typeLabels[novel.type] || novel.type}
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 flex flex-col gap-5 py-2">
                {/* Meta Row */}
                <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-tight border border-blue-100/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        On-Going
                    </span>
                    <span className="bg-[#3E2723]/5 text-[#3E2723]/50 px-3 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-wider border border-[#3E2723]/5">
                        {novel.region}
                    </span>
                    <div className="h-4 w-px bg-[#3E2723]/10 mx-1" />
                    <div className="flex items-center gap-1.5 text-[#3E2723]/60 text-[0.65rem] font-bold uppercase tracking-wider">
                        <Layers size={14} className="text-[#3E2723]/30" />
                        {countValue} {countLabel}
                    </div>
                </div>

                {/* Title & Author */}
                <div className="max-w-xl">
                    <h3 className="text-xl font-black tracking-tight text-[#3E2723] hover:text-black transition-colors leading-tight mb-1.5">
                        {novel.title}
                    </h3>
                    <p className="text-[0.65rem] font-black text-[#3E2723]/40 uppercase tracking-[0.15em] flex items-center gap-2">
                        Authored by <span className="text-[#3E2723]">{novel.author || "Unknown"}</span>
                    </p>
                </div>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-3">
                <div className="flex items-center bg-[#F5F5DC]/50 p-1.5 rounded-2xl border border-[#3E2723]/5">
                    <Link
                        href={`/admin/novel/${novel.id}/edit`}
                        className="p-3 text-[#3E2723]/40 hover:text-[#3E2723] hover:bg-white rounded-xl transition-all group/btn"
                        title="Edit Novel"
                    >
                        <Settings size={18} className="group-hover/btn:rotate-90 transition-transform duration-500" />
                    </Link>
                    
                    {(novel.type === "WEB" || novel.type === "LIGHTNOVEL_WEB") && (
                        <Link
                            href={`/admin/novel/${novel.id}/chapter`}
                            className="p-3 text-[#3E2723]/40 hover:text-[#3E2723] hover:bg-white rounded-xl transition-all"
                            title="Manage Chapters"
                        >
                            <List size={18} />
                        </Link>
                    )}
                </div>

                <Link
                    href={`/novel/${novel.slug}`}
                    className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-[1.2rem] text-[0.65rem] font-black uppercase tracking-widest hover:scale-[1.03] active:scale-95 transition-all shadow-lg shadow-black/10"
                >
                    <ExternalLink size={14} />
                    Preview
                </Link>

                <div className="w-px h-8 bg-[#3E2723]/10 mx-2" />

                <DeleteButton 
                    id={novel.id} 
                    novelTitle={novel.title} 
                    deleteAction={deleteNovel}
                    variant="list"
                />
            </div>
        </div>
    );
}
