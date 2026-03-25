"use client";

import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing-client";
import { FileText, X, Plus, Trash2, Loader2 } from "lucide-react";

interface Volume {
    id?: string;
    title: string;
    fileUrl?: string | null;
    fileKey?: string | null;
    fileType?: "PDF" | "EPUB";
    order?: number;
}

interface LNUploaderProps {
    onVolumesChanged: (volumes: Volume[]) => void;
    currentVolumes?: Volume[];
    novelType?: string;
}

export default function LNUploader({
    onVolumesChanged,
    currentVolumes = [],
    novelType = "WEB",
}: LNUploaderProps) {
    const [volumes, setVolumes] = useState<Volume[]>(currentVolumes);
    const [manualTitle, setManualTitle] = useState("");
    const { startUpload, isUploading } = useUploadThing("lightNovelUploader", {
        onClientUploadComplete: (res) => {
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
        },
        onUploadError: (error) => {
            alert(`Upload failed: ${error.message}`);
        },
    });

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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uniqueId = Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        const extension = file.name.split('.').pop();
        const renamedFile = new File([file], `${uniqueId}.${extension}`, { type: file.type });
        
        await startUpload([renamedFile]);
    };

    return (
        <div className="space-y-8">
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
                                    {vol.fileType} • {vol.fileKey ? `${vol.fileKey.slice(0, 15)}...` : "Grouping Volume"}
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

                    {/* Add Volume Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Manual Entry (Title Only) - Hidden for PDF/EPUB */}
                        {novelType === "LIGHTNOVEL" && (
                            <div className="border border-black/5 bg-white/20 rounded-[1.5rem] p-6 flex flex-col justify-center gap-3">
                                <label className="text-[0.6rem] font-black uppercase tracking-widest opacity-40 px-1">Tanpa File (Grup Chapter)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nama Volume..."
                                        value={manualTitle}
                                        onChange={(e) => setManualTitle(e.target.value)}
                                        className="flex-1 bg-white/60 border border-black/5 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-black/10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!manualTitle.trim()) return;
                                            addVolume({ title: manualTitle.trim() });
                                            setManualTitle("");
                                        }}
                                        className="bg-black text-white px-4 py-2 rounded-xl text-[0.6rem] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Tambah
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* File Uploader - Hidden for LIGHTNOVEL if they only want grouping */}
                        {(novelType === "PDF" || novelType === "EPUB") && (
                            <div className="border-2 border-dashed border-black/5 rounded-[1.5rem] p-6 bg-white/20 flex flex-col items-center justify-center gap-2 col-span-full">
                                <div className="flex items-center gap-3">
                                    <FileText size={20} className="opacity-20" />
                                    <div className="text-left">
                                        <p className="text-[0.65rem] font-black uppercase tracking-widest text-black/80">Upload File (Versi Ebook)</p>
                                        <p className="text-[0.5rem] font-bold text-black/30 uppercase tracking-[0.1em]">PDF/EPUB • Maks 16MB</p>
                                    </div>
                                </div>
                                
                                <label className="relative cursor-pointer w-full">
                                    <div className="bg-[#3E2723]/5 text-[#3E2723] w-full py-2.5 rounded-xl font-black text-[0.6rem] uppercase tracking-widest hover:bg-[#3E2723]/10 transition-all flex items-center justify-center gap-2">
                                        {isUploading ? (
                                            <><Loader2 size={12} className="animate-spin" /> Uploading...</>
                                        ) : (
                                            <>
                                                <Plus size={12} />
                                                Pilih File
                                            </>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept=".pdf,.epub"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        disabled={isUploading}
                                    />
                                </label>
                            </div>
                        )}
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
