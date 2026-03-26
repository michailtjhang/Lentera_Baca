import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Edit2, Trash2, Book, Image as ImageIcon, Sparkles, LogOut } from "lucide-react";
import { deleteChapter } from "@/app/actions/novel-actions";

interface Chapter {
    id: string;
    title: string | null;
    order: number;
    type: string;
    volumeId: string | null;
    volume?: { title: string } | null;
    updatedAt: Date | string;
}

interface AdminChapterListProps {
    novel: {
        id: string;
        title: string;
        type: string;
    };
    chapters: Chapter[];
}

export default function AdminChapterList({ novel, chapters }: AdminChapterListProps) {
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
        STORY: { label: "Chapter", icon: Book, color: "text-[#3E2723]" },
        ILLUSTRATION: { label: "Ilustrasi", icon: ImageIcon, color: "text-blue-500" },
        EPILOGUE: { label: "Epilog", icon: LogOut, color: "text-amber-500" },
        SIDESTORY: { label: "Side Story", icon: Sparkles, color: "text-purple-500" },
    };

    // Group chapters
    const grouped = chapters.reduce((acc: Record<string, { title: string, chapters: Chapter[] }>, chapter) => {
        const volId = chapter.volumeId || "standalone";
        if (!acc[volId]) {
            acc[volId] = { 
                title: chapter.volume?.title || (volId === "standalone" ? "Tanpa Volume" : "Volume Unknown"), 
                chapters: [] 
            };
        }
        acc[volId].chapters.push(chapter);
        return acc;
    }, {});

    const renderChapterRow = (chapter: Chapter) => {
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
                        {chapter.title || `Chapter ${chapter.order}`}
                    </p>
                </td>

                <td className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest opacity-20">
                    {new Date(chapter.updatedAt).toLocaleDateString('id-ID')}
                </td>

                <td className="py-3 px-4 text-right">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                            href={`/admin/novel/${novel.id}/chapter/${chapter.id}/edit`}
                            className="p-2 text-[#3E2723]/40 hover:text-[#3E2723] hover:bg-white rounded-lg border border-transparent hover:border-black/5 transition-all"
                            title="Edit"
                        >
                            <Edit2 size={14} />
                        </Link>
                        <button
                            onClick={async () => {
                                if (confirm("Hapus chapter ini?")) {
                                    await deleteChapter(chapter.id);
                                }
                            }}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-white rounded-lg border border-transparent hover:border-red-50"
                            title="Hapus"
                        >
                            <Trash2 size={14} />
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
                        chapters.map(renderChapterRow)
                    ) : (
                        // Light Novel: Accordion-based volume grouping
                        Object.entries(grouped).map(([volId, vol]) => (
                            <React.Fragment key={volId}>
                                <tr 
                                    className="bg-black/5 cursor-pointer hover:bg-black/10 transition-colors"
                                    onClick={() => toggleVolume(volId)}
                                >
                                    <td colSpan={5} className="py-4 px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#3E2723] text-[#F5F5DC] flex items-center justify-center font-black text-xs">
                                                    {volId === "standalone" ? "P" : "V"}
                                                </div>
                                                <span className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-[#3E2723]">
                                                    {vol.title}
                                                </span>
                                                <span className="text-[0.6rem] font-bold opacity-30">
                                                    ({vol.chapters.length} Items)
                                                </span>
                                            </div>
                                            <ChevronDown 
                                                size={18} 
                                                className={`transition-transform duration-300 opacity-20 ${openVolumes[volId] ? 'rotate-180' : ''}`} 
                                            />
                                        </div>
                                    </td>
                                </tr>
                                {openVolumes[volId] && vol.chapters.map(renderChapterRow)}
                            </React.Fragment>
                        ))
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

