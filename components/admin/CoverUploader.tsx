"use client";

import { useState } from "react";
import { useSwiftGramUpload } from "@/lib/swiftgram-client";
import { Image, X, Loader2 } from "lucide-react";
import { deleteFiles } from "@/app/actions/novel-actions";
import { convertToWebP } from "@/lib/image-utils";

interface CoverUploaderProps {
    onUploaded: (url: string, key: string) => void;
    currentUrl?: string;
    currentKey?: string;
}

export default function CoverUploader({ onUploaded, currentUrl, currentKey }: CoverUploaderProps) {
    const [url, setUrl] = useState(currentUrl || "");
    const [key, setKey] = useState(currentKey || "");
    const { startUpload, isUploading } = useSwiftGramUpload({
        maxWidth: 1200,
        maxHeight: 1800,
        quality: 0.85,
        onClientUploadComplete: (res) => {
            const file = res[0];
            if (file) {
                setUrl(file.url);
                setKey(file.key);
                onUploaded(file.url, file.key);
            }
        },
        onUploadError: (error) => {
            alert(`Upload failed: ${error.message}`);
        },
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        try {
            // Konversi dan optimasi ke WebP
            const webpFile = await convertToWebP(file, { maxWidth: 1200, maxHeight: 1800, quality: 0.85 });
            await startUpload([webpFile]);
        } catch (error: any) {
            console.error("Image processing error:", error);
            alert(`Gagal memproses gambar: ${error.message}`);
        }
    };

    return (
        <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-widest opacity-50">
                Cover Image <span className="text-black/30 font-bold">(Otomatis dikonversi ke WebP)</span>
            </label>
            <div className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2.5rem] p-2 bg-white/40 dark:bg-white/5 group hover:border-black/20 dark:hover:border-white/20 transition-all flex flex-col items-center justify-center text-center min-h-[300px]">
                {url ? (
                    <div className="relative w-full max-w-[260px] aspect-[2/3] mx-auto group/preview">
                        <img 
                            src={url} 
                            alt="cover" 
                            className="w-full h-full object-cover rounded-[2rem] shadow-2xl border-4 border-white transition-transform group-hover/preview:scale-[1.03] duration-500" 
                        />
                        <button
                            type="button"
                            onClick={async () => { 
                                if (key) await deleteFiles(key);
                                setUrl(""); 
                                setKey("");
                                onUploaded("", ""); 
                            }}
                            className="absolute -top-4 -right-4 p-2.5 bg-red-500 text-white rounded-full shadow-2xl hover:bg-black transition-all z-20 hover:scale-110 active:scale-90 border-2 border-white"
                        >
                            <X size={18} />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Image size={32} className="text-black/20" />
                        </div>
                        
                        <label className="relative cursor-pointer">
                            <div className="bg-[#3E2723] text-[#F5F5DC] px-8 py-3 rounded-xl font-black text-[0.65rem] uppercase tracking-widest hover:opacity-80 transition-all flex items-center gap-2 shadow-xl">
                                {isUploading ? (
                                    <><Loader2 size={14} className="animate-spin" /> Mengunggah WebP...</>
                                ) : (
                                    "Pilih Cover"
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={isUploading}
                            />
                        </label>
                        <p className="mt-4 text-[0.6rem] font-bold text-black/20 uppercase tracking-widest">Auto WebP • Max 1200x1800</p>
                    </>
                )}
            </div>
        </div>
    );
}
