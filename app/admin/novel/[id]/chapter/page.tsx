import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/admin";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteChapter } from "@/app/actions/novel-actions";
import { NovelType } from "@prisma/client";
import AdminChapterList from "@/components/admin/AdminChapterList";

export default async function ChapterManagementPage({ params }: { params: Promise<{ id: string }> }) {
    await checkAdmin();
    const { id } = await params;

    const novel = await prisma.novel.findUnique({
        where: { id },
        include: {
            chapters: {
                orderBy: { order: 'asc' },
                include: { volume: true }
            }
        }
    });

    if (!novel) notFound();

    const typeLabels: Record<string, string> = {
        STORY: "📖 Cerita",
        ILLUSTRATION: "🎨 Ilustrasi",
        EPILOGUE: "🔚 Epilog",
        SIDESTORY: "🌟 Side Story",
    };

    return (
        <div className="min-h-screen bg-[#F5F5DC] text-[#3E2723]">
            <nav className="border-b border-black/5 px-6 py-4 backdrop-blur-sm sticky top-0 bg-white/50 z-50">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <Link href="/admin" className="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity">← Kembali ke Dashboard</Link>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-12">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest opacity-40">Manajemen Chapter</span>
                        <h2 className="text-4xl font-extrabold mb-2 tracking-tight">{novel.title}</h2>
                        <p className="text-lg opacity-70">Kelola daftar chapter dan konten untuk novel ini.</p>
                    </div>
                    <Link
                        href={`/admin/novel/${novel.id}/chapter/new`}
                        className="bg-[#3E2723] text-[#F5F5DC] px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95"
                    >
                        + Tambah Chapter Baru
                    </Link>
                </header>

                <AdminChapterList
                    novel={{ id: novel.id, title: novel.title, type: novel.type }}
                    chapters={novel.chapters as any}
                />
            </main>
        </div >
    );
}
