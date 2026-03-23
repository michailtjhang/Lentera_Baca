"use client";

import { useState } from "react";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";
import { FileText, Image, CheckCircle, X } from "lucide-react";

interface LNUploaderProps {
    onFileUploaded: (url: string) => void;
    onCoverUploaded: (url: string) => void;
    currentFileUrl?: string;
    currentCoverUrl?: string;
}

export default function LNUploader({
    onFileUploaded,
    onCoverUploaded,
    currentFileUrl,
    currentCoverUrl,
}: LNUploaderProps) {
    const [fileUrl, setFileUrl] = useState(currentFileUrl || "");
    const [coverUrl, setCoverUrl] = useState(currentCoverUrl || "");
    const [fileUploading, setFileUploading] = useState(false);
    const [coverUploading, setCoverUploading] = useState(false);

    return (
        <div className="space-y-5">
            {/* Cover Image Upload */}
            <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest opacity-50">
                    Cover Image
                </label>
                <div className="border border-black/10 rounded-2xl p-4 bg-white/50 space-y-3">
                    {coverUrl ? (
                        <div className="flex items-center gap-3">
                            <img src={coverUrl} alt="cover" className="w-12 h-16 object-cover rounded-lg shadow" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <CheckCircle size={16} />
                                    <span className="text-sm font-bold">Cover terupload</span>
                                </div>
                                <p className="text-xs text-black/40 truncate">{coverUrl}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setCoverUrl(""); onCoverUploaded(""); }}
                                className="p-1.5 rounded-full hover:bg-red-50 text-red-400 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <Image size={32} className="text-black/20" />
                            <UploadButton<OurFileRouter, "coverUploader">
                                endpoint="coverUploader"
                                onUploadBegin={() => setCoverUploading(true)}
                                onClientUploadComplete={(res) => {
                                    const url = res[0]?.url ?? "";
                                    setCoverUrl(url);
                                    onCoverUploaded(url);
                                    setCoverUploading(false);
                                }}
                                onUploadError={() => setCoverUploading(false)}
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
                                content={{
                                    button: coverUploading ? "Uploading..." : "Upload Cover",
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Novel File Upload */}
            <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest opacity-50">
                    File Novel <span className="text-black/30">(PDF utama · EPUB didukung · max 100MB)</span>
                </label>
                <div className="border border-black/10 rounded-2xl p-4 bg-white/50 space-y-3">
                    {fileUrl ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center">
                                <FileText size={20} className="text-black/60" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <CheckCircle size={16} />
                                    <span className="text-sm font-bold">File terupload</span>
                                </div>
                                <p className="text-xs text-black/40 truncate">{fileUrl}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setFileUrl(""); onFileUploaded(""); }}
                                className="p-1.5 rounded-full hover:bg-red-50 text-red-400 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <FileText size={32} className="text-black/20" />
                            <UploadButton<OurFileRouter, "lightNovelUploader">
                                endpoint="lightNovelUploader"
                                onUploadBegin={() => setFileUploading(true)}
                                onClientUploadComplete={(res) => {
                                    const url = res[0]?.url ?? "";
                                    setFileUrl(url);
                                    onFileUploaded(url);
                                    setFileUploading(false);
                                }}
                                onUploadError={() => setFileUploading(false)}
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
                                content={{
                                    button: fileUploading ? "Uploading..." : "Upload PDF / EPUB",
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
