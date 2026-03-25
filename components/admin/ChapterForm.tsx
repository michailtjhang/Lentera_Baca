"use client";

import { useState } from "react";
import Editor from "@/components/Editor";

interface ChapterFormProps {
    chapter?: any;
    volumes?: any[];
    action: (formData: FormData) => void;
}

export default function AdminChapterForm({ chapter, volumes = [], action }: ChapterFormProps) {
    const [content, setContent] = useState(chapter?.content || "");

    return (
        <form action={action} className="space-y-6 bg-white/40 p-8 rounded-3xl border border-black/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-bold uppercase tracking-widest opacity-60">Judul Bab</label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        defaultValue={chapter?.title}
                        placeholder="Contoh: Bab 1: Awal Mula"
                        className="w-full bg-white/80 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="order" className="text-sm font-bold uppercase tracking-widest opacity-60">Urutan (Angka)</label>
                    <input
                        type="number"
                        name="order"
                        id="order"
                        required
                        defaultValue={chapter?.order}
                        className="w-full bg-white/80 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="type" className="text-sm font-bold uppercase tracking-widest opacity-60">Tipe Konten</label>
                    <select
                        name="type"
                        id="type"
                        defaultValue={chapter?.type || "STORY"}
                        className="w-full bg-white/80 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-medium appearance-none"
                    >
                        <option value="STORY">📖 Cerita Utama</option>
                        <option value="ILLUSTRATION">🎨 Ilustrasi</option>
                        <option value="EPILOGUE">🔚 Epilog / Afterword</option>
                        <option value="SIDESTORY">🌟 Side Story / Spin-off</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label htmlFor="volumeId" className="text-sm font-bold uppercase tracking-widest opacity-60">Pilih Volume (Opsional)</label>
                    <select
                        name="volumeId"
                        id="volumeId"
                        defaultValue={chapter?.volumeId || ""}
                        className="w-full bg-white/80 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-medium appearance-none"
                    >
                        <option value="">Tanpa Volume</option>
                        {volumes.map((vol) => (
                            <option key={vol.id} value={vol.id}>{vol.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-bold uppercase tracking-widest opacity-60">Konten Bab</label>
                <input type="hidden" name="content" value={content} />
                <Editor value={content} onChange={setContent} placeholder="Tulis isi cerita bab ini..." />
            </div>

            <button
                type="submit"
                className="w-full bg-[#3E2723] text-[#F5F5DC] py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all active:scale-[0.98]"
            >
                {chapter ? "Update Bab" : "Simpan Bab"}
            </button>
        </form>
    );
}
