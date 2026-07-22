import { checkAdmin } from "@/lib/admin";
import { updateNovel } from "@/app/actions/novel-actions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import WebNovelForm from "@/components/admin/NovelForms/WebNovelForm";
import LightNovelForm from "@/components/admin/NovelForms/LightNovelForm";
import { ChevronLeft, Edit3, ExternalLink } from "lucide-react";

export default async function EditNovelPage({ params }: { params: Promise<{ id: string }> }) {
    await checkAdmin();
    const { id } = await params;

    const novel = await prisma.novel.findUnique({
        where: { id },
        include: {
            genres: true,
            tags: true,
            volumes: { orderBy: { order: "asc" } }
        }
    });

    if (!novel) {
        return notFound();
    }

    const [existingTags, genres] = await Promise.all([
        (prisma as any).tag.findMany({ select: { name: true } }),
        (prisma as any).genre.findMany({ select: { name: true }, orderBy: { name: "asc" } })
    ]);

    const tagSuggestions = existingTags.map((t: { name: string }) => t.name);
    const genreSuggestions = genres.map((g: { name: string }) => g.name);

    const updateNovelWithId = updateNovel.bind(null, id);

    const typeLabel = novel.type === "WEB" ? "Web Novel" : 
                      novel.type === "LIGHTNOVEL_WEB" ? "Light Novel (Web)" :
                      novel.type === "LIGHTNOVEL_PDF" ? "Light Novel (PDF)" : "EPUB";

    return (
        <div className="min-h-screen">
            {/* Page Header */}
            <div className="sticky top-0 z-10 bg-[#F7F3EC]/90 dark:bg-[#111]/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-6 lg:px-10 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="group flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Dashboard
                        </Link>
                        <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
                        <div className="flex items-center gap-2">
                            <Edit3 size={14} className="opacity-40" />
                            <h1 className="text-sm font-black tracking-tight truncate max-w-xs">
                                Edit: {novel.title}
                            </h1>
                        </div>
                    </div>

                    <Link
                        href={`/novel/${novel.slug}`}
                        target="_blank"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[0.65rem] font-black uppercase tracking-wider bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-60 hover:opacity-100"
                    >
                        <ExternalLink size={12} />
                        Lihat Novel
                    </Link>
                </div>
            </div>

            {/* Form Content */}
            <div className="p-6 lg:p-10 max-w-7xl mx-auto">
                <div className="mb-8">
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] opacity-30 mb-1">
                        {typeLabel} · Edit Mode
                    </p>
                    <h2 className="text-3xl font-black tracking-tighter mb-2">Edit Novel</h2>
                    <p className="text-sm opacity-40 font-medium">
                        Perbarui informasi untuk{" "}
                        <span className="font-black opacity-100 italic">{novel.title}</span>
                    </p>
                </div>

                {novel.type === "WEB" ? (
                    <WebNovelForm
                        novel={novel}
                        action={updateNovelWithId}
                        tagSuggestions={tagSuggestions}
                        predefinedGenres={genreSuggestions}
                        mode="edit"
                    />
                ) : (
                    <LightNovelForm
                        novel={novel}
                        action={updateNovelWithId}
                        tagSuggestions={tagSuggestions}
                        predefinedGenres={genreSuggestions}
                        mode="edit"
                        isLightNovel={novel.type === "LIGHTNOVEL_WEB"}
                    />
                )}
            </div>
        </div>
    );
}
