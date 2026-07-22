import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/admin";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NovelType } from "@prisma/client";
import AdminChapterList from "@/components/admin/AdminChapterList";
import { ChevronLeft, List, Plus } from "lucide-react";

export default async function ChapterManagementPage({ params }: { params: Promise<{ id: string }> }) {
    await checkAdmin();
    const { id } = await params;

    const novel = await prisma.novel.findUnique({
        where: { id },
        include: {
            volumes: { orderBy: { order: 'asc' } },
            chapters: {
                orderBy: { order: 'asc' },
                include: { volume: true }
            }
        }
    });

    if (!novel) notFound();

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
                        <Link href={`/admin/novel/${novel.id}/edit`} className="text-[0.65rem] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity truncate max-w-[150px]">
                            {novel.title}
                        </Link>
                        <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
                        <div className="flex items-center gap-2">
                            <List size={14} className="opacity-40" />
                            <h1 className="text-sm font-black tracking-tight">Chapter</h1>
                        </div>
                    </div>
                    <Link
                        href={`/admin/novel/${novel.id}/chapter/new`}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl font-black text-[0.7rem] uppercase tracking-wider hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all shadow-md shadow-amber-700/20"
                    >
                        <Plus size={14} />
                        Tambah Chapter
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 lg:p-10 max-w-7xl mx-auto">
                <div className="mb-8">
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] opacity-30 mb-1">Manajemen Chapter</p>
                    <h2 className="text-3xl font-black tracking-tighter mb-2">{novel.title}</h2>
                    <p className="text-sm opacity-40 font-medium">
                        {novel.chapters.length} chapter tersedia — kelola urutan dan konten chapter.
                    </p>
                </div>

                <AdminChapterList
                    novel={{ id: novel.id, title: novel.title, type: novel.type }}
                    chapters={novel.chapters as any}
                    volumes={novel.volumes as any}
                />
            </div>
        </div>
    );
}
