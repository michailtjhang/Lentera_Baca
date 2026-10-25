"use client";

import { useState, useEffect } from "react";
import { useFormStatus, useFormState } from "react-dom";
import Editor from "@/components/Editor";
import { useSwiftGramUpload, deleteUploadedFile } from "@/lib/swiftgram-client";
import { Image as ImageIcon, Loader2, Trash2, ArrowUp, ArrowDown, Plus, CheckCircle2, Save } from "lucide-react";
import { convertToWebP } from "@/lib/image-utils";
import CustomSelect from "@/components/CustomSelect";

interface ChapterFormProps {
    chapter?: any;
    volumes?: any[];
    action: (prevState: any, formData: FormData) => Promise<any>;
    novelType?: string;
}

function TopSubmitButton({ isEdit }: { isEdit: boolean }) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-amber-900/20"
        >
            {pending ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
            <span>{pending ? "Menyimpan..." : (isEdit ? "Simpan Perubahan" : "Simpan Chapter")}</span>
        </button>
    );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
    const { pending } = useFormStatus();
    
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white py-4 rounded-xl font-black text-sm tracking-wider hover:shadow-xl transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-amber-700/20"
        >
            {pending && <Loader2 className="animate-spin" size={18} />}
            {pending ? "Sedang Memproses..." : (isEdit ? "Update Chapter" : "Simpan Chapter")}
        </button>
    );
}

export default function AdminChapterForm({ chapter, volumes = [], action, novelType }: ChapterFormProps) {
    const isWeb = novelType === "WEB";
    const [state, formAction] = useFormState(action as any, null as { error?: string } | null);
    
    const novelId = chapter?.novelId || chapter?.novel?.id;
    const draftKey = `lb_draft_${novelId || 'unknown'}_${chapter?.id || 'new'}`;

    const [content, setContent] = useState(chapter?.content || "");
    const [title, setTitle] = useState(chapter?.title || "");
    const [type, setType] = useState(chapter?.type || "STORY");
    const [draftFound, setDraftFound] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);

    const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
    const [deleteNotice, setDeleteNotice] = useState<{ message: string; isError?: boolean } | null>(null);

    const [images, setImages] = useState<{url: string, key?: string}[]>(() => {
        if (chapter?.type === "ILLUSTRATION") {
            const regex = /src="([^"]+)"/g;
            const urls: { url: string; key?: string }[] = [];
            let match;
            while ((match = regex.exec(chapter.content || "")) !== null) {
                const url = match[1];
                let key: string | undefined = undefined;
                const uuidMatch = url.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
                if (uuidMatch) {
                    key = uuidMatch[0];
                } else if (url.includes("/api/gateway/")) {
                    key = url.split("/api/gateway/").pop()?.split("?")[0]?.split("/")[0];
                } else if (url.includes("utfs.io/f/")) {
                    key = url.split("/f/").pop()?.split("?")[0];
                }
                urls.push({ url, key });
            }
            return urls;
        }
        return [];
    });

    useEffect(() => {
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
            const parsed = JSON.parse(savedDraft);
            if (parsed.content !== (chapter?.content || "")) {
                setDraftFound(true);
            }
        }
    }, [draftKey, chapter?.content]);

    useEffect(() => {
        if (content || title || type === "ILLUSTRATION") {
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
        return html;
    };
    
    const { startUpload, isUploading } = useSwiftGramUpload({
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
            const webpFile = await convertToWebP(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.85 });
            await startUpload([webpFile]);
        } catch (err: any) {
            alert("Gagal memproses gambar: " + err.message);
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
        if (!imgToRemove) return;

        if (!window.confirm("Hapus ilustrasi ini dari chapter?")) {
            return;
        }

        setDeletingIndex(index);

        // Remove from list immediately to ensure UI is fast and responsive
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        const newHtml = syncImagesToContent(newImages);

        // Update local draft immediately
        try {
            localStorage.setItem(draftKey, JSON.stringify({ 
                title, 
                content: newHtml,
                type,
                images: newImages,
                timestamp: Date.now() 
            }));
        } catch (e) {
            console.warn("Failed updating draft:", e);
        }

        // Delete from SwiftGram / storage
        const identifier = imgToRemove.key || imgToRemove.url;
        if (identifier) {
            try {
                const res = await deleteUploadedFile(identifier);
                if (res.success) {
                    setDeleteNotice({ message: "Ilustrasi berhasil dihapus dari server", isError: false });
                } else {
                    console.warn("SwiftGram delete notice:", res.error);
                    setDeleteNotice({ message: "Ilustrasi dihapus dari chapter", isError: false });
                }
            } catch (delErr: any) {
                console.warn("Storage deletion error:", delErr);
                setDeleteNotice({ message: "Ilustrasi dihapus dari chapter", isError: false });
            }
            setTimeout(() => setDeleteNotice(null), 3000);
        }

        setDeletingIndex(null);
    };

    const handleFormSubmit = async (formData: FormData) => {
        clearDraft(); 
        (formAction as any)(formData);
    };

    const inputClasses = "w-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/25 transition-all font-medium text-sm text-[#3E2723] dark:text-white placeholder:text-[#3E2723]/30 dark:placeholder:text-white/30";

    return (
        <form 
            id="chapter-form"
            action={handleFormSubmit} 
            className="space-y-6 bg-white dark:bg-white/4 p-6 md:p-10 rounded-3xl border border-black/5 dark:border-white/5 max-w-7xl mx-auto shadow-sm"
        >
            {/* Top Form Header Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-black/5 dark:border-white/5 gap-3">
                <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider opacity-70">
                        {chapter?.order ? `Pengaturan Chapter #${chapter.order}` : "Pengaturan Chapter Baru"}
                    </span>
                </div>
                <TopSubmitButton isEdit={!!chapter} />
            </div>

            {/* Error Message */}
            {state?.error && (
                <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 p-4 rounded-2xl font-bold flex items-center gap-3 text-sm">
                    <Trash2 size={16} className="shrink-0" />
                    {state.error}
                </div>
            )}

            {/* Draft Notification */}
            {draftFound && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
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
                            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
                        >
                            Pulihkan Draf
                        </button>
                        <button 
                            type="button" 
                            onClick={clearDraft}
                            className="text-amber-800/50 hover:text-amber-800 dark:text-amber-400/50 dark:hover:text-amber-400 transition-colors p-2 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            )}

            {isSavingDraft && (
                <div className="fixed top-24 right-8 flex items-center gap-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-5 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 z-[999] border border-white/10">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-[0.65rem] font-black uppercase tracking-widest">Menyimpan draf...</span>
                </div>
            )}

            {deleteNotice && (
                <div className={`fixed top-24 right-8 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 z-[999] border border-white/10 text-white ${deleteNotice.isError ? "bg-red-600" : "bg-emerald-600"}`}>
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-bold">{deleteNotice.message}</span>
                </div>
            )}

            <div className="space-y-6">
                {/* Volume Selection (Top Priority) - Hidden for WEB */}
                {!isWeb && (
                    <div className="space-y-2">
                        <label htmlFor="volumeId" className="text-[0.65rem] font-black uppercase tracking-[0.15em] opacity-50 block">Pilih Volume (Utama)</label>
                        <CustomSelect
                            name="volumeId"
                            id="volumeId"
                            defaultValue={chapter?.volumeId || ""}
                            options={volumes.length > 0 ? [
                                { value: "", label: "Tanpa Volume", icon: "📁" },
                                ...volumes.map((vol) => ({
                                    value: vol.id,
                                    label: vol.title,
                                    icon: "📚"
                                }))
                            ] : [
                                { value: "", label: "Tidak ada volume tersedia", icon: "📁" }
                            ]}
                            placeholder="Pilih volume..."
                        />
                    </div>
                )}

                {/* Type & Order */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {!isWeb ? (
                        <div className="space-y-2">
                            <label htmlFor="type" className="text-[0.65rem] font-black uppercase tracking-[0.15em] opacity-50 block">Tipe Konten</label>
                            <CustomSelect
                                name="type"
                                id="type"
                                value={type}
                                onChange={(val) => setType(val)}
                                options={[
                                    { value: "STORY", label: "Cerita Utama", icon: "📖" },
                                    { value: "PROLOGUE", label: "Prolog", icon: "🎬" },
                                    { value: "ILLUSTRATION", label: "Ilustrasi", icon: "🎨" },
                                    { value: "EPILOGUE", label: "Epilog / Afterword", icon: "🔚" },
                                    { value: "SIDESTORY", label: "Side Story / Spin-off", icon: "🌟" },
                                    { value: "INTERLUDE", label: "Selingan / Interlude", icon: "↔️" },
                                ]}
                                placeholder="Pilih tipe konten..."
                            />
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
                    <label htmlFor="title" className="text-[0.65rem] font-black uppercase tracking-[0.15em] opacity-50 block">Judul Chapter (Opsional)</label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Misal: Chapter 1: Awal Mula (Kosongkan jika tidak ada)"
                        className={inputClasses}
                    />
                </div>
            </div>

            {type === "ILLUSTRATION" ? (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <label className="text-[0.65rem] font-black uppercase tracking-[0.15em] opacity-50">Daftar Ilustrasi (Bisa Diurutkan)</label>
                        <span className="text-[0.6rem] font-black uppercase tracking-widest opacity-60 px-3 py-1 bg-black/5 dark:bg-white/10 rounded-full">
                            {images.length} Gambar
                        </span>
                    </div>

                    {/* Image List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {images.map((img, idx) => {
                            const isBeingDeleted = deletingIndex === idx;

                            return (
                                <div key={idx} className="relative group rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 aspect-[3/4] shadow-sm hover:shadow-xl transition-all duration-500">
                                    <img src={img.url} alt={`Illustration ${idx}`} className="w-full h-full object-cover" />
                                    
                                    {/* Number badge */}
                                    <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/10 flex items-center justify-center text-xs font-black shadow-lg z-10">
                                        {idx + 1}
                                    </div>

                                    {/* Deleting Spinner Overlay */}
                                    {isBeingDeleted && (
                                        <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center gap-2.5 backdrop-blur-md animate-in fade-in">
                                            <Loader2 className="animate-spin text-amber-500" size={32} />
                                            <span className="text-[0.65rem] font-black uppercase tracking-widest text-white">Menghapus...</span>
                                        </div>
                                    )}

                                    {/* Controls Overlay */}
                                    {!isBeingDeleted && (
                                        <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-sm z-10">
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => moveImage(idx, 'up')}
                                                    disabled={idx === 0 || deletingIndex !== null}
                                                    className="p-2.5 bg-white/20 text-white rounded-xl hover:bg-white/35 disabled:opacity-20 transition-all hover:scale-105 active:scale-95"
                                                    title="Pindah ke Atas"
                                                >
                                                    <ArrowUp size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveImage(idx, 'down')}
                                                    disabled={idx === images.length - 1 || deletingIndex !== null}
                                                    className="p-2.5 bg-white/20 text-white rounded-xl hover:bg-white/35 disabled:opacity-20 transition-all hover:scale-105 active:scale-95"
                                                    title="Pindah ke Bawah"
                                                >
                                                    <ArrowDown size={16} />
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                disabled={deletingIndex !== null}
                                                className="mt-2 flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[0.65rem] font-black uppercase tracking-widest shadow-lg shadow-red-950/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                            >
                                                <Trash2 size={14} /> Hapus Ilustrasi
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Upload Button */}
                        <label className={`relative cursor-pointer border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 bg-black/2 dark:bg-white/2 hover:bg-black/5 dark:hover:bg-white/5 transition-all aspect-[3/4] ${isUploading ? 'pointer-events-none' : ''}`}>
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="animate-spin opacity-40" size={32} />
                                    <span className="text-[0.6rem] font-black uppercase tracking-widest opacity-40 mt-2">Uploading...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-full flex items-center justify-center shadow-sm">
                                        <Plus size={20} className="text-[#3E2723] dark:text-white" />
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
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-2xl text-center">
                        <p className="text-[0.6rem] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 opacity-80 leading-relaxed">
                            💡 Gunakan tombol panah di setiap gambar untuk merubah urutan tampilan pada halaman reader.
                        </p>
                    </div>

                    <input type="hidden" name="content" value={content} />
                </div>
            ) : (
                <div className="space-y-2">
                    <label htmlFor="content" className="text-[0.65rem] font-black uppercase tracking-[0.15em] opacity-50 block">Konten Chapter</label>
                    <input type="hidden" name="content" value={content} />
                    <Editor value={content} onChange={setContent} placeholder="Tulis isi cerita chapter ini..." />
                </div>
            )}

            <SubmitButton isEdit={!!chapter} />
        </form>
    );
}
