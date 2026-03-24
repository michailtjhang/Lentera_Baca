"use client";

import { FileText, Download, ExternalLink } from "lucide-react";

interface Volume {
    id: string;
    title: string;
    fileUrl: string;
    fileType: "PDF" | "EPUB";
    order: number;
}

interface VolumeListProps {
    volumes: Volume[];
}

export default function VolumeList({ volumes }: VolumeListProps) {
    if (volumes.length === 0) {
        return (
            <div className="bg-black/5 dark:bg-white/5 rounded-[2rem] p-12 text-center">
                <p className="text-sm font-black uppercase tracking-widest opacity-20">Belum ada volume tersedia.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {volumes.map((vol) => (
                <div key={vol.id} className="group bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/5 p-6 rounded-[2rem] hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#3E2723] text-[#F5F5DC] rounded-2xl flex items-center justify-center font-black">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h4 className="font-black tracking-tight">{vol.title}</h4>
                            <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] opacity-30">{vol.fileType}</span>
                        </div>
                    </div>
                    <a
                        href={vol.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-black/5 dark:bg-white/10 rounded-2xl hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                    >
                        <Download size={18} />
                    </a>
                </div>
            ))}
        </div>
    );
}
