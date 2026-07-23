"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TagInput } from "@/components/TagInput";
import Editor from "@/components/Editor";
import LNUploader from "@/components/admin/LNUploader";
import CoverUploader from "@/components/admin/CoverUploader";
import { NovelType, Region, Status } from "@prisma/client";
import { Save, Loader2, ArrowLeft, User, BookOpen, Globe, Tag, FileText, Layers, Image, AlertCircle, CheckCircle2 } from "lucide-react";

interface NovelFormProps {
    novel?: any;
    tagSuggestions: string[];
    action: (arg1: any, arg2: any, arg3?: any) => Promise<any>;
    predefinedGenres: string[];
    mode: "create" | "edit";
    isLightNovel?: boolean;
}

const inputClass = "w-full bg-white dark:bg-white/5 border border-black/8 dark:border-white/8 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500/40 transition-all font-medium text-sm text-[#3E2723] dark:text-[#e8e8e8] placeholder:text-[#3E2723]/30 dark:placeholder:text-[#e8e8e8]/30";
const labelClass = "block text-[0.65rem] font-black uppercase tracking-[0.15em] opacity-50 mb-2";

const SectionCard = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-white/4 rounded-2xl border border-black/6 dark:border-white/6 overflow-visible">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-black/5 dark:border-white/5 bg-black/2 dark:bg-white/2 rounded-t-2xl">
            <div className="p-1.5 rounded-lg bg-[#3E2723]/10 dark:bg-white/10">
                <Icon size={14} className="text-[#3E2723] dark:text-white opacity-70" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider">{title}</h3>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

export default function AdminNovelForm({ novel, tagSuggestions, action, predefinedGenres, mode, isLightNovel }: NovelFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [description, setDescription] = useState(novel?.description || "");
    const [coverImage, setCoverImage] = useState(novel?.coverImage || "");
    const [coverImageKey, setCoverImageKey] = useState(novel?.coverImageKey || "");
    const [volumes, setVolumes] = useState<any[]>(novel?.volumes || []);
    const defaultType = isLightNovel ? ("LIGHTNOVEL_WEB" as any) : (novel?.type || NovelType.WEB);
    const [type, setType] = useState<string>(defaultType);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const currentTags = novel?.tags?.map((t: any) => t.name).join(", ") || "";

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setSuccess(false);

        const form = e.currentTarget;
        const formData = new FormData(form);
        formData.set("description", description);
        formData.set("coverImage", coverImage);
        formData.set("coverImageKey", coverImageKey);
        formData.set("volumes", JSON.stringify(volumes));

        startTransition(async () => {
            try {
                const result = await action(null, formData);

                if (result && result.success === false) {
                    setError(result.error);
                } else {
                    setSuccess(true);
                    setTimeout(() => {
                        router.push("/admin");
                        router.refresh();
                    }, 800);
                }
            } catch (err: any) {
                if (err.message === "NEXT_REDIRECT") return;
                setError(err.message || "Gagal menyimpan data.");
            }
        });
    }

    const LoadingOverlay = () => (
        <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-white/30 dark:bg-black/30 backdrop-blur-md">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 shadow-2xl flex flex-col items-center gap-4 border border-black/5 dark:border-white/5">
                {success ? (
                    <>
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle2 size={32} className="text-emerald-500" />
                        </div>
                        <p className="text-lg font-black tracking-tighter text-emerald-600 dark:text-emerald-400">Tersimpan!</p>
                    </>
                ) : (
                    <>
                        <div className="relative w-16 h-16">
                            <div className="w-16 h-16 border-4 border-amber-200 dark:border-amber-900/50 rounded-full" />
                            <div className="absolute inset-0 w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-black tracking-tighter">Menyimpan Data...</p>
                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] opacity-30 mt-1">Mohon tunggu</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <>
            {isPending && <LoadingOverlay />}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Basic Info */}
                <SectionCard icon={User} title="Informasi Dasar">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <label htmlFor="title" className={labelClass}>Judul Novel *</label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                required
                                defaultValue={novel?.title}
                                placeholder="Masukkan judul novel..."
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label htmlFor="author" className={labelClass}>Penulis *</label>
                            <input
                                type="text"
                                name="author"
                                id="author"
                                required
                                defaultValue={novel?.author}
                                placeholder="Nama penulis..."
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label htmlFor="illustrator" className={labelClass}>Ilustrator</label>
                            <input
                                type="text"
                                name="illustrator"
                                id="illustrator"
                                defaultValue={novel?.illustrator}
                                placeholder="Nama ilustrator (opsional)..."
                                className={inputClass}
                            />
                        </div>
                    </div>
                </SectionCard>

                {/* Classification */}
                <SectionCard icon={Globe} title="Klasifikasi">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <label htmlFor="type" className={labelClass}>Tipe Novel</label>
                            <select
                                name="type"
                                id="type"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className={inputClass}
                            >
                                <option value="WEB">Web Novel</option>
                                <option value="LIGHTNOVEL_WEB">Light Novel</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="region" className={labelClass}>Regional</label>
                            <select
                                name="region"
                                id="region"
                                defaultValue={novel?.region || Region.OTHER}
                                className={inputClass}
                            >
                                <option value={Region.OTHER}>🌐 Lainnya / Universal</option>
                                <option value={Region.JAPAN}>🇯🇵 Jepang (Light Novel)</option>
                                <option value={Region.KOREA}>🇰🇷 Korea</option>
                                <option value={Region.CHINA}>🇨🇳 China</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="status" className={labelClass}>Status</label>
                            <select
                                name="status"
                                id="status"
                                defaultValue={novel?.status || Status.ONGOING}
                                className={inputClass}
                            >
                                <option value={Status.ONGOING}>🟢 On-going</option>
                                <option value={Status.COMPLETE}>✅ Complete</option>
                                <option value={Status.DROP}>❌ Drop</option>
                                <option value={Status.HIATUS}>⏸️ Hiatus</option>
                            </select>
                        </div>
                    </div>
                </SectionCard>

                {/* Genres */}
                <SectionCard icon={BookOpen} title="Genre">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                        {predefinedGenres.map((genre: any) => (
                            <label
                                key={genre}
                                className="group flex items-center gap-2.5 p-2.5 rounded-xl border border-black/5 dark:border-white/5 hover:border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-900/10 cursor-pointer transition-all"
                            >
                                <input
                                    type="checkbox"
                                    name="genres"
                                    value={genre}
                                    defaultChecked={novel?.genres?.some((g: any) => g.name === genre)}
                                    className="w-3.5 h-3.5 rounded accent-amber-700 flex-shrink-0"
                                />
                                <span className="text-xs font-semibold group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">{genre}</span>
                            </label>
                        ))}
                    </div>
                </SectionCard>

                {/* Tags */}
                <SectionCard icon={Tag} title="Tags">
                    <p className="text-xs opacity-40 font-medium mb-3">Gunakan tag untuk mendeskripsikan konten lebih spesifik. Tag "18+", "adult", dll. akan disembunyikan dari halaman utama.</p>
                    <TagInput suggestions={tagSuggestions} defaultValue={currentTags} />
                </SectionCard>

                {/* Cover & Description */}
                <SectionCard icon={Image} title="Cover & Sinopsis">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                        <div className="md:col-span-4">
                            <label className={labelClass}>Gambar Cover</label>
                            <CoverUploader
                                onUploaded={(url: string, key: string) => { setCoverImage(url); setCoverImageKey(key); }}
                                currentUrl={novel?.coverImage}
                                currentKey={novel?.coverImageKey}
                            />
                        </div>
                        <div className="md:col-span-8">
                            <label className={labelClass}>Sinopsis / Deskripsi</label>
                            <Editor value={description} onChange={setDescription} placeholder="Ceritakan sedikit tentang novel ini..." />
                        </div>
                    </div>
                </SectionCard>

                {/* Files (for Light Novel) */}
                {(type === "LIGHTNOVEL_WEB") && (
                    <SectionCard icon={Layers} title="Files & Volume">
                        <LNUploader
                            onVolumesChanged={setVolumes}
                            currentVolumes={novel?.volumes}
                            novelType={type}
                        />
                    </SectionCard>
                )}

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4 rounded-2xl text-red-600 dark:text-red-400">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                    >
                        <ArrowLeft size={15} />
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex-1 flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white py-3.5 rounded-xl font-black tracking-wider text-sm hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-700/20"
                    >
                        {isPending ? (
                            <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
                        ) : (
                            <><Save size={16} /> {mode === "create" ? "Terbitkan Novel" : "Simpan Perubahan"}</>
                        )}
                    </button>
                </div>
            </form>
        </>
    );
}
