import { checkAdmin } from "@/lib/admin";
import { updateChapter } from "@/app/actions/novel-actions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminChapterForm from "@/components/admin/ChapterForm";

export default async function EditChapterPage({
    params
}: {
    params: Promise<{ id: string; chapterId: string }>
}) {
    await checkAdmin();
    const { id, chapterId } = await params;

    const novel = await prisma.novel.findUnique({
        where: { id }
    });

    if (!novel) notFound();

    const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId }
    });

    if (!chapter) notFound();

    const updateChapterWithId = updateChapter.bind(null, chapterId);

    return (
        <div className="min-h-screen bg-[#F5F5DC] text-[#3E2723]">
            <nav className="border-b border-black/5 px-6 py-4 backdrop-blur-sm sticky top-0 bg-white/50 z-50">
                <div className="max-w-2xl mx-auto flex justify-between items-center">
                    <Link href={`/admin/novel/${id}/chapter`} className="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity">← Kembali ke Daftar Bab</Link>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-6 py-12">
                <header className="mb-8">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-40">Novel: {novel.title}</span>
                    <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Edit Bab</h2>
                    <p className="opacity-70">Ubah judul, urutan, atau isi konten untuk bab ini.</p>
                </header>

                <AdminChapterForm
                    chapter={chapter}
                    action={updateChapterWithId}
                />
            </main>
        </div>
    );
}
