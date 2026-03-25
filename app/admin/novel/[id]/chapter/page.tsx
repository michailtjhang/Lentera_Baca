import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/admin";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteChapter } from "@/app/actions/novel-actions";
import { NovelType } from "@prisma/client";

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
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <Link href="/admin" className="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity">← Kembali ke Dashboard</Link>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12">
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

                <div className="bg-white/40 border border-black/5 rounded-3xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-black/5">
                                <th className="py-4 px-6 font-bold uppercase text-xs tracking-widest opacity-60">Urutan</th>
                                <th className="py-4 px-6 font-bold uppercase text-xs tracking-widest opacity-60">Tipe</th>
                                <th className="py-4 px-6 font-bold uppercase text-xs tracking-widest opacity-60">Volume</th>
                                <th className="py-4 px-6 font-bold uppercase text-xs tracking-widest opacity-60">Judul Chapter</th>
                                <th className="py-4 px-6 font-bold uppercase text-xs tracking-widest opacity-60">Update</th>
                                <th className="py-4 px-6 text-right font-bold uppercase text-xs tracking-widest opacity-60">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {novel.type === ("LIGHTNOVEL" as any) ? (
                                // Grouped view for Light Novels
                                novel.chapters.reduce((acc: any[], chapter: any) => {
                                    const lastVol = acc[acc.length - 1]?.volumeId;
                                    if (chapter.volumeId !== lastVol) {
                                        acc.push({ isHeader: true, volume: chapter.volume, volumeId: chapter.volumeId });
                                    }
                                    acc.push(chapter);
                                    return acc;
                                }, []).map((item, idx) => (
                                    item.isHeader ? (
                                        <tr key={`header-${idx}`} className="bg-black/5">
                                            <td colSpan={6} className="py-3 px-6">
                                                <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#3E2723]/40">
                                                    📦 {item.volume?.title || "Tanpa Volume"}
                                                </span>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr key={item.id} className="hover:bg-white/40 transition-colors">
                                            <td className="py-4 px-6">
                                                <span className="text-xs font-bold px-2 py-1 bg-black/5 rounded-md">
                                                    {item.order}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-xs font-bold opacity-70 whitespace-nowrap">
                                                    {typeLabels[item.type] || item.type}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-xs font-bold opacity-40 italic">Linked</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="text-sm font-bold">{item.title || `Chapter ${item.order}`}</p>
                                            </td>
                                            <td className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest opacity-30">
                                                {new Date(item.updatedAt).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Link
                                                        href={`/admin/novel/${novel.id}/chapter/${item.id}/edit`}
                                                        className="text-[0.65rem] font-black uppercase tracking-widest border border-black/10 px-4 py-2 rounded-xl hover:bg-black hover:text-white transition-all"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <form action={async () => {
                                                        "use server";
                                                        await deleteChapter(item.id);
                                                    }}>
                                                        <button
                                                            type="submit"
                                                            className="text-[0.65rem] font-black uppercase tracking-widest text-red-600 border border-red-100 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </form>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                ))
                            ) : (
                                // Standard view for Web Novels
                                novel.chapters.map((chapter) => (
                                    <tr key={chapter.id} className="hover:bg-white/40 transition-colors">
                                        <td className="py-4 px-6">
                                            <span className="text-xs font-bold px-2 py-1 bg-black/5 rounded-md">
                                                {chapter.order}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-xs font-bold opacity-70 whitespace-nowrap">
                                                {typeLabels[chapter.type] || chapter.type}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-xs font-bold opacity-20 italic">-</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-sm font-bold">{chapter.title || `Chapter ${chapter.order}`}</p>
                                        </td>
                                        <td className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest opacity-30">
                                            {new Date(chapter.updatedAt).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Link
                                                    href={`/admin/novel/${novel.id}/chapter/${chapter.id}/edit`}
                                                    className="text-[0.65rem] font-black uppercase tracking-widest border border-black/10 px-4 py-2 rounded-xl hover:bg-black hover:text-white transition-all"
                                                >
                                                    Edit
                                                </Link>
                                                <form action={async () => {
                                                    "use server";
                                                    await deleteChapter(chapter.id);
                                                }}>
                                                    <button
                                                        type="submit"
                                                        className="text-[0.65rem] font-black uppercase tracking-widest text-red-600 border border-red-100 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                                    >
                                                        Hapus
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {novel.chapters.length === 0 && (
                        <div className="p-12 text-center">
                            <p className="opacity-70">Belum ada chapter untuk novel ini.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
