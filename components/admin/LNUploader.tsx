"use client";

import { useState } from "react";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";
import { FileText, Image, CheckCircle, X, Plus, Trash2 } from "lucide-react";

interface Volume {
    id?: string;
    title: string;
    fileUrl: string;
    fileKey: string;
    fileType: "PDF" | "EPUB";
    order?: number;
}

interface LNUploaderProps {
    onCoverUploaded: (url: string, key: string) => void;
    onVolumesChanged: (volumes: Volume[]) => void;
    currentCoverUrl?: string;
    currentCoverKey?: string;
    currentVolumes?: Volume[];
}

export default function LNUploader({
    onCoverUploaded,
    onVolumesChanged,
    currentCoverUrl,
    currentCoverKey,
    currentVolumes = [],
}: LNUploaderProps) {
    const [coverUrl, setCoverUrl] = useState(currentCoverUrl || "");
    const [coverKey, setCoverKey] = useState(currentCoverKey || "");
    const [volumes, setVolumes] = useState<Volume[]>(currentVolumes);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [isUploadingVolume, setIsUploadingVolume] = useState(false);

    const addVolume = (newVol: Volume) => {
        const updated = [...volumes, { ...newVol, order: volumes.length + 1 }];
        setVolumes(updated);
        onVolumesChanged(updated);
    };

    const removeVolume = (index: number) => {
        const updated = volumes.filter((_, i) => i !== index);
        setVolumes(updated);
        onVolumesChanged(updated);
    };

    return (
        <div className="space-y-8">
            {/* Cover Image Upload (WebP preferred) */}
            <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-widest opacity-50">
                    Cover Image <span className="text-black/30 font-bold">(WebP recommended)</span>
                </label>
                <div className="border-2 border-dashed border-black/10 rounded-[2.5rem] p-8 bg-white/40 group hover:border-black/20 transition-all flex flex-col items-center justify-center text-center">
                    {coverUrl ? (
                        <div className="relative">
                            <img src={coverUrl} alt="cover" className="w-32 h-44 object-cover rounded-2xl shadow-2xl" />
                            <button
                                type="button"
                                onClick={() => { setCoverUrl(""); setCoverKey(""); onCoverUploaded("", ""); }}
                                className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-black transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Image size={32} className="text-black/20" />
                            </div>
                            <UploadButton<OurFileRouter, "coverUploader">
                                endpoint="coverUploader"
                                onUploadBegin={() => setIsUploadingCover(true)}
                                onClientUploadComplete={(res) => {
                                    const file = res[0];
                                    if (file) {
                                        setCoverUrl(file.url);
                                        setCoverKey(file.key);
                                        onCoverUploaded(file.url, file.key);
                                    }
                                    setIsUploadingCover(false);
                                }}
                                onUploadError={() => setIsUploadingCover(false)}
                                appearance={{
                                    button: {
                                        background: "#000",
                                        borderRadius: "1rem",
                                        fontSize: "0.75rem",
                                        fontWeight: "900",
                                        letterSpacing: "0.1em",
                                        padding: "0.8rem 2rem",
                                    },
                                    allowedContent: { display: "none" },
                                }}
                                content={{ button: isUploadingCover ? "Uploading..." : "Upload Cover Image" }}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Volumes Management */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="block text-xs font-black uppercase tracking-widest opacity-50">
                        Volumes Management
                    </label>
                    <span className="text-[0.6rem] font-black uppercase tracking-widest text-black/30 bg-black/5 px-3 py-1 rounded-full">
                        {volumes.length} Volumes
                    </span>
                </div>

                {/* List of Volumes */}
                <div className="space-y-3">
                    {volumes.map((vol, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-white/60 border border-black/5 p-4 rounded-2xl shadow-sm">
                            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-black text-xs">
                                {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black text-sm truncate">{vol.title}</h4>
                                <p className="text-[0.6rem] font-bold text-black/30 uppercase tracking-widest">
                                    {vol.fileType} • {vol.fileKey.slice(0, 15)}...
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeVolume(idx)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                title="Remove Volume"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    {/* Add Volume Uploader */}
                    <div className="border-2 border-dashed border-black/5 rounded-2xl p-6 bg-white/20 flex flex-col items-center justify-center gap-3">
                        <FileText size={24} className="text-black/10" />
                        <p className="text-[0.65rem] font-black uppercase tracking-widest text-black/30 mb-2">Tambah Volume Baru (PDF/EPUB)</p>
                        <UploadButton<OurFileRouter, "lightNovelUploader">
                            endpoint="lightNovelUploader"
                            onUploadBegin={() => setIsUploadingVolume(true)}
                            onClientUploadComplete={(res) => {
                                const file = res[0];
                                if (file) {
                                    const type = file.url.toLowerCase().endsWith(".epub") ? "EPUB" : "PDF";
                                    addVolume({
                                        title: `Volume ${volumes.length + 1}`,
                                        fileUrl: file.url,
                                        fileKey: file.key,
                                        fileType: type as any,
                                    });
                                }
                                setIsUploadingVolume(false);
                            }}
                            onUploadError={() => setIsUploadingVolume(false)}
                            appearance={{
                                button: {
                                    background: "#000",
                                    borderRadius: "1rem",
                                    fontSize: "0.75rem",
                                    fontWeight: "900",
                                    letterSpacing: "0.1em",
                                    padding: "0.6rem 1.4rem",
                                },
                                allowedContent: { display: "none" },
                            }}
                            content={{ button: isUploadingVolume ? "Uploading..." : "Click to Upload File" }}
                        />
                    </div>
                </div>
            </div>
            
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                <p className="text-[0.6rem] font-black uppercase tracking-widest text-amber-600 leading-relaxed text-center">
                    ⚠️ Menghapus volume di sini akan menghapus file aslinya di storage cloud setelah Anda menekan tombol "Simpan" di bawah.
                </p>
            </div>
        </div>
    );
}
