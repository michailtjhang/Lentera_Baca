"use client";

import { useState } from "react";
import Link from "next/link";
import { TagInput } from "@/components/TagInput";
import Editor from "@/components/Editor";

interface NovelFormProps {
    novel?: any;
    tagSuggestions: string[];
    action: (formData: FormData) => void;
    predefinedGenres: string[];
}

export default function AdminNovelForm({ novel, tagSuggestions, action, predefinedGenres }: NovelFormProps) {
    const [description, setDescription] = useState(novel?.description || "");
    const currentTags = novel?.tags?.map((t: any) => t.name).join(", ") || "";

    return (
        <form action={action} className="space-y-6 bg-white/40 p-8 rounded-3xl border border-black/5">
            <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-bold uppercase tracking-widest opacity-60">Judul Novel</label>
                <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    defaultValue={novel?.title}
                    placeholder="Contoh: Sang Pencari Cahaya"
                    className="w-full bg-white/80 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-medium"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="author" className="text-sm font-bold uppercase tracking-widest opacity-60">Penulis</label>
                <input
                    type="text"
                    name="author"
                    id="author"
                    required
                    defaultValue={novel?.author}
                    placeholder="Contoh: Ahmad Fuadi"
                    className="w-full bg-white/80 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-medium"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest opacity-60">Genre</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/80 p-4 rounded-xl border border-black/5">
                    {predefinedGenres.map((genre: any) => (
                        <label key={genre} className="flex items-center gap-2 text-sm font-medium cursor-pointer hover:opacity-70 transition-opacity">
                            <input
                                type="checkbox"
                                name="genres"
                                value={genre}
                                defaultChecked={novel?.genres?.some((g: any) => g.name === genre)}
                                className="w-4 h-4 accent-[#3E2723]"
                            />
                            {genre}
                        </label>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest opacity-60">Tag (Pilih atau Ketik)</label>
                <TagInput suggestions={tagSuggestions} defaultValue={currentTags} />
            </div>

            <div className="space-y-2">
                <label htmlFor="coverImage" className="text-sm font-bold uppercase tracking-widest opacity-60">URL Gambar Sampul (Opsional)</label>
                <input
                    type="url"
                    name="coverImage"
                    id="coverImage"
                    defaultValue={novel?.coverImage || ""}
                    placeholder="https://example.com/cover.jpg"
                    className="w-full bg-white/80 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-medium"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-bold uppercase tracking-widest opacity-60">Status</label>
                <select
                    name="status"
                    id="status"
                    defaultValue={novel?.status || "ONGOING"}
                    className="w-full bg-white/80 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-medium"
                >
                    <option value="ONGOING">On-going</option>
                    <option value="COMPLETE">Complete</option>
                    <option value="DROP">Drop</option>
                    <option value="HIATUS">Hiatus</option>
                </select>
            </div>

            <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-bold uppercase tracking-widest opacity-60">Deskripsi</label>
                <input type="hidden" name="description" value={description} />
                <Editor value={description} onChange={setDescription} placeholder="Ceritakan sedikit tentang novel ini..." />
            </div>

            <button
                type="submit"
                className="w-full bg-[#3E2723] text-[#F5F5DC] py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all active:scale-[0.98]"
            >
                {novel ? "Update Novel" : "Simpan Novel"}
            </button>
        </form>
    );
}
