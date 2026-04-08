"use client";

import { useState, useEffect } from "react";
import { useFormStatus, useFormState } from "react-dom";
import Editor from "@/components/Editor";
import { useUploadThing } from "@/lib/uploadthing-client";
import { Image as ImageIcon, Loader2, Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { convertToWebP } from "@/lib/image-utils";
import { deleteFiles } from "@/app/actions/novel-actions";

interface ChapterFormProps {
    chapter?: any;
    volumes?: any[];
    action: (formData: FormData) => void;
    novelType?: string;
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
    const { pending } = useFormStatus();
    
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#3E2723] text-[#F5F5DC] py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
            {pending && <Loader2 className="animate-spin" size={20} />}
            {pending ? "Sedang Memproses..." : (isEdit ? "Update Chapter" : "Simpan Chapter")}
        </button>
    );
}

export default function AdminChapterForm({ chapter, volumes = [], action, novelType }: ChapterFormProps) {
    const isWeb = novelType === "WEB";
    const [state, formAction] = useFormState(action as any, null as { error?: string } | null);
    
    // Key for local storage drafting
    const novelId = chapter?.novelId || chapter?.novel?.id;
    const draftKey = `lb_draft_${novelId || 'unknown'}_${chapter?.id || 'new'}`;

    const [content, setContent] = useState(chapter?.content || "");
    const [title, setTitle] = useState(chapter?.title || "");
    const [type, setType] = useState(chapter?.type || "STORY");
    const [draftFound, setDraftFound] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);

    // For Illustration multi-image management
    const [images, setImages] = useState<{url: string, key?: string}[]>(() => {
        if (chapter?.type === "ILLUSTRATION") {
            const regex = /src="([^"]+)"/g;
            const urls = [];
            let match;
            while ((match = regex.exec(chapter.content || "")) !== null) {
                const url = match[1];
                const key = url.includes("utfs.io/f/") ? url.split("/f/").pop() : undefined;
                urls.push({ url, key });
            }
            return urls;
        }
        return [];
    });

    // Draft persistence
    useEffect(() => {
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
            const parsed = JSON.parse(savedDraft);
            // If draft content is different from initial content
            if (parsed.content !== (chapter?.content || "")) {
                setDraftFound(true);
            }
        }
    }, [draftKey, chapter?.content]);

    useEffect(() => {
        if (content || title || (type === "ILLUSTRATION" && images.length > 0)) {
            setIsSavingDraft(true);
            const timer = setTimeout(() => {
                localStorage.setItem(draftKey, JSON.stringify({ 
                    title, 
                    content,
                    type,
                    images,
                    timestamp: Date.now() 
                }));
                setIsSavingDraft(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [content, title, type, images, draftKey]);

    const restoreDraft = () => {
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
            const parsed = JSON.parse(savedDraft);
            setContent(parsed.content);
            if (parsed.title) setTitle(parsed.title);
            if (parsed.type) setType(parsed.type);
            if (parsed.images) setImages(parsed.images);
            setDraftFound(false);
            alert("Draft berhasil dipulihkan!");
        }
    };

    const clearDraft = () => {
        localStorage.removeItem(draftKey);
        setDraftFound(false);
    };


    const syncImagesToContent = (newImages: {url: string, key?: string}[]) => {
        const html = newImages.map(img => 
            `<img src="${img.url}" alt="illustration" class="rounded-2xl shadow-xl mx-auto my-8 max-w-full h-auto" />`
        ).join('\n');
        setContent(html);
    };
    
    // For specialized Illustration upload
    const { startUpload, isUploading } = useUploadThing("illustrationUploader", {
        onClientUploadComplete: (res) => {
            const file = res[0];
            if (file) {
                const newImages = [...images, { url: file.url, key: file.key }];
                setImages(newImages);
                syncImagesToContent(newImages);
            }
        },
        onUploadError: (error) => {
            alert(`Gagal mengunggah ilustrasi: ${error.message}`);
        },
    });

    const handleIllustrationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // Convert to WebP on client side
            const webpFile = await convertToWebP(file);
            
            const uniqueId = Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
            const renamedFile = new File([webpFile], `${uniqueId}.webp`, { type: "image/webp" });

            await startUpload([renamedFile]);
        } catch (err) {
            alert("Gagal memproses gambar: " + (err as any).message);
        }
    };

    const moveImage = (index: number, direction: 'up' | 'down') => {
        const newImages = [...images];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newImages.length) return;

        [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
        setImages(newImages);
        syncImagesToContent(newImages);
    };

    const removeImage = async (index: number) => {
        const imgToRemove = images[index];
        if (imgToRemove.key) {
            await deleteFiles(imgToRemove.key);
        }
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        syncImagesToContent(newImages);
    };

    return (
        <form 
            action={formAction} 
            onSubmit={() => {
                // Clear draft only on successful submission (handled later or simple clear)
                // Actually, clearing it here might be too early if validation fails.
                // But for simplicity in this demo:
                // setTimeout(clearDraft, 2000); 
            }}
            className="space-y-6 bg-white/40 p-6 md:p-10 rounded-[2.5rem] border border-black/5 max-w-7xl mx-auto shadow-sm"
        >
            {/* Error Message */}
            {state?.error && (
                <div className="bg-red-500 text-white p-4 rounded-2xl font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                    <Trash2 size={20} />
                    {state.error}
                </div>
            )}

            {/* Draft Notification */}
            {draftFound && (
                <div className="bg-amber-100 border border-amber-200 text-amber-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">💡</span>
                        <div className="flex flex-col">
                            <p className="text-sm font-bold">Ada draf tersimpan yang belum Anda simpan ke server.</p>
                            <p className="text-[0.65rem] opacity-70 italic font-black">Draf ini mencakup teks dan urutan ilustrasi yang terakhir Anda unggah.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            type="button" 
                            onClick={restoreDraft}
                            className="bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors shadow-lg"
                        >
                            Pulihkan Draf
                        </button>
                        <button 
                            type="button" 
                            onClick={clearDraft}
                            className="text-amber-800/50 hover:text-amber-800 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            )}

            {isSavingDraft && (
                <div className="fixed bottom-8 left-8 flex items-center gap-3 bg-[#3E2723] text-[#F5F5DC] px-5 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 z-[999]">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-[0.65rem] font-black uppercase tracking-widest">Menyimpan draf lokal...</span>
                </div>
            )}

            <div className="space-y-6">
                {/* Volume Selection (Top Priority) - Hidden for WEB */}
                {!isWeb && (
                    <div className="space-y-2">
                        <label htmlFor="volumeId" className="text-sm font-bold uppercase tracking-widest opacity-60">Pilih Volume (Utama)</label>
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
                )}

                {/* Type & Order */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {!isWeb ? (
                        <div className="space-y-2">
                            <label htmlFor="type" className="text-sm font-bold uppercase tracking-widest opacity-60">Tipe Konten</label>
                            <select
                                name="type"
                                id="type"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full bg-white/80 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-medium appearance-none"
                            >
                                <option value="PROLOGUE">🎬 Prolog</option>
                                <option value="STORY">📖 Cerita Utama</option>
                                <option value="ILLUSTRATION">🎨 Ilustrasi</option>
                                <option value="EPILOGUE">🔚 Epilog / Afterword</option>
                                <option value="SIDESTORY">🌟 Side Story / Spin-off</option>
                                <option value="INTERLUDE">↔️ Selingan / Interlude</option>
                            </select>
                        </div>
                    ) : (
                        <input type="hidden" name="type" value="STORY" />
                    )}

                    <div className="hidden">
                        <input type="hidden" name="order" defaultValue={chapter?.order} />
                    </div>
                </div>

                {/* Title (Optional) */}
                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-bold uppercase tracking-widest opacity-60">Judul Chapter (Opsional)</label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Misal: Chapter 1: Awal Mula (Kosongkan jika tidak ada)"
                        className="w-full bg-white/80 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-medium"
                    />
                </div>
            </div>

            {type === "ILLUSTRATION" ? (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold uppercase tracking-widest opacity-60">Daftar Ilustrasi (Bisa Diurutkan)</label>
                        <span className="text-[0.6rem] font-black uppercase tracking-widest opacity-30 px-3 py-1 bg-black/5 rounded-full">
                            {images.length} Gambar
                        </span>
                    </div>

                    {/* Image List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative group rounded-2xl overflow-hidden bg-white/40 border border-black/5 aspect-[3/4] shadow-sm hover:shadow-xl transition-all duration-500">
                                <img src={img.url} alt={`Illustration ${idx}`} className="w-full h-full object-cover" />
                                
                                {/* Controls Overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => moveImage(idx, 'up')}
                                            disabled={idx === 0}
                                            className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/40 disabled:opacity-20 transition-all"
                                            title="Pindah ke Atas"
                                        >
                                            <ArrowUp size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveImage(idx, 'down')}
                                            disabled={idx === images.length - 1}
                                            className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/40 disabled:opacity-20 transition-all"
                                            title="Pindah ke Bawah"
                                        >
                                            <ArrowDown size={16} />
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="mt-2 flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-[0.65rem] font-black uppercase tracking-widest hover:bg-black transition-all"
                                    >
                                        <Trash2 size={14} /> Hapus
                                    </button>
                                    <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-xs font-black shadow-lg">
                                        {idx + 1}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Upload Button */}
                        <label className={`relative cursor-pointer border-2 border-dashed border-black/10 rounded-2xl flex flex-col items-center justify-center p-8 bg-black/5 hover:bg-black/10 transition-all aspect-[3/4] ${isUploading ? 'pointer-events-none' : ''}`}>
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="animate-spin text-black/20" size={32} />
                                    <span className="text-[0.6rem] font-black uppercase tracking-widest opacity-20">Uploading...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                                        <Plus size={20} className="text-[#3E2723]" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[0.65rem] font-black uppercase tracking-widest opacity-60">Tambah Gambar</p>
                                        <p className="text-[0.5rem] font-bold opacity-30 mt-1">WebP Auto-Convert</p>
                                    </div>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleIllustrationChange}
                                disabled={isUploading}
                            />
                        </label>
                    </div>

                    {/* Hint */}
                    <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl text-center">
                        <p className="text-[0.6rem] font-black uppercase tracking-widest text-blue-500/60 leading-relaxed">
                            💡 Gunakan tombol panah di setiap gambar untuk merubah urutan tampilan pada halaman reader.
                        </p>
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

            <SubmitButton isEdit={!!chapter} />
        </form>
    );
}
