"use client";

import BaseNovelForm from "../BaseNovelForm";
import { NovelType } from "@prisma/client";

export default function LightNovelForm(props: any) {
    return (
        <div className="space-y-6">
            <header className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#3E2723] text-[#F5F5DC] rounded-2xl flex items-center justify-center shadow-lg shadow-[#3E2723]/20">
                    <span className="font-black text-xl">L</span>
                </div>
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Light Novel Management</h2>
                    <p className="text-sm opacity-50 font-bold uppercase tracking-widest">Struktur berbasis Volume & Grouping</p>
                </div>
            </header>
            <BaseNovelForm {...props} />
        </div>
    );
}
