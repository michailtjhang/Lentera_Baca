"use client";

import { useState } from "react";
import { useSwiftGramUpload } from "@/lib/swiftgram-client";
import { Image as ImageIcon, X, Loader2, UploadCloud, RefreshCw } from "lucide-react";
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
            alert(`Gagal mengunggah cover: ${error.message}`);
        },
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        try {
            // Konversi dan optimasi otomatis ke format WebP
            const webpFile = await convertToWebP(file, { maxWidth: 1200, maxHeight: 1800, quality: 0.85 });
            await startUpload([webpFile]);
        } catch (error: any) {
            console.error("Image processing error:", error);
            alert(`Gagal memproses gambar: ${error.message}`);
        }
    };

    const handleRemove = async () => {
        if (key) {
            await deleteFiles(key).catch(console.error);
        }
        setUrl(""); 
        setKey("");
        onUploaded("", ""); 
    };

    return (
        <div className="w-full">
            <div className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl p-4 bg-black/[0.02] dark:bg-white/[0.02] hover:border-amber-500/40 dark:hover:border-amber-400/40 transition-all flex flex-col items-center justify-center text-center min-h-[280px]">
                {url ? (
                    <div className="relative w-full max-w-[200px] aspect-[10/14] mx-auto group/preview">
                        <img 
                            src={url} 
                            alt="Cover preview" 
                            className="w-full h-full object-cover rounded-xl shadow-xl border border-black/10 dark:border-white/10 transition-transform group-hover/preview:scale-[1.02] duration-300" 
                        />
                        {/* Remove button */}
                        <button
                            type="button"
                            onClick={handleRemove}
                            title="Hapus gambar cover"
                            className="absolute -top-2.5 -right-2.5 p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 border-2 border-white dark:border-zinc-900"
                        >
                            <X size={14} />
                        </button>
                        {/* Status tag */}
                        <div className="absolute bottom-2 left-2 right-2 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-black/80 dark:bg-black/90 text-white text-[0.6rem] font-black uppercase tracking-wider backdrop-blur-sm">
                                WebP Optimized
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 px-4">
                        <div className="w-14 h-14 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-4 border border-amber-500/20">
                            {isUploading ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <UploadCloud size={24} />
                            )}
                        </div>
                        
                        <label className="relative cursor-pointer">
                            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md shadow-amber-600/20 hover:shadow-lg transition-all active:scale-95">
                                {isUploading ? (
                                    <>
                                        <Loader2 size={13} className="animate-spin" />
                                        <span>Mengunggah...</span>
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon size={14} />
                                        <span>Pilih Gambar Sampul</span>
                                    </>
                                )}
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={isUploading}
                            />
                        </label>
                        <p className="mt-3 text-[0.65rem] font-bold opacity-40 uppercase tracking-widest">
                            Otomatis WebP • Max 1200×1800
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
