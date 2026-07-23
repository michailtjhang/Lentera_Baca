"use client";

import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing-client";
import { FileText, X, Plus, Trash2, Loader2, ArrowUp, ArrowDown, Edit2 } from "lucide-react";
import { deleteFiles } from "@/app/actions/novel-actions";

interface Volume {
    id?: string;
    title: string;
    fileUrl?: string | null;
    fileKey?: string | null;
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
                addVolume({
                    title: `Volume ${volumes.length + 1}`,
                    fileUrl: file.url,
                    fileKey: file.key,
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

    const updateVolumeTitle = (index: number, newTitle: string) => {
        const updated = [...volumes];
        updated[index].title = newTitle;
        setVolumes(updated);
        onVolumesChanged(updated);
    };

    const removeVolume = async (index: number) => {
        const volumeToRemove = volumes[index];
        
        // If it's a newly uploaded file (no ID yet), delete from cloud immediately
        if (!volumeToRemove.id && volumeToRemove.fileKey) {
            await deleteFiles(volumeToRemove.fileKey);
        }

        const remaining = volumes.filter((_, i) => i !== index);
        const updated = remaining.map((v, i) => ({ ...v, order: i + 1 }));
        setVolumes(updated);
        onVolumesChanged(updated);
    };

    const moveVolume = (index: number, direction: 'up' | 'down') => {
        const newVolumes = [...volumes];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newVolumes.length) return;

        [newVolumes[index], newVolumes[targetIndex]] = [newVolumes[targetIndex], newVolumes[index]];
        
        // Update orders
        const updated = newVolumes.map((v, i) => ({ ...v, order: i + 1 }));
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
                        <div key={idx} className="flex items-center gap-4 bg-white/60 border border-black/5 p-4 rounded-2xl shadow-sm group/item">
                            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-black text-xs shrink-0">
                                {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 group/title">
                                    <input
                                        type="text"
                                        value={vol.title}
                                        onChange={(e) => updateVolumeTitle(idx, e.target.value)}
                                        placeholder="Judul Volume (Klik untuk ubah)..."
                                        className="flex-1 bg-transparent font-black text-sm outline-none border-b border-dashed border-black/5 dark:border-white/5 focus:border-[#3E2723]/30 dark:focus:border-white/30 pb-1 transition-colors text-[#3E2723] dark:text-white placeholder:text-black/20 dark:placeholder:text-white/20"
                                    />
                                    <Edit2 size={12} className="opacity-0 group-hover/title:opacity-20 transition-opacity" />
                                </div>
                                <p className="text-[0.6rem] font-bold text-black/30 uppercase tracking-widest mt-1">
                                    {vol.fileType || "Grouping"} • {vol.fileKey ? `${vol.fileKey.slice(0, 15)}...` : "Manual Entry"}
                                </p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <button
                                    type="button"
                                    onClick={() => moveVolume(idx, 'up')}
                                    disabled={idx === 0}
                                    className="p-2 text-black/40 hover:text-black hover:bg-black/5 rounded-xl disabled:opacity-10"
                                    title="Pindah Ke Atas"
                                >
                                    <ArrowUp size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveVolume(idx, 'down')}
                                    disabled={idx === volumes.length - 1}
                                    className="p-2 text-black/40 hover:text-black hover:bg-black/5 rounded-xl disabled:opacity-10"
                                    title="Pindah Ke Bawah"
                                >
                                    <ArrowDown size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeVolume(idx)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                    title="Remove Volume"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add Volume Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Manual Entry (Title Only) */}
                        {novelType === "LIGHTNOVEL_WEB" && (
                            <div className="border border-black/5 bg-white/20 rounded-[1.5rem] p-6 flex flex-col justify-center gap-3">
                                <label className="text-[0.6rem] font-black uppercase tracking-widest opacity-40 px-1">Tanpa File (Grup Chapter)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nama Volume..."
                                        value={manualTitle}
                                        onChange={(e) => setManualTitle(e.target.value)}
                                        className="flex-1 bg-white dark:bg-white/10 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-black/10 dark:focus:ring-white/10 text-[#3E2723] dark:text-white placeholder:text-black/20 dark:placeholder:text-white/20"
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


                    </div>
                </div>
            </div>
            
            <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-[2rem] space-y-3">
                <p className="text-[0.65rem] font-black uppercase tracking-widest text-amber-700 text-center flex items-center justify-center gap-2">
                    <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center italic font-serif">i</span>
                    Tips Penggunaan
                </p>
                <ul className="text-[0.6rem] font-bold text-amber-600 space-y-2 opacity-80 px-4">
                    <li>• File pertama yang diupload akan otomatis dinamai "Volume 1", file kedua "Volume 2", dst.</li>
                    <li>• Anda dapat mengecilkan atau mengubah nama volume (misal: "Edisi Khusus") langsung pada daftar di atas.</li>
                    <li>• Menghapus volume di sini akan menghapus file aslinya di storage cloud setelah Anda menekan tombol "Simpan" di bawah.</li>
                </ul>
            </div>
        </div>
    );
}
