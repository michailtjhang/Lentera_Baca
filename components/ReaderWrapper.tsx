"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamic imports for readers with ssr: false
const PDFReader = dynamic(() => import("@/components/PDFReader"), { 
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-[#FDFCF0] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin opacity-20" />
            <p className="text-xs font-black uppercase tracking-widest opacity-40">Memuat PDF Reader...</p>
        </div>
    )
});

const EPUBReader = dynamic(() => import("@/components/EPUBReader"), { 
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-[#FDFCF0] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin opacity-20" />
            <p className="text-xs font-black uppercase tracking-widest opacity-40">Memuat EPUB Reader...</p>
        </div>
    )
});

interface ReaderWrapperProps {
    fileUrl: string;
    fileType: string;
    title: string;
}

export default function ReaderWrapper({ fileUrl, fileType, title }: ReaderWrapperProps) {
    if (fileType === "PDF") {
        return <PDFReader fileUrl={fileUrl} title={title} />;
    }
    return <EPUBReader fileUrl={fileUrl} title={title} />;
}
