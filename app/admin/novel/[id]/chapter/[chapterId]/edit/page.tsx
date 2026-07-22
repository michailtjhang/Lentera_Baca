import { checkAdmin } from "@/lib/admin";
import { updateChapter } from "@/app/actions/novel-actions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminChapterForm from "@/components/admin/ChapterForm";
import { ChevronLeft, Edit3 } from "lucide-react";

export default async function EditChapterPage({
    params
}: {
    params: Promise<{ id: string; chapterId: string }>
}) {
    await checkAdmin();
    const { id, chapterId } = await params;

    const novel = await prisma.novel.findUnique({
        where: { id },
        include: { volumes: { orderBy: { order: 'asc' } } }
    });

    if (!novel) notFound();

    const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId }
    });

    if (!chapter) notFound();

    const updateChapterWithId = updateChapter.bind(null, chapterId);

    return (
        <div className="min-h-screen">
            {/* Page Header */}
            <div className="sticky top-0 z-10 bg-[#F7F3EC]/90 dark:bg-[#111]/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-6 py-4">
                <div className="flex items-center gap-4 max-w-4xl mx-auto">
                    <Link href={`/admin/novel/${id}/chapter`} className="group flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Daftar Chapter
                    </Link>
                    <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
                    <div className="flex items-center gap-2">
                        <Edit3 size={14} className="opacity-40" />
                        <h1 className="text-sm font-black tracking-tight">Edit Chapter</h1>
                    </div>
                </div>
            </div>

            <div className="p-6 lg:p-10 max-w-4xl mx-auto">
                <div className="mb-8">
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] opacity-30 mb-1">
                        Novel: {novel.title}
                    </p>
                    <h2 className="text-3xl font-black tracking-tighter mb-2">Edit Chapter #{chapter.order}</h2>
                    <p className="text-sm opacity-40 font-medium">
                        {chapter.title ? `"${chapter.title}"` : "Ubah konten atau pengaturan chapter ini."}
                    </p>
                </div>

                <AdminChapterForm
                    chapter={chapter}
                    volumes={novel.volumes}
                    action={updateChapterWithId}
                    novelType={novel.type}
                />
            </div>
        </div>
    );
}
