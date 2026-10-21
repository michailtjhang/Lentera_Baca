import { checkAdmin } from "@/lib/admin";
import { createNovel } from "@/app/actions/novel-actions";
import { prisma } from "@/lib/prisma";
import WebNovelForm from "@/components/admin/NovelForms/WebNovelForm";
import LightNovelForm from "@/components/admin/NovelForms/LightNovelForm";
import Link from "next/link";
import { ChevronLeft, PlusCircle, BookOpen, Layers } from "lucide-react";

export default async function NewNovelPage({
    searchParams
}: {
    searchParams: Promise<{ type?: string }>
}) {
    await checkAdmin();
    const { type } = await searchParams;
    const isLightNovel = type === "lightnovel";

    const [existingTags, genres] = await Promise.all([
        (prisma as any).tag.findMany({ select: { name: true } }),
        (prisma as any).genre.findMany({ select: { name: true }, orderBy: { name: "asc" } })
    ]);

    const tagSuggestions = existingTags.map((t: { name: string }) => t.name);
    const genreSuggestions = genres.map((g: { name: string }) => g.name);

    return (
        <div className="min-h-screen">
            {/* Desktop Page Sticky Header */}
            <div className="sticky top-0 z-20 bg-[#F7F3EC]/90 dark:bg-[#0f0f0f]/90 backdrop-blur-xl border-b border-black/8 dark:border-white/8 px-6 lg:px-10 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/admin" 
                            className="group flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-50 hover:opacity-100 transition-opacity"
                        >
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Dashboard
                        </Link>
                        <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
                        <div className="flex items-center gap-2">
                            <PlusCircle size={15} className="text-amber-600 dark:text-amber-400" />
                            <h1 className="text-sm font-black tracking-tight">Tambah Novel Baru</h1>
                        </div>
                    </div>

                    {/* Format Type switcher */}
                    <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                        <Link
                            href="/admin/novel/new"
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                !isLightNovel 
                                    ? "bg-amber-600 text-white shadow-sm" 
                                    : "opacity-50 hover:opacity-100 text-[#3E2723] dark:text-white"
                            }`}
                        >
                            <BookOpen size={13} />
                            <span>Web Novel</span>
                        </Link>
                        <Link
                            href="/admin/novel/new?type=lightnovel"
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                isLightNovel 
                                    ? "bg-amber-600 text-white shadow-sm" 
                                    : "opacity-50 hover:opacity-100 text-[#3E2723] dark:text-white"
                            }`}
                        >
                            <Layers size={13} />
                            <span>Light Novel</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="p-6 lg:p-10 max-w-7xl mx-auto">
                <div className="mb-8">
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.25em] opacity-40 mb-1">
                        {isLightNovel ? "Format: Light Novel" : "Format: Web Novel"}
                    </p>
                    <h2 className="text-3xl font-black tracking-tight text-[#2B1810] dark:text-white">
                        {isLightNovel ? "Terbitkan Light Novel Baru" : "Terbitkan Web Novel Baru"}
                    </h2>
                    <p className="text-sm opacity-50 mt-1 font-medium">
                        Lengkapi informasi cerita, penulis, volume, genre, dan sampul novel di bawah ini.
                    </p>
                </div>

                {isLightNovel ? (
                    <LightNovelForm
                        action={createNovel}
                        tagSuggestions={tagSuggestions}
                        predefinedGenres={genreSuggestions}
                        mode="create"
                        isLightNovel={true}
                    />
                ) : (
                    <WebNovelForm
                        action={createNovel}
                        tagSuggestions={tagSuggestions}
                        predefinedGenres={genreSuggestions}
                        mode="create"
                    />
                )}
            </div>
        </div>
    );
}
