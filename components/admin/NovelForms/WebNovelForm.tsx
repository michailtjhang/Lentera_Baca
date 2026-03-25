"use client";

import BaseNovelForm from "../BaseNovelForm";
import { NovelType } from "@prisma/client";

export default function WebNovelForm(props: any) {
    return (
        <div className="space-y-6">
            <header className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <span className="font-black text-xl">W</span>
                </div>
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Web Novel Management</h2>
                    <p className="text-sm opacity-50 font-bold uppercase tracking-widest">Fokus pada chapter demi chapter</p>
                </div>
            </header>
            <BaseNovelForm {...props} isLightNovel={false} />
        </div>
    );
}
