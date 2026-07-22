"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Edit2, Trash2, Book, Image as ImageIcon, Sparkles, LogOut, Layers, ArrowUp, ArrowDown, Save, X, Loader2 } from "lucide-react";
import { deleteChapter, swapVolumeOrders, updateVolumeTitle, swapChapterOrders } from "@/app/actions/novel-actions";

interface Chapter {
    id: string;
    title: string | null;
    order: number;
    type: string;
    volumeId: string | null;
    volume?: { title: string } | null;
    updatedAt: Date | string;
}

interface Volume {
    id: string;
    title: string;
    order: number;
}

interface AdminChapterListProps {
    novel: {
        id: string;
        title: string;
        type: string;
    };
    chapters: Chapter[];
    volumes: Volume[];
}

export default function AdminChapterList({ novel, chapters, volumes }: AdminChapterListProps) {
    const isWeb = novel.type === "WEB";
    const [openVolumes, setOpenVolumes] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = { "standalone": true };
        chapters.forEach(c => {
            if (c.volumeId) initial[c.volumeId] = true;
        });
        return initial;
    });

    const toggleVolume = (id: string) => {
        setOpenVolumes(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const typeLabels: Record<string, { label: string; icon: any; color: string }> = {
        PROLOGUE: { label: "Prolog", icon: Sparkles, color: "text-indigo-500" },
        STORY: { label: "Chapter", icon: Book, color: "text-[#3E2723] dark:text-amber-100" },
        ILLUSTRATION: { label: "Ilustrasi", icon: ImageIcon, color: "text-blue-500" },
        EPILOGUE: { label: "Epilog", icon: LogOut, color: "text-amber-500" },
        SIDESTORY: { label: "Side Story", icon: Sparkles, color: "text-purple-500" },
        INTERLUDE: { label: "Selingan", icon: Layers, color: "text-teal-500" },
    };

    // Group chapters by volume ID
    const chaptersByVolume = chapters.reduce((acc: Record<string, Chapter[]>, chapter) => {
        const volId = chapter.volumeId || "standalone";
        if (!acc[volId]) acc[volId] = [];
        acc[volId].push(chapter);
        return acc;
    }, {});

    const [isProcessing, setIsProcessing] = useState(false);
    const [editingVolumeId, setEditingVolumeId] = useState<string | null>(null);
    const [editTitleValue, setEditTitleValue] = useState("");

    const handleSaveVolumeTitle = async (id: string) => {
        if (!editTitleValue.trim() || isProcessing) return;
        setIsProcessing(true);
        try {
            await updateVolumeTitle(id, editTitleValue.trim());
            setEditingVolumeId(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSwapChapter = async (id1: string, id2: string) => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            await swapChapterOrders(id1, id2);
        } finally {
            setIsProcessing(false);
        }
    };

    const renderChapterRow = (chapter: Chapter, index: number, chapters: Chapter[]) => {
        const typeInfo = typeLabels[chapter.type] || { label: chapter.type, icon: Book, color: "text-gray-400" };

        return (
            <tr key={chapter.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                <td className="py-3 px-4">
                    <span className="text-[0.65rem] font-black px-2 py-0.5 bg-black/5 dark:bg-white/10 rounded group-hover:bg-[#3E2723] dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-colors">
                        {chapter.order}
                    </span>
                </td>

                {!isWeb && (
                    <td className="py-3 px-4">
                        <div className={`flex items-center gap-2 text-[0.65rem] font-bold ${typeInfo.color}`}>
                            <typeInfo.icon size={12} />
                            {typeInfo.label}
                        </div>
                    </td>
                )}

                <td className="py-3 px-4">
                    <p className="text-sm font-bold text-[#3E2723] dark:text-white line-clamp-1">
                        {chapter.title || (
                            chapter.type === "PROLOGUE" ? "Prolog" :
                                chapter.type === "INTERLUDE" ? "Selingan" :
                                    `Chapter ${chapter.order}`
                        )}
                    </p>
                </td>

                <td className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest opacity-30">
                    {new Date(chapter.updatedAt).toLocaleDateString('id-ID')}
                </td>

                <td className="py-3 px-4 text-right">
                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => handleSwapChapter(chapter.id, chapters[index - 1].id)}
                            disabled={index === 0 || isProcessing}
                            className="p-1.5 text-black/30 dark:text-white/30 hover:text-[#3E2723] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg disabled:opacity-10 transition-all"
                            title="Pindah ke Atas"
                        >
                            {isProcessing ? <Loader2 className="animate-spin" size={12} /> : <ArrowUp size={12} />}
                        </button>
                        <button
                            onClick={() => handleSwapChapter(chapter.id, chapters[index + 1].id)}
                            disabled={index === chapters.length - 1 || isProcessing}
                            className="p-1.5 text-black/30 dark:text-white/30 hover:text-[#3E2723] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg disabled:opacity-10 transition-all"
                            title="Pindah ke Bawah"
                        >
                            {isProcessing ? <Loader2 className="animate-spin" size={12} /> : <ArrowDown size={12} />}
                        </button>
                        <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1" />
                        <Link
                            href={`/admin/novel/${novel.id}/chapter/${chapter.id}/edit`}
                            className="p-1.5 text-black/30 dark:text-white/30 hover:text-[#3E2723] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all"
                            title="Edit"
                        >
                            <Edit2 size={12} />
                        </Link>
                        <button
                            onClick={async () => {
                                if (confirm("Hapus chapter ini?")) {
                                    await deleteChapter(chapter.id);
                                }
                            }}
                            className="p-1.5 text-red-400/60 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                            title="Hapus"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="bg-white dark:bg-white/4 border border-black/5 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left table-fixed">
                <thead>
                    <tr className="border-b border-black/5 dark:border-white/5 bg-black/2 dark:bg-white/2">
                        <th className="w-20 py-4 px-4 font-black uppercase text-[0.6rem] tracking-widest opacity-40">Order</th>
                        {!isWeb && <th className="w-32 py-4 px-4 font-black uppercase text-[0.6rem] tracking-widest opacity-40">Tipe</th>}
                        <th className="py-4 px-4 font-black uppercase text-[0.6rem] tracking-widest opacity-40">Judul Chapter</th>
                        <th className="w-32 py-4 px-4 font-black uppercase text-[0.6rem] tracking-widest opacity-40">Update</th>
                        <th className="w-24 py-4 px-4 text-right font-black uppercase text-[0.6rem] tracking-widest opacity-40">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {isWeb ? (
                        // Web Novel: Simple list, no grouping/accordion
                        chapters.map((c, i) => renderChapterRow(c, i, chapters))
                    ) : (
                        // Light Novel: Accordion-based volume grouping
                        <>
                            {volumes.map((vol, index) => (
                                <React.Fragment key={vol.id}>
                                    <tr className="bg-black/5 dark:bg-white/5 group/vol">
                                        <td colSpan={5} className="py-2 px-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div
                                                        className="flex items-center gap-3 cursor-pointer py-2 hover:opacity-70 transition-opacity"
                                                        onClick={() => toggleVolume(vol.id)}
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-[#3E2723] dark:bg-white text-[#F5F5DC] dark:text-[#111] flex items-center justify-center font-black text-xs shadow-sm">
                                                            {vol.order}
                                                        </div>
                                                        <ChevronDown
                                                            size={16}
                                                            className={`transition-transform duration-300 opacity-30 ${openVolumes[vol.id] ? 'rotate-180' : ''}`}
                                                        />
                                                    </div>

                                                    {editingVolumeId === vol.id ? (
                                                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-3 py-1 rounded-lg border border-black/10 dark:border-white/10 shadow-sm">
                                                            <input
                                                                type="text"
                                                                value={editTitleValue}
                                                                onChange={(e) => setEditTitleValue(e.target.value)}
                                                                className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-[#3E2723] dark:text-white outline-none border-none bg-transparent w-48"
                                                                autoFocus
                                                            />
                                                            <button onClick={() => handleSaveVolumeTitle(vol.id)} className="text-emerald-500 hover:scale-110 transition-transform"><Save size={14} /></button>
                                                            <button onClick={() => setEditingVolumeId(null)} className="text-red-500 hover:scale-110 transition-transform"><X size={14} /></button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3 group/title">
                                                            <span className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-[#3E2723] dark:text-white">
                                                                {vol.title}
                                                            </span>
                                                            <button
                                                                onClick={() => { setEditingVolumeId(vol.id); setEditTitleValue(vol.title); }}
                                                                disabled={isProcessing}
                                                                className="opacity-0 group-hover/vol:opacity-50 hover:!opacity-100 transition-opacity disabled:pointer-events-none"
                                                            >
                                                                <Edit2 size={12} />
                                                            </button>
                                                            <span className="text-[0.6rem] font-bold opacity-30">
                                                                ({chaptersByVolume[vol.id]?.length || 0} Items)
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    {openVolumes[vol.id] && (chaptersByVolume[vol.id] || []).map((c, i) => renderChapterRow(c, i, chaptersByVolume[vol.id]))}
                                </React.Fragment>
                            ))}

                            {/* Standalone Section if any */}
                            {chaptersByVolume["standalone"] && (
                                <React.Fragment key="standalone">
                                    <tr className="bg-black/5 dark:bg-white/5 cursor-pointer hover:bg-black/8 dark:hover:bg-white/8 transition-colors" onClick={() => toggleVolume("standalone")}>
                                        <td colSpan={5} className="py-3 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-black/20 dark:bg-white/20 flex items-center justify-center font-black text-xs">P</div>
                                                <span className="text-[0.7rem] font-black uppercase tracking-[0.2em] opacity-60">Tanpa Volume</span>
                                                <ChevronDown size={14} className={`transition-transform duration-300 opacity-30 ${openVolumes["standalone"] ? 'rotate-180' : ''}`} />
                                            </div>
                                        </td>
                                    </tr>
                                    {openVolumes["standalone"] && chaptersByVolume["standalone"].map((c, i) => renderChapterRow(c, i, chaptersByVolume["standalone"]))}
                                </React.Fragment>
                            )}
                        </>
                    )}
                </tbody>
            </table>

            {chapters.length === 0 && (
                <div className="p-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto opacity-40">
                        <Book size={32} />
                    </div>
                    <p className="text-sm font-bold opacity-30 uppercase tracking-widest">Belum ada chapter</p>
                </div>
            )}
        </div>
    );
}
