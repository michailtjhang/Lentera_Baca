"use client";

import { useState } from "react";
import Editor from "@/components/Editor";

interface ChapterFormProps {
    chapter?: any;
    action: (formData: FormData) => void;
}

export default function AdminChapterForm({ chapter, action }: ChapterFormProps) {
    const [content, setContent] = useState(chapter?.content || "");

    return (
        <form action={action} className="space-y-6 bg-white/40 p-8 rounded-3xl border border-black/5">
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
                <label htmlFor="order" className="text-sm font-bold uppercase tracking-widest opacity-60">Urutan Bab (Angka)</label>
                <input
                    type="number"
                    name="order"
                    id="order"
                    required
                    defaultValue={chapter?.order}
                    placeholder="1, 2, 3..."
                    className="w-full bg-white/80 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-medium"
                />
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
