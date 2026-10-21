"use client";

import React, { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TagInput } from "@/components/TagInput";
import Editor from "@/components/Editor";
import LNUploader from "@/components/admin/LNUploader";
import CoverUploader from "@/components/admin/CoverUploader";
import { NovelType, Region, Status } from "@prisma/client";
import { 
    Save, 
    Loader2, 
    ArrowLeft, 
    User, 
    BookOpen, 
    Globe, 
    Tag, 
    Layers, 
    Image, 
    AlertCircle, 
    CheckCircle2, 
    Sparkles, 
    Check, 
    Search,
    Send,
    HelpCircle
} from "lucide-react";
import CustomSelect from "@/components/CustomSelect";

interface NovelFormProps {
    novel?: any;
    tagSuggestions: string[];
    action: (arg1: any, arg2: any, arg3?: any) => Promise<any>;
    predefinedGenres: string[];
    mode: "create" | "edit";
    isLightNovel?: boolean;
}

const inputClass = "w-full bg-neutral-50 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500/50 transition-all font-medium text-sm text-[#2B1810] dark:text-[#f0f0f0] placeholder:text-black/30 dark:placeholder:text-white/30";
const labelClass = "block text-xs font-bold uppercase tracking-wider opacity-60 mb-2";

const SectionCard = ({ 
    icon: Icon, 
    title, 
    badge,
    children,
    className = "" 
}: { 
    icon: any; 
    title: string; 
    badge?: string;
    children: React.ReactNode;
    className?: string;
}) => (
    <div className={`bg-white dark:bg-[#18181b] rounded-3xl border border-black/8 dark:border-white/10 shadow-sm overflow-hidden ${className}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/6 dark:border-white/6 bg-black/[0.015] dark:bg-white/[0.015]">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    <Icon size={15} />
                </div>
                <h3 className="text-sm font-black tracking-tight text-[#2B1810] dark:text-white">{title}</h3>
            </div>
            {badge && (
                <span className="text-[0.65rem] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                    {badge}
                </span>
            )}
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

export default function AdminNovelForm({ 
    novel, 
    tagSuggestions, 
    action, 
    predefinedGenres, 
    mode, 
    isLightNovel 
}: NovelFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [title, setTitle] = useState(novel?.title || "");
    const [author, setAuthor] = useState(novel?.author || "");
    const [description, setDescription] = useState(novel?.description || "");
    const [coverImage, setCoverImage] = useState(novel?.coverImage || "");
    const [coverImageKey, setCoverImageKey] = useState(novel?.coverImageKey || "");
    const [volumes, setVolumes] = useState<any[]>(novel?.volumes || []);
    const defaultType = isLightNovel ? ("LIGHTNOVEL_WEB" as any) : (novel?.type || NovelType.WEB);
    const [type, setType] = useState<string>(defaultType);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Selected genres state for interactive chips
    const [selectedGenres, setSelectedGenres] = useState<string[]>(
        novel?.genres ? novel.genres.map((g: any) => g.name) : []
    );
    const [genreSearch, setGenreSearch] = useState("");

    const currentTags = novel?.tags?.map((t: any) => t.name).join(", ") || "";

    const toggleGenre = (genreName: string) => {
        setSelectedGenres((prev) => 
            prev.includes(genreName)
                ? prev.filter((g) => g !== genreName)
                : [...prev, genreName]
        );
    };

    const filteredGenres = useMemo(() => {
        if (!genreSearch.trim()) return predefinedGenres;
        const q = genreSearch.toLowerCase();
        return predefinedGenres.filter((g) => g.toLowerCase().includes(q));
    }, [predefinedGenres, genreSearch]);

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

        // Ensure all selected genres are attached to formData
        formData.delete("genres");
        for (const g of selectedGenres) {
            formData.append("genres", g);
        }

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
        <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-black/40 backdrop-blur-md">
            <div className="bg-white dark:bg-[#18181b] rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col items-center gap-4 border border-black/10 dark:border-white/10 max-w-sm w-full mx-4">
                {success ? (
                    <>
                        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/20">
                            <CheckCircle2 size={32} />
                        </div>
                        <p className="text-xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                            {mode === "create" ? "Berhasil Diterbitkan!" : "Perubahan Tersimpan!"}
                        </p>
                        <p className="text-xs opacity-50 font-semibold text-center">Dialihkan ke dashboard...</p>
                    </>
                ) : (
                    <>
                        <div className="relative w-14 h-14">
                            <div className="w-14 h-14 border-4 border-amber-200 dark:border-amber-900/50 rounded-full" />
                            <div className="absolute inset-0 w-14 h-14 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <div className="text-center">
                            <p className="text-base font-black tracking-tight">Menyimpan Novel...</p>
                            <p className="text-xs opacity-50 font-semibold mt-1">Sinkronisasi database dan media</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    const isFormValid = title.trim().length > 0 && author.trim().length > 0;

    return (
        <>
            {isPending && <LoadingOverlay />}
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* ─── LEFT COLUMN: MAIN CONTENT (COL 8) ──────────────────── */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Basic Info */}
                    <SectionCard icon={User} title="Informasi Utama">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="title" className={labelClass}>
                                    Judul Novel <span className="text-amber-600 dark:text-amber-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Contoh: Solo Leveling, Shadow Slave..."
                                    className={`${inputClass} text-base font-bold`}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="author" className={labelClass}>
                                        Penulis (Author) <span className="text-amber-600 dark:text-amber-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="author"
                                        id="author"
                                        required
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                        placeholder="Nama penulis novel..."
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="illustrator" className={labelClass}>
                                        Ilustrator (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        name="illustrator"
                                        id="illustrator"
                                        defaultValue={novel?.illustrator}
                                        placeholder="Nama ilustrator..."
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Classification */}
                    <SectionCard icon={Globe} title="Format & Klasifikasi">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="type" className={labelClass}>Tipe Format</label>
                                <CustomSelect
                                    name="type"
                                    id="type"
                                    value={type}
                                    onChange={(val) => setType(val)}
                                    options={[
                                        { value: "WEB", label: "Web Novel", icon: "🌐" },
                                        { value: "LIGHTNOVEL_WEB", label: "Light Novel", icon: "📖" },
                                    ]}
                                />
                            </div>
                            <div>
                                <label htmlFor="region" className={labelClass}>Asal Bahasa / Region</label>
                                <CustomSelect
                                    name="region"
                                    id="region"
                                    defaultValue={novel?.region || Region.OTHER}
                                    options={[
                                        { value: Region.OTHER, label: "Lainnya / Universal", icon: "🌐" },
                                        { value: Region.JAPAN, label: "Jepang", icon: "🇯🇵" },
                                        { value: Region.KOREA, label: "Korea", icon: "🇰🇷" },
                                        { value: Region.CHINA, label: "China", icon: "🇨🇳" },
                                    ]}
                                />
                            </div>
                            <div>
                                <label htmlFor="status" className={labelClass}>Status Rilis</label>
                                <CustomSelect
                                    name="status"
                                    id="status"
                                    defaultValue={novel?.status || Status.ONGOING}
                                    options={[
                                        { value: Status.ONGOING, label: "On-going", icon: "🟢" },
                                        { value: Status.COMPLETE, label: "Tamat / Selesai", icon: "✅" },
                                        { value: Status.HIATUS, label: "Hiatus", icon: "⏸️" },
                                        { value: Status.DROP, label: "Drop", icon: "❌" },
                                    ]}
                                />
                            </div>
                        </div>
                    </SectionCard>

                    {/* Synopsis & Rich Editor */}
                    <SectionCard 
                        icon={BookOpen} 
                        title="Sinopsis & Deskripsi Cerita"
                        badge="TipTap Rich Editor"
                    >
                        <div className="space-y-2">
                            <Editor 
                                value={description} 
                                onChange={setDescription} 
                                placeholder="Tuliskan sinopsis lengkap novel ini untuk menarik pembaca..." 
                            />
                            <p className="text-[0.65rem] opacity-40 font-medium px-1">
                                Tips: Gambar yang disisipkan otomatis dikonversi ke WebP. Menghapus gambar dari editor akan menghapusnya permanen dari server storage.
                            </p>
                        </div>
                    </SectionCard>

                    {/* Files & Volumes (for Light Novel) */}
                    {(type === "LIGHTNOVEL_WEB") && (
                        <SectionCard icon={Layers} title="Struktur Volume & Grouping">
                            <LNUploader
                                onVolumesChanged={setVolumes}
                                currentVolumes={novel?.volumes}
                                novelType={type}
                            />
                        </SectionCard>
                    )}

                    {/* Error display */}
                    {error && (
                        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 p-4 rounded-2xl text-red-600 dark:text-red-400">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <div className="text-xs font-bold leading-relaxed">{error}</div>
                        </div>
                    )}
                </div>

                {/* ─── RIGHT COLUMN: METADATA & ACTIONS (COL 4) ───────────── */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Sticky Action / Publish Card */}
                    <div className="bg-white dark:bg-[#18181b] rounded-3xl border border-black/8 dark:border-white/10 p-6 shadow-sm sticky top-24 z-10 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider opacity-40">
                                Panel Aksi
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-bold ${
                                isFormValid 
                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20" 
                                    : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isFormValid ? "bg-emerald-500" : "bg-amber-500"}`} />
                                <span>{isFormValid ? "Data Lengkap" : "Wajib Diisi"}</span>
                            </span>
                        </div>

                        <div className="space-y-2 pt-1">
                            <button
                                type="submit"
                                disabled={isPending || !isFormValid}
                                className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md ${
                                    isFormValid && !isPending
                                        ? "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-amber-600/25 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
                                        : "bg-black/10 dark:bg-white/10 text-black/30 dark:text-white/30 cursor-not-allowed shadow-none"
                                }`}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={14} />
                                        <span>{mode === "create" ? "Terbitkan Novel" : "Simpan Perubahan"}</span>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors opacity-70 hover:opacity-100"
                            >
                                <ArrowLeft size={14} />
                                <span>Kembali</span>
                            </button>
                        </div>
                    </div>

                    {/* Cover Image Upload Card */}
                    <SectionCard icon={Image} title="Gambar Sampul (Cover)">
                        <CoverUploader
                            onUploaded={(url: string, key: string) => { 
                                setCoverImage(url); 
                                setCoverImageKey(key); 
                            }}
                            currentUrl={novel?.coverImage}
                            currentKey={novel?.coverImageKey}
                        />
                    </SectionCard>

                    {/* Genres Selection Card */}
                    <SectionCard 
                        icon={BookOpen} 
                        title="Genre Cerita"
                        badge={`${selectedGenres.length} Dipilih`}
                    >
                        <div className="space-y-3">
                            {/* Filter input if many genres */}
                            {predefinedGenres.length > 8 && (
                                <div className="relative">
                                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                                    <input
                                        type="text"
                                        value={genreSearch}
                                        onChange={(e) => setGenreSearch(e.target.value)}
                                        placeholder="Cari genre..."
                                        className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-neutral-50 dark:bg-white/[0.04] border border-black/8 dark:border-white/8 outline-none focus:border-amber-500/50"
                                    />
                                </div>
                            )}

                            {/* Interactive Genre Chips */}
                            <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto pr-1">
                                {filteredGenres.map((genre: string) => {
                                    const isSelected = selectedGenres.includes(genre);
                                    return (
                                        <button
                                            key={genre}
                                            type="button"
                                            onClick={() => toggleGenre(genre)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                isSelected
                                                    ? "bg-amber-600 text-white shadow-sm shadow-amber-600/30 border border-amber-600"
                                                    : "bg-neutral-50 dark:bg-white/[0.04] text-neutral-700 dark:text-neutral-300 border border-black/8 dark:border-white/8 hover:border-amber-500/40 hover:bg-amber-500/5"
                                            }`}
                                        >
                                            {isSelected && <Check size={12} className="stroke-[3]" />}
                                            <span>{genre}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Hidden inputs to guarantee form capture */}
                            {selectedGenres.map((g) => (
                                <input key={g} type="hidden" name="genres" value={g} />
                            ))}
                        </div>
                    </SectionCard>

                    {/* Tags Input Card */}
                    <SectionCard icon={Tag} title="Tags Novel">
                        <div className="space-y-2">
                            <TagInput suggestions={tagSuggestions} defaultValue={currentTags} />
                            <p className="text-[0.65rem] opacity-40 font-medium">
                                Tekan <kbd className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[0.6rem]">Enter</kbd> atau koma untuk menambahkan tag baru.
                            </p>
                        </div>
                    </SectionCard>
                </div>
            </form>
        </>
    );
}
