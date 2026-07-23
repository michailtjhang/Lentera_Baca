"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Check, X, Loader2, Search, Tag, Hash, BookOpen } from "lucide-react";
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
        <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-md">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 border border-black/5 dark:border-white/5">
                <div className="relative w-12 h-12">
                    <div className="w-12 h-12 border-4 border-amber-200 dark:border-amber-900/50 rounded-full" />
                    <div className="absolute inset-0 w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm font-black tracking-tight animate-pulse">Sinkronisasi Genre...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-5">
            {isPending && <LoadingOverlay />}

            {/* Add Genre Form */}
            <div className="bg-white dark:bg-white/4 rounded-2xl border border-black/6 dark:border-white/6 p-6">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.15em] opacity-40 mb-4 flex items-center gap-2">
                    <Plus size={11} /> Tambah Genre Baru
                </p>
                <div className="flex gap-3 max-w-md">
                    <input
                        type="text"
                        value={newGenre}
                        onChange={(e) => setNewGenre(e.target.value)}
                        placeholder="Contoh: Isekai, Thriller, Romance..."
                        className="flex-1 bg-black/5 dark:bg-white/5 border border-transparent focus:border-amber-500/30 text-[#3E2723] dark:text-white px-4 py-3 rounded-xl focus:outline-none transition-all font-medium text-sm placeholder:text-black/30 dark:placeholder:text-white/30"
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    />
                    <button
                        onClick={handleAdd}
                        disabled={isPending || !newGenre.trim()}
                        className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-6 py-3 rounded-xl font-black text-sm hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 shadow-md shadow-amber-700/20"
                    >
                        {isPending && !editingId ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                        <span>Tambah</span>
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold">
                    <X size={15} className="shrink-0" />
                    {error}
                </div>
            )}

            {/* Genre List */}
            <div className="bg-white dark:bg-white/4 rounded-2xl border border-black/6 dark:border-white/6 overflow-hidden">
                {/* List header with search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                            <Tag size={14} className="text-amber-700 dark:text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black tracking-tight">Koleksi Genre</h3>
                            <p className="text-[0.6rem] opacity-40 font-medium">{genres.length} genre terdaftar</p>
                        </div>
                    </div>
                    <div className="relative max-w-xs w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-30" size={14} />
                        <input
                            type="text"
                            placeholder="Cari genre..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-amber-500/30 text-[#3E2723] dark:text-white px-10 py-2.5 rounded-xl focus:outline-none transition-all font-medium text-sm placeholder:text-black/30 dark:placeholder:text-white/30"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-70 transition-opacity">
                                <X size={13} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid */}
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredGenres.map((genre) => (
                        <div
                            key={genre.id}
                            className="group flex items-center justify-between gap-3 bg-black/2 dark:bg-white/3 hover:bg-amber-50 dark:hover:bg-amber-900/10 border border-black/5 dark:border-white/5 hover:border-amber-300/40 dark:hover:border-amber-700/40 p-3.5 rounded-xl transition-all duration-200"
                        >
                            {editingId === genre.id ? (
                                <div className="flex-1 flex gap-2">
                                    <input
                                        type="text"
                                        autoFocus
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        className="flex-1 bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 text-[#3E2723] dark:text-white px-3 py-2 rounded-lg focus:outline-none font-medium text-sm"
                                        onKeyDown={(e) => e.key === "Enter" && handleUpdate(genre.id)}
                                    />
                                    <button
                                        onClick={() => handleUpdate(genre.id)}
                                        className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-sm"
                                    >
                                        <Check size={14} />
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="p-2 bg-black/8 dark:bg-white/8 rounded-lg hover:bg-black/15 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <Hash size={10} className="opacity-30 shrink-0" />
                                            <h4 className="font-black text-sm truncate tracking-tight">{genre.name}</h4>
                                        </div>
                                        <div className="flex items-center gap-1 text-[0.6rem] opacity-35 font-medium">
                                            <BookOpen size={9} />
                                            {genre._count?.novels || 0} novel
                                        </div>
                                    </div>
                                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1 shrink-0">
                                        <button
                                            onClick={() => {
                                                setEditingId(genre.id);
                                                setEditingName(genre.name);
                                            }}
                                            className="p-1.5 text-black/30 dark:text-white/30 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-all"
                                            title="Edit"
                                        >
                                            <Edit2 size={13} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(genre.id)}
                                            className="p-1.5 text-red-400/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                                            title="Hapus"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}

                    {filteredGenres.length === 0 && (
                        <div className="col-span-full py-16 text-center">
                            <Tag size={32} className="mx-auto mb-3 opacity-10" strokeWidth={1.5} />
                            <p className="text-sm font-black uppercase tracking-widest opacity-15">
                                {searchQuery ? "Genre tidak ditemukan" : "Belum ada genre"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
