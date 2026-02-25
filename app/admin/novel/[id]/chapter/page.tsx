import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/admin";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteChapter } from "@/app/actions/novel-actions";

export default async function ChapterManagementPage({ params }: { params: Promise<{ id: string }> }) {
    await checkAdmin();
    const { id } = await params;

    const novel = await prisma.novel.findUnique({
        where: { id },
        include: {
            chapters: {
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!novel) notFound();

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
                        <span className="text-xs font-bold uppercase tracking-widest opacity-40">Manajemen Bab</span>
                        <h2 className="text-4xl font-extrabold mb-2 tracking-tight">{novel.title}</h2>
                        <p className="text-lg opacity-70">Kelola daftar bab dan konten untuk novel ini.</p>
                    </div>
                    <Link
                        href={`/admin/novel/${novel.id}/chapter/new`}
                        className="bg-[#3E2723] text-[#F5F5DC] px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95"
                    >
                        + Tambah Bab Baru
                    </Link>
                </header>

                <div className="bg-white/40 border border-black/5 rounded-3xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-black/5">
                                <th className="py-4 px-6 font-bold uppercase text-xs tracking-widest opacity-60">Urutan</th>
                                <th className="py-4 px-6 font-bold uppercase text-xs tracking-widest opacity-60">Judul Bab</th>
                                <th className="py-4 px-6 font-bold uppercase text-xs tracking-widest opacity-60">Update Terakhir</th>
                                <th className="py-4 px-6 text-right font-bold uppercase text-xs tracking-widest opacity-60">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {novel.chapters.map((chapter) => (
                                <tr key={chapter.id} className="hover:bg-white/40 transition-colors">
                                    <td className="py-4 px-6">
                                        <span className="text-sm font-semibold px-2 py-1 bg-black/5 rounded-md">
                                            {chapter.order}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="font-bold">{chapter.title}</p>
                                    </td>
                                    <td className="py-4 px-6 text-sm opacity-60">
                                        {new Date(chapter.updatedAt).toLocaleDateString('id-ID', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Link
                                                href={`/admin/novel/${novel.id}/chapter/${chapter.id}/edit`}
                                                className="text-xs font-bold border border-black/10 px-3 py-1.5 rounded-lg hover:bg-black/5 transition-colors"
                                            >
                                                Edit
                                            </Link>
                                            {/* We can use a client component for delete or just a link for now if we want to keep it simple, 
                                                but a server action with a form is better for no-js. 
                                                Let's stick to links for editing and simple action for delete. */}
                                            <form action={async () => {
                                                "use server";
                                                await deleteChapter(chapter.id);
                                            }}>
                                                <button
                                                    type="submit"
                                                    className="text-xs font-bold text-red-600 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                                >
                                                    Hapus
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {novel.chapters.length === 0 && (
                        <div className="p-12 text-center">
                            <p className="opacity-70">Belum ada bab untuk novel ini.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
