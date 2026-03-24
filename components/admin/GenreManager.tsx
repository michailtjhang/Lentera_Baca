"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Check, X, Loader2, Search } from "lucide-react";
import { createGenre, updateGenre, deleteGenre } from "@/app/actions/genre-actions";

interface Genre {
    id: string;
    name: string;
    _count?: {
        novels: number;
    };
}

interface GenreManagerProps {
    initialGenres: Genre[];
}

export default function GenreManager({ initialGenres }: GenreManagerProps) {
    const [genres, setGenres] = useState<Genre[]>(initialGenres);
    const [newGenre, setNewGenre] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const filteredGenres = genres.filter(g => 
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAdd = () => {
        if (!newGenre.trim()) return;
        setError(null);
        startTransition(async () => {
            try {
                const created = await createGenre(newGenre.trim());
                setGenres(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
                setNewGenre("");
            } catch (err: any) {
                setError(err.message || "Gagal menambah genre.");
            }
        });
    };

    const handleUpdate = (id: string) => {
        if (!editingName.trim()) return;
        setError(null);
        startTransition(async () => {
            try {
                const updated = await updateGenre(id, editingName.trim());
                setGenres(prev => prev.map(g => g.id === id ? { ...g, name: updated.name } : g));
                setEditingId(null);
            } catch (err: any) {
                setError(err.message || "Gagal mengubah genre.");
            }
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm("Yakin ingin menghapus genre ini?")) return;
        setError(null);
        startTransition(async () => {
            try {
                await deleteGenre(id);
                setGenres(prev => prev.filter(g => g.id !== id));
            } catch (err: any) {
                setError(err.message || "Gagal menghapus genre.");
            }
        });
    };

    const LoadingOverlay = () => (
        <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-white/20 backdrop-blur-md animate-in fade-in duration-500 text-[#3E2723]">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-[#3E2723]/5 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-[#3E2723] border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="mt-6 text-xl font-black tracking-tighter animate-pulse">Sinkronisasi Genre...</p>
        </div>
    );

    return (
        <div className="space-y-8">
            {isPending && <LoadingOverlay />}
            {/* Add Genre Form */}
            <div className="bg-white/80 p-8 rounded-[2.5rem] border border-black/5 shadow-2xl shadow-black/5">
                <div className="max-w-md">
                    <label className="block text-xs font-black uppercase tracking-widest text-[#3E2723] mb-3">
                        Tambah Genre Baru
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newGenre}
                            onChange={(e) => setNewGenre(e.target.value)}
                            placeholder="Contoh: Isekai, Thriller..."
                            className="flex-1 bg-white/50 border border-black/5 text-[#3E2723] px-6 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-bold placeholder:text-[#3E2723]/10"
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        />
                        <button
                            onClick={handleAdd}
                            disabled={isPending || !newGenre.trim()}
                            className="bg-[#3E2723] text-white px-8 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-30 disabled:hover:scale-100 shadow-xl shadow-[#3E2723]/20"
                        >
                            {isPending && !editingId ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                            <span className="hidden md:inline">Tambah</span>
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-500 text-xs font-black uppercase tracking-widest flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <X size={16} />
                    {error}
                </div>
            )}

            {/* List & Search */}
            <div className="bg-white/60 border border-black/5 rounded-[3rem] overflow-hidden shadow-2xl shadow-black/5">
                <div className="p-8 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40">
                    <h3 className="text-xl font-black tracking-tight flex items-center gap-3 text-[#3E2723]">
                        <span className="w-8 h-8 bg-[#3E2723] text-white rounded-lg flex items-center justify-center text-xs shadow-lg shadow-[#3E2723]/20">G</span>
                        Koleksi Genre
                    </h3>
                    <div className="relative max-w-xs w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3E2723]/20" size={16} />
                        <input
                            type="text"
                            placeholder="Cari genre..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/40 border border-black/5 text-[#3E2723] px-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-bold text-sm placeholder:text-[#3E2723]/10"
                        />
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredGenres.map((genre) => (
                        <div
                            key={genre.id}
                            className="group flex items-center justify-between gap-4 bg-white/20 border border-black/5 p-4 rounded-2xl hover:bg-[#3E2723]/5 hover:border-[#3E2723]/30 transition-all duration-300"
                        >
                            {editingId === genre.id ? (
                                <div className="flex-1 flex gap-2">
                                    <input
                                        type="text"
                                        autoFocus
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        className="flex-1 bg-white/40 border border-black/10 text-[#3E2723] px-4 py-2 rounded-lg focus:outline-none font-bold text-sm"
                                        onKeyDown={(e) => e.key === "Enter" && handleUpdate(genre.id)}
                                    />
                                    <button
                                        onClick={() => handleUpdate(genre.id)}
                                        className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-[#3E2723] transition-colors shadow-lg shadow-emerald-500/20"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="p-2 bg-black/5 text-[#3E2723]/40 rounded-lg hover:bg-black/10 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-sm truncate uppercase tracking-widest text-[#3E2723] group-hover:text-black transition-colors">{genre.name}</h4>
                                        <p className="text-[0.6rem] font-bold text-[#3E2723]/30 uppercase tracking-[0.15em]">
                                            {genre._count?.novels || 0} Novels
                                        </p>
                                    </div>
                                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                        <button
                                            onClick={() => {
                                                setEditingId(genre.id);
                                                setEditingName(genre.name);
                                            }}
                                            className="p-2 text-[#3E2723]/40 hover:text-[#3E2723] hover:bg-black/5 rounded-lg transition-all"
                                            title="Edit Name"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(genre.id)}
                                            className="p-2 text-rose-500/30 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                            title="Delete Genre"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}

                    {filteredGenres.length === 0 && (
                        <div className="col-span-full py-12 text-center text-[#3E2723]/10">
                            <Plus size={32} className="mx-auto mb-3 opacity-20" />
                            <p className="font-black text-xs uppercase tracking-widest">Genre tidak ditemukan.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
