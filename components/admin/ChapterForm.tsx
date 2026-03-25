"use client";

import { useState } from "react";
import Editor from "@/components/Editor";
import { useUploadThing } from "@/lib/uploadthing-client";
import { Image as ImageIcon, Loader2, Trash2 } from "lucide-react";

interface ChapterFormProps {
    chapter?: any;
    volumes?: any[];
    action: (formData: FormData) => void;
}

export default function AdminChapterForm({ chapter, volumes = [], action }: ChapterFormProps) {
    const [content, setContent] = useState(chapter?.content || "");
    const [type, setType] = useState(chapter?.type || "STORY");
    
    // For specialized Illustration upload
    const { startUpload, isUploading } = useUploadThing("illustrationUploader", {
        onClientUploadComplete: (res) => {
            const file = res[0];
            if (file) {
                // For illustrations, we set the content to the image HTML
                const imgHtml = `<img src="${file.url}" alt="illustration" class="rounded-2xl shadow-xl mx-auto my-8 max-w-full h-auto" />`;
                setContent(imgHtml);
            }
        },
        onUploadError: (error) => {
            alert(`Gagal mengunggah ilustrasi: ${error.message}`);
        },
    });

    const handleIllustrationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uniqueId = Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        const extension = file.name.split('.').pop();
        const renamedFile = new File([file], `${uniqueId}.${extension}`, { type: file.type });

        await startUpload([renamedFile]);
    };

    return (
        <form action={action} className="space-y-6 bg-white/40 p-8 rounded-3xl border border-black/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-bold uppercase tracking-widest opacity-60">Judul Chapter</label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        defaultValue={chapter?.title}
                        placeholder="Contoh: Chapter 1: Awal Mula"
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
                        value={type}
                        onChange={(e) => setType(e.target.value)}
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
                        {volumes.length > 0 ? (
                            <>
                                <option value="">Tanpa Volume</option>
                                {volumes.map((vol) => (
                                    <option key={vol.id} value={vol.id}>{vol.title}</option>
                                ))}
                            </>
                        ) : (
                            <option value="">Tidak ada volume tersedia</option>
                        )}
                    </select>
                </div>
            </div>

            {type === "ILLUSTRATION" ? (
                <div className="space-y-4">
                    <label className="text-sm font-bold uppercase tracking-widest opacity-60">Upload Ilustrasi</label>
                    <div className="border-2 border-dashed border-black/10 rounded-[2rem] p-10 bg-white/40 flex flex-col items-center justify-center text-center">
                        {content ? (
                            <div className="relative group/img max-w-sm">
                                <div dangerouslySetInnerHTML={{ __html: content }} className="prose-img:m-0" />
                                <button
                                    type="button"
                                    onClick={() => setContent("")}
                                    className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full shadow-xl hover:bg-black transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center mb-4">
                                    <ImageIcon size={32} className="text-black/20" />
                                </div>
                                <label className="relative cursor-pointer">
                                    <div className="bg-[#3E2723] text-[#F5F5DC] px-10 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-80 transition-all flex items-center gap-2 shadow-xl">
                                        {isUploading ? (
                                            <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                                        ) : (
                                            "Pilih Gambar"
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleIllustrationChange}
                                        disabled={isUploading}
                                    />
                                </label>
                            </>
                        )}
                    </div>
                    <input type="hidden" name="content" value={content} />
                </div>
            ) : (
                <div className="space-y-2">
                    <label htmlFor="content" className="text-sm font-bold uppercase tracking-widest opacity-60">Konten Chapter</label>
                    <input type="hidden" name="content" value={content} />
                    <Editor value={content} onChange={setContent} placeholder="Tulis isi cerita chapter ini..." />
                </div>
            )}

            <button
                type="submit"
                className="w-full bg-[#3E2723] text-[#F5F5DC] py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all active:scale-[0.98]"
            >
                {chapter ? "Update Chapter" : "Simpan Chapter"}
            </button>
        </form>
    );
}
