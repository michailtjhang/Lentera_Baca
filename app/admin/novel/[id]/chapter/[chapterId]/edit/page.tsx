import { checkAdmin } from "@/lib/admin";
import { updateChapter } from "@/app/actions/novel-actions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

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

                <form action={updateChapterWithId} className="space-y-6 bg-white/40 p-8 rounded-3xl border border-black/5">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-3 space-y-2">
                            <label htmlFor="title" className="text-sm font-bold uppercase tracking-widest opacity-60">Judul Bab</label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                required
                                defaultValue={chapter.title}
                                placeholder="Contoh: Bab 1: Pertemuan Tak Terduga"
                                className="w-full bg-white/80 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="order" className="text-sm font-bold uppercase tracking-widest opacity-60">Urutan</label>
                            <input
                                type="number"
                                name="order"
                                id="order"
                                required
                                defaultValue={chapter.order}
                                className="w-full bg-white/80 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="content" className="text-sm font-bold uppercase tracking-widest opacity-60">Isi Konten</label>
                        <textarea
                            name="content"
                            id="content"
                            required
                            rows={15}
                            defaultValue={chapter.content}
                            placeholder="Tuliskan cerita di sini..."
                            className="w-full bg-white/80 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-medium resize-none leading-relaxed"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#3E2723] text-[#F5F5DC] py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all active:scale-[0.98]"
                    >
                        Update Bab
                    </button>
                </form>
            </main>
        </div>
    );
}
