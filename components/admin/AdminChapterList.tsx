"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Edit2, Trash2, Book, Image as ImageIcon, Sparkles, LogOut, Layers, ArrowUp, ArrowDown, Save, X } from "lucide-react";
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
        // Open all volumes by default initially, or just the last one?
        // Let's open all initially for convenience.
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
        STORY: { label: "Chapter", icon: Book, color: "text-[#3E2723]" },
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

    // State for inline volume title editing
    const [editingVolumeId, setEditingVolumeId] = useState<string | null>(null);
    const [editTitleValue, setEditTitleValue] = useState("");

    const handleSaveVolumeTitle = async (id: string) => {
        if (!editTitleValue.trim()) return;
        await updateVolumeTitle(id, editTitleValue.trim());
        setEditingVolumeId(null);
    };

    const renderChapterRow = (chapter: Chapter, index: number, chapters: Chapter[]) => {
        const typeInfo = typeLabels[chapter.type] || { label: chapter.type, icon: Book, color: "text-gray-400" };

        return (
            <tr key={chapter.id} className="hover:bg-white/40 transition-colors group">
                <td className="py-3 px-4">
                    <span className="text-[0.65rem] font-black px-2 py-0.5 bg-black/5 rounded group-hover:bg-[#3E2723] group-hover:text-white transition-colors">
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
                    <p className="text-sm font-bold text-[#3E2723] line-clamp-1">
                        {chapter.title || (
                            chapter.type === "PROLOGUE" ? "Prolog" :
                                chapter.type === "INTERLUDE" ? "Selingan" :
                                    `Chapter ${chapter.order}`
                        )}
                    </p>
                </td>

                <td className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest opacity-20">
                    {new Date(chapter.updatedAt).toLocaleDateString('id-ID')}
                </td>

                <td className="py-3 px-4 text-right">
                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => swapChapterOrders(chapter.id, chapters[index - 1].id)}
                            disabled={index === 0}
                            className="p-1.5 text-black/20 hover:text-black hover:bg-white rounded-lg disabled:opacity-5 transition-all"
                            title="Pindah ke Atas"
                        >
                            <ArrowUp size={12} />
                        </button>
                        <button
                            onClick={() => swapChapterOrders(chapter.id, chapters[index + 1].id)}
                            disabled={index === chapters.length - 1}
                            className="p-1.5 text-black/20 hover:text-black hover:bg-white rounded-lg disabled:opacity-5 transition-all"
                            title="Pindah ke Bawah"
                        >
                            <ArrowDown size={12} />
                        </button>
                        <div className="w-px h-4 bg-black/5 mx-1" />
                        <Link
                            href={`/admin/novel/${novel.id}/chapter/${chapter.id}/edit`}
                            className="p-1.5 text-[#3E2723]/40 hover:text-[#3E2723] hover:bg-white rounded-lg border border-transparent hover:border-black/5 transition-all"
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
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-white rounded-lg border border-transparent hover:border-red-50"
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
        <div className="bg-white/40 border border-black/5 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left table-fixed">
                <thead>
                    <tr className="border-b border-black/5 bg-[#3E2723]/5">
                        <th className="w-20 py-4 px-4 font-black uppercase text-[0.6rem] tracking-widest opacity-40">Order</th>
                        {!isWeb && <th className="w-32 py-4 px-4 font-black uppercase text-[0.6rem] tracking-widest opacity-40">Tipe</th>}
                        <th className="py-4 px-4 font-black uppercase text-[0.6rem] tracking-widest opacity-40">Judul Chapter</th>
                        <th className="w-32 py-4 px-4 font-black uppercase text-[0.6rem] tracking-widest opacity-40">Update</th>
                        <th className="w-24 py-4 px-4 text-right font-black uppercase text-[0.6rem] tracking-widest opacity-40">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                    {isWeb ? (
                        // Web Novel: Simple list, no grouping/accordion
                        chapters.map((c, i) => renderChapterRow(c, i, chapters))
                    ) : (
                        // Light Novel: Accordion-based volume grouping
                        <>
                            {volumes.map((vol, index) => (
                                <React.Fragment key={vol.id}>
                                    <tr className="bg-black/5 group/vol">
                                        <td colSpan={5} className="py-2 px-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div
                                                        className="flex items-center gap-3 cursor-pointer py-2 hover:opacity-70 transition-opacity"
                                                        onClick={() => toggleVolume(vol.id)}
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-[#3E2723] text-[#F5F5DC] flex items-center justify-center font-black text-xs">
                                                            {vol.order}
                                                        </div>
                                                        <ChevronDown
                                                            size={16}
                                                            className={`transition-transform duration-300 opacity-20 ${openVolumes[vol.id] ? 'rotate-180' : ''}`}
                                                        />
                                                    </div>

                                                    {editingVolumeId === vol.id ? (
                                                        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-black/10">
                                                            <input
                                                                type="text"
                                                                value={editTitleValue}
                                                                onChange={(e) => setEditTitleValue(e.target.value)}
                                                                className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-[#3E2723] outline-none border-none bg-transparent w-48"
                                                                autoFocus
                                                            />
                                                            <button onClick={() => handleSaveVolumeTitle(vol.id)} className="text-green-600 hover:scale-110 transition-transform"><Save size={14} /></button>
                                                            <button onClick={() => setEditingVolumeId(null)} className="text-red-600 hover:scale-110 transition-transform"><X size={14} /></button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3 group/title">
                                                            <span className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-[#3E2723]">
                                                                {vol.title}
                                                            </span>
                                                            <button
                                                                onClick={() => { setEditingVolumeId(vol.id); setEditTitleValue(vol.title); }}
                                                                className="opacity-0 group-hover/vol:opacity-40 hover:opacity-100 transition-opacity"
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
                                    <tr className="bg-black/5 cursor-pointer hover:bg-black/10 transition-colors" onClick={() => toggleVolume("standalone")}>
                                        <td colSpan={5} className="py-3 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-400 text-white flex items-center justify-center font-black text-xs">P</div>
                                                <span className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-gray-500">Tanpa Volume</span>
                                                <ChevronDown size={14} className={`transition-transform duration-300 opacity-20 ${openVolumes["standalone"] ? 'rotate-180' : ''}`} />
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
                    <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center mx-auto opacity-20">
                        <Book size={32} />
                    </div>
                    <p className="text-sm font-bold opacity-30 uppercase tracking-widest">Belum ada chapter</p>
                </div>
            )}
        </div>
    );
}

