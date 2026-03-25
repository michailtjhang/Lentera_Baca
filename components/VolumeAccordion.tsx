"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Image as ImageIcon, Book, Sparkles, LogOut, Hash } from "lucide-react";
import { ChapterType } from "@prisma/client";

interface Chapter {
    id: string;
    title: string;
    order: number;
    type: ChapterType;
}

interface Volume {
    id: string;
    title: string;
    order: number;
    chapters: Chapter[];
}

interface VolumeAccordionProps {
    volumes: Volume[];
    standaloneChapters: Chapter[];
    slug: string;
    novelId: string;
}

export default function VolumeAccordion({ volumes, standaloneChapters, slug, novelId }: VolumeAccordionProps) {
    const [openVolumes, setOpenVolumes] = useState<Record<string, boolean>>(() => {
        // Open the last volume by default
        if (volumes.length > 0) {
            return { [volumes[volumes.length - 1].id]: true };
        }
        return {};
    });

    const toggleVolume = (id: string) => {
        setOpenVolumes(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getChapterIcon = (type: ChapterType) => {
        switch (type) {
            case "ILLUSTRATION": return <ImageIcon size={14} className="text-blue-500" />;
            case "EPILOGUE": return <LogOut size={14} className="text-amber-500" />;
            case "SIDESTORY": return <Sparkles size={14} className="text-purple-500" />;
            default: return <Book size={14} className="opacity-40" />;
        }
    };

    const getChapterBadge = (type: ChapterType) => {
        switch (type) {
            case "ILLUSTRATION": return "Ilustrasi";
            case "EPILOGUE": return "Epilog";
            case "SIDESTORY": return "Side Story";
            default: return null;
        }
    };

    const renderChapterLink = (chapter: Chapter) => (
        <Link
            key={chapter.id}
            href={`/novel/${slug}/chapter-${chapter.order}`}
            className="flex items-center gap-4 p-4 hover:bg-white/60 dark:hover:bg-white/5 transition-all group border-b border-black/5 dark:border-white/5 last:border-0"
        >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 group-hover:bg-black group-hover:text-white transition-colors">
                <span className="text-xs font-black">{chapter.order}</span>
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    {getChapterIcon(chapter.type)}
                    <h3 className="text-sm font-bold truncate">{chapter.title}</h3>
                </div>
                {getChapterBadge(chapter.type) && (
                    <span className="text-[0.5rem] font-black uppercase tracking-widest opacity-40 mt-1 block">
                        {getChapterBadge(chapter.type)}
                    </span>
                )}
            </div>
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
        </Link>
    );

    return (
        <div className="space-y-4">
            {/* Standalone Chapters (Prologue etc) */}
            {standaloneChapters.length > 0 && (
                <div className="bg-white/40 dark:bg-white/5 rounded-[2rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
                    <div className="px-8 py-4 bg-black/5 dark:bg-white/10 border-b border-black/5 dark:border-white/5">
                        <h3 className="text-[0.65rem] font-black uppercase tracking-[0.2em] opacity-40">Pendahuluan / Lainnya</h3>
                    </div>
                    <div className="divide-y divide-black/5 dark:divide-white/5">
                        {standaloneChapters.map(renderChapterLink)}
                    </div>
                </div>
            )}

            {/* Volumes */}
            {volumes.map((vol) => (
                <div key={vol.id} className="bg-white/40 dark:bg-white/5 rounded-[2.5rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-sm transition-all">
                    <button
                        onClick={() => toggleVolume(vol.id)}
                        className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-4 text-left">
                            <div className="w-12 h-12 rounded-2xl bg-[#3E2723] text-[#F5F5DC] flex items-center justify-center font-black shadow-lg">
                                {vol.order}
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tight">{vol.title}</h3>
                                <p className="text-[0.6rem] font-black uppercase tracking-widest opacity-30">
                                    {vol.chapters.length} Konten Tersedia
                                </p>
                            </div>
                        </div>
                        <div className={`transition-transform duration-300 ${openVolumes[vol.id] ? 'rotate-180' : ''}`}>
                            <ChevronDown size={24} className="opacity-20" />
                        </div>
                    </button>

                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openVolumes[vol.id] ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="px-4 pb-4">
                            <div className="bg-white/60 dark:bg-black/20 rounded-[1.5rem] border border-black/5 dark:border-white/5 overflow-hidden">
                                {vol.chapters.length > 0 ? (
                                    vol.chapters.map(renderChapterLink)
                                ) : (
                                    <div className="p-8 text-center opacity-40 italic text-sm">Belum ada chapter di volume ini.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
