import { checkAdmin } from "@/lib/admin";
import { createChapter } from "@/app/actions/novel-actions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminChapterForm from "@/components/admin/ChapterForm";
import { ChevronLeft, Plus } from "lucide-react";

export default async function NewChapterPage({ params }: { params: Promise<{ id: string }> }) {
    await checkAdmin();
    const { id } = await params;

    const novel = await prisma.novel.findUnique({
        where: { id },
        include: { volumes: { orderBy: { order: 'asc' } } }
    });

    if (!novel) notFound();

    const lastChapter = await prisma.chapter.findFirst({
        where: { novelId: id },
        orderBy: { order: 'desc' }
    });
    const nextOrder = (lastChapter?.order || 0) + 1;

    const createChapterWithId = createChapter.bind(null, id);

    return (
        <div className="min-h-screen">
            {/* Page Header */}
            <div className="sticky top-0 z-20 bg-[#F7F3EC]/90 dark:bg-[#111]/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-6 py-3.5">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div className="flex items-center gap-4">
                        <Link href={`/admin/novel/${id}/chapter`} className="group flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Daftar Chapter
                        </Link>
                        <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
                        <div className="flex items-center gap-2">
                            <Plus size={14} className="opacity-40" />
                            <h1 className="text-sm font-black tracking-tight">Chapter #{nextOrder} Baru</h1>
                        </div>
                    </div>

                    <button
                        type="submit"
                        form="chapter-form"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md shadow-amber-900/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                        <Plus size={14} />
                        <span>Simpan Chapter</span>
                    </button>
                </div>
            </div>

            <div className="p-6 lg:p-10 max-w-4xl mx-auto">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/5">
                    <div>
                        <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] opacity-30 mb-1">
                            Novel: {novel.title}
                        </p>
                        <h2 className="text-3xl font-black tracking-tighter mb-2">Tambah Chapter Baru</h2>
                        <p className="text-sm opacity-40 font-medium">Chapter #{nextOrder} — tambahkan konten cerita untuk chapter ini.</p>
                    </div>

                    <button
                        type="submit"
                        form="chapter-form"
                        className="self-start sm:self-auto inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-700/25 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                        <Plus size={16} />
                        <span>Simpan Chapter</span>
                    </button>
                </div>

                <AdminChapterForm
                    action={createChapterWithId}
                    chapter={{ order: nextOrder }}
                    volumes={novel.volumes}
                    novelType={novel.type}
                />
            </div>
        </div>
    );
}
