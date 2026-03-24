"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TagInput } from "@/components/TagInput";
import Editor from "@/components/Editor";
import LNUploader from "@/components/admin/LNUploader";
import CoverUploader from "@/components/admin/CoverUploader";
import { NovelType, Region, Status } from "@prisma/client";
import { Save, Loader2, ArrowLeft } from "lucide-react";

interface NovelFormProps {
    novel?: any;
    tagSuggestions: string[];
    action: (novelId: string | any, formData: FormData) => Promise<void>;
    predefinedGenres: string[];
    mode: "create" | "edit";
}

const inputClass = "w-full bg-white/80 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-medium";
const labelClass = "text-sm font-bold uppercase tracking-widest opacity-60";

// Genres are now fetched dynamically from the database and passed as a prop
export default function AdminNovelForm({ novel, tagSuggestions, action, predefinedGenres, mode }: NovelFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [description, setDescription] = useState(novel?.description || "");
    const [coverImage, setCoverImage] = useState(novel?.coverImage || "");
    const [coverImageKey, setCoverImageKey] = useState(novel?.coverImageKey || "");
    const [volumes, setVolumes] = useState<any[]>(novel?.volumes || []);
    const [type, setType] = useState<string>(novel?.type || NovelType.WEB);
    const [error, setError] = useState("");

    const currentTags = novel?.tags?.map((t: any) => t.name).join(", ") || "";

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        const form = e.currentTarget;
        const formData = new FormData(form);
        formData.set("description", description);
        formData.set("coverImage", coverImage);
        formData.set("coverImageKey", coverImageKey);
        formData.set("volumes", JSON.stringify(volumes));

        startTransition(async () => {
            try {
                if (mode === "create") {
                    await action(null, formData);
                } else {
                    await action(novel.id, formData);
                }
                router.push("/admin");
                router.refresh();
            } catch (err: any) {
                setError(err.message || "Gagal menyimpan data.");
            }
        });
    }

    const LoadingOverlay = () => (
        <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-white/20 backdrop-blur-md animate-in fade-in duration-500">
            <div className="relative">
                <div className="w-24 h-24 border-4 border-[#3E2723]/5 rounded-full" />
                <div className="absolute inset-0 w-24 h-24 border-4 border-[#3E2723] border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="mt-8 flex flex-col items-center gap-2">
                <span className="text-2xl font-black tracking-tighter text-[#3E2723] animate-pulse">Memproses Data...</span>
                <span className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#3E2723]/40">Mohon tunggu sebentar</span>
            </div>
        </div>
    );

    return (
        <>
            {isPending && <LoadingOverlay />}
            <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white/40 p-8 rounded-[2.5rem] border border-black/5 space-y-8">
                {/* Judul & Penulis & Illustrator */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-2">
                        <label htmlFor="title" className={labelClass}>Judul Novel</label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            defaultValue={novel?.title}
                            placeholder="Judul novel..."
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="author" className={labelClass}>Penulis</label>
                        <input
                            type="text"
                            name="author"
                            id="author"
                            required
                            defaultValue={novel?.author}
                            placeholder="Penulis..."
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="illustrator" className={labelClass}>Ilustrator</label>
                        <input
                            type="text"
                            name="illustrator"
                            id="illustrator"
                            defaultValue={novel?.illustrator}
                            placeholder="Ilustrator (opsional)..."
                            className={inputClass}
                        />
                    </div>
                </div>

                {/* Type & Region & Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="type" className={labelClass}>Tipe Novel</label>
                        <select
                            name="type"
                            id="type"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className={inputClass}
                        >
                            <option value={NovelType.WEB}>Web Novel (Bab)</option>
                            <option value={NovelType.PDF}>Light Novel (PDF)</option>
                            <option value={NovelType.EPUB}>Light Novel (EPUB)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="region" className={labelClass}>Regional</label>
                        <select
                            name="region"
                            id="region"
                            defaultValue={novel?.region || Region.OTHER}
                            className={inputClass}
                        >
                            <option value={Region.OTHER}>Lainnya / Universal</option>
                            <option value={Region.JAPAN}>Jepang (Light Novel)</option>
                            <option value={Region.KOREA}>Korea</option>
                            <option value={Region.CHINA}>China</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="status" className={labelClass}>Status</label>
                        <select
                            name="status"
                            id="status"
                            defaultValue={novel?.status || Status.ONGOING}
                            className={inputClass}
                        >
                            <option value={Status.ONGOING}>On-going</option>
                            <option value={Status.COMPLETE}>Complete</option>
                            <option value={Status.DROP}>Drop</option>
                            <option value={Status.HIATUS}>Hiatus</option>
                        </select>
                    </div>
                </div>

                {/* Genre */}
                <div className="space-y-2">
                    <label className={labelClass}>Genre</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/60 p-6 rounded-2xl border border-black/5">
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

                {/* Tag */}
                <div className="space-y-2">
                    <label className={labelClass}>Tag (Pilih atau Ketik)</label>
                    <TagInput suggestions={tagSuggestions} defaultValue={currentTags} />
                </div>

                {/* Cover & Description */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
                    <div className="md:col-span-4">
                        <CoverUploader
                            onUploaded={(url: string, key: string) => { setCoverImage(url); setCoverImageKey(key); }}
                            currentUrl={novel?.coverImage}
                            currentKey={novel?.coverImageKey}
                        />
                    </div>
                    <div className="md:col-span-8 space-y-2">
                        <label htmlFor="description" className={labelClass}>Sinopsis / Deskripsi</label>
                        <Editor value={description} onChange={setDescription} placeholder="Ceritakan sedikit tentang novel ini..." />
                    </div>
                </div>
            </div>

            {/* Files Section (Only for PDF/EPUB) */}
            {type !== NovelType.WEB && (
                <div className="bg-white/40 p-8 rounded-[2.5rem] border border-black/5 space-y-8">
                    <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                        <span className="w-8 h-8 bg-[#3E2723] text-[#F5F5DC] rounded-lg flex items-center justify-center text-xs">F</span>
                        Files & Volumes
                    </h3>

                    <LNUploader
                        onVolumesChanged={setVolumes}
                        currentVolumes={novel?.volumes}
                    />
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-600 text-sm font-bold text-center">
                    {error}
                </div>
            )}

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-8 py-4 rounded-xl font-bold text-sm border border-black/10 hover:bg-black/5 transition-all"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#3E2723] text-[#F5F5DC] py-4 rounded-xl font-bold tracking-widest text-sm hover:opacity-80 active:scale-[0.99] transition-all disabled:opacity-50 shadow-2xl"
                >
                    {isPending ? (
                        <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
                    ) : (
                        mode === "create" ? "Terbitkan Novel" : "Simpan Perubahan"
                    )}
                </button>
            </div>
        </form>
        </>
    );
}
