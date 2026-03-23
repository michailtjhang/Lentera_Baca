"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createLightNovel, updateLightNovel } from "@/app/actions/lightnovel";
import LNUploader from "@/components/admin/LNUploader";
import { Save, Loader2 } from "lucide-react";

interface LightNovelFormProps {
    mode: "create" | "edit";
    id?: string;
    defaultValues?: {
        title?: string;
        author?: string;
        description?: string;
        coverImage?: string;
        fileUrl?: string;
        fileType?: string;
        status?: string;
        genres?: string;
    };
}

const inputClass =
    "w-full bg-white border border-black/10 rounded-2xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/10 transition-all placeholder:text-black/25";
const labelClass = "block text-xs font-black uppercase tracking-widest text-black/40 mb-2";

export default function LightNovelForm({ mode, id, defaultValues = {} }: LightNovelFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [fileUrl, setFileUrl] = useState(defaultValues.fileUrl || "");
    const [coverImage, setCoverImage] = useState(defaultValues.coverImage || "");
    const [fileType, setFileType] = useState(defaultValues.fileType || "PDF");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        if (!fileUrl) {
            setError("Harap upload file PDF atau EPUB terlebih dahulu.");
            return;
        }

        const form = e.currentTarget;
        const formData = new FormData(form);
        formData.set("fileUrl", fileUrl);
        formData.set("coverImage", coverImage);
        formData.set("fileType", fileType);

        startTransition(async () => {
            if (mode === "create") {
                await createLightNovel(formData);
            } else {
                await updateLightNovel(id!, formData);
            }
            router.push("/admin/light-novel");
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* LN File + Cover Upload */}
            <LNUploader
                onFileUploaded={(url) => {
                    setFileUrl(url);
                    // Auto-detect file type
                    if (url.toLowerCase().includes(".epub")) setFileType("EPUB");
                    else setFileType("PDF");
                }}
                onCoverUploaded={setCoverImage}
                currentFileUrl={defaultValues.fileUrl}
                currentCoverUrl={defaultValues.coverImage}
            />

            {/* File Type Override */}
            <div>
                <label className={labelClass}>Tipe File</label>
                <div className="flex gap-3">
                    {["PDF", "EPUB"].map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setFileType(type)}
                            className={`flex-1 py-3 rounded-2xl text-sm font-black tracking-widest transition-all border ${fileType === type
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-black/40 border-black/10 hover:border-black/20"
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Title */}
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

            {/* Author */}
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

            {/* Description */}
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

            {/* Genres */}
            <div>
                <label className={labelClass}>Genre <span className="text-black/25">(pisahkan dengan koma)</span></label>
                <input
                    name="genres"
                    defaultValue={defaultValues.genres}
                    placeholder="Fantasy, Action, Romance..."
                    className={inputClass}
                />
            </div>

            {/* Status */}
            <div>
                <label className={labelClass}>Status</label>
                <select name="status" defaultValue={defaultValues.status || "ONGOING"} className={inputClass}>
                    <option value="ONGOING">On-going</option>
                    <option value="COMPLETE">Complete</option>
                    <option value="HIATUS">Hiatus</option>
                    <option value="DROP">Drop</option>
                </select>
            </div>

            {error && (
                <p className="text-sm text-red-500 font-bold bg-red-50 px-4 py-3 rounded-xl">{error}</p>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-2xl font-black tracking-widest text-sm hover:opacity-80 active:scale-[0.99] transition-all disabled:opacity-50"
            >
                {isPending ? (
                    <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
                ) : (
                    <><Save size={18} /> {mode === "create" ? "Tambah Light Novel" : "Simpan Perubahan"}</>
                )}
            </button>
        </form>
    );
}
