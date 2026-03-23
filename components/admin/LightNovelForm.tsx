"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createLightNovel, updateLightNovel } from "@/app/actions/lightnovel";
import LNUploader from "@/components/admin/LNUploader";
import { Save, Loader2, ArrowLeft } from "lucide-react";

interface LightNovelFormProps {
    mode: "create" | "edit";
    id?: string;
    defaultValues?: {
        title?: string;
        author?: string;
        description?: string;
        coverImage?: string;
        coverImageKey?: string;
        status?: string;
        genres?: string;
        volumes?: any[];
    };
}

const inputClass =
    "w-full bg-white border border-black/10 rounded-2xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/10 transition-all placeholder:text-black/25";
const labelClass = "block text-xs font-black uppercase tracking-widest text-black/40 mb-2";

export default function LightNovelForm({ mode, id, defaultValues = {} }: LightNovelFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [volumes, setVolumes] = useState<any[]>(defaultValues.volumes || []);
    const [coverImage, setCoverImage] = useState(defaultValues.coverImage || "");
    const [coverImageKey, setCoverImageKey] = useState(defaultValues.coverImageKey || "");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        if (volumes.length === 0) {
            setError("Harap upload minimal satu volume.");
            return;
        }

        const form = e.currentTarget;
        const formData = new FormData(form);
        formData.set("coverImage", coverImage);
        formData.set("coverImageKey", coverImageKey);
        formData.set("volumes", JSON.stringify(volumes)); // Pass volumes as JSON

        startTransition(async () => {
            try {
                if (mode === "create") {
                    await createLightNovel(formData);
                } else {
                    await updateLightNovel(id!, formData);
                }
                router.push("/admin/light-novel");
            } catch (err: any) {
                setError(err.message || "Gagal menyimpan data.");
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white/60 border border-black/[0.03] rounded-[2.5rem] p-8 space-y-8">
                {/* 1. Judul & Author */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Judul *</label>
                        <input
                            name="title"
                            required
                            defaultValue={defaultValues.title}
                            placeholder="Judul light novel..."
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Penulis *</label>
                        <input
                            name="author"
                            required
                            defaultValue={defaultValues.author}
                            placeholder="Nama penulis..."
                            className={inputClass}
                        />
                    </div>
                </div>

                {/* 2. Description */}
                <div>
                    <label className={labelClass}>Deskripsi</label>
                    <textarea
                        name="description"
                        rows={4}
                        defaultValue={defaultValues.description}
                        placeholder="Sinopsis singkat..."
                        className={`${inputClass} resize-none`}
                    />
                </div>

                {/* 3. Genres & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Genre (pisahkan koma)</label>
                        <input
                            name="genres"
                            defaultValue={defaultValues.genres}
                            placeholder="Fantasy, Action..."
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Status</label>
                        <select name="status" defaultValue={defaultValues.status || "ONGOING"} className={inputClass}>
                            <option value="ONGOING">On-going</option>
                            <option value="COMPLETE">Complete</option>
                            <option value="HIATUS">Hiatus</option>
                            <option value="DROP">Drop</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 4. Files & Vol Management */}
            <div className="bg-white/60 border border-black/[0.03] rounded-[2.5rem] p-8">
                <h3 className="text-xl font-black tracking-tight mb-8 flex items-center gap-3">
                    <span className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-xs">UT</span>
                    Files & Media
                </h3>
                
                <LNUploader
                    onCoverUploaded={(url, key) => {
                        setCoverImage(url);
                        setCoverImageKey(key);
                    }}
                    onVolumesChanged={setVolumes}
                    currentCoverUrl={defaultValues.coverImage}
                    currentCoverKey={defaultValues.coverImageKey}
                    currentVolumes={defaultValues.volumes}
                />
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-600 text-sm font-bold text-center">
                    {error}
                </div>
            )}

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-8 py-4 rounded-2xl font-black text-sm border border-black/10 hover:bg-black/5 transition-all"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-4 rounded-2xl font-black tracking-widest text-sm hover:opacity-80 active:scale-[0.99] transition-all disabled:opacity-50 shadow-2xl shadow-black/10"
                >
                    {isPending ? (
                        <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
                    ) : (
                        <><Save size={18} /> {mode === "create" ? "Terbitkan Novel" : "Simpan Perubahan"}</>
                    )}
                </button>
            </div>
        </form>
    );
}
