import { checkAdmin } from "@/lib/admin";
import { createChapter } from "@/app/actions/novel-actions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function NewChapterPage({ params }: { params: { id: string } }) {
    await checkAdmin();
    const { id } = await params;

    const novel = await prisma.novel.findUnique({
        where: { id }
    });

    if (!novel) notFound();

    // Get the highest order to suggest the next one
    const lastChapter = await prisma.chapter.findFirst({
        where: { novelId: id },
        orderBy: { order: 'desc' }
    });
    const nextOrder = (lastChapter?.order || 0) + 1;

    const createChapterWithId = createChapter.bind(null, id);

    return (
        <div className="min-h-screen bg-[#F5F5DC] text-[#3E2723]">
            <nav className="border-b border-black/5 px-6 py-4 backdrop-blur-sm sticky top-0 bg-white/50 z-50">
                <div className="max-w-2xl mx-auto flex justify-between items-center">
                    <Link href="/admin" className="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity">← Kembali ke Dashboard</Link>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-6 py-12">
                <header className="mb-8">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-40">Novel: {novel.title}</span>
                    <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Tambah Bab Baru</h2>
                    <p className="opacity-70">Tambahkan konten cerita untuk bab selanjutnya.</p>
                </header>

                <form action={createChapterWithId} className="space-y-6 bg-white/40 p-8 rounded-3xl border border-black/5">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-3 space-y-2">
                            <label htmlFor="title" className="text-sm font-bold uppercase tracking-widest opacity-60">Judul Bab</label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                required
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
                                defaultValue={nextOrder}
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
                            placeholder="Tuliskan cerita di sini..."
                            className="w-full bg-white/80 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-medium resize-none leading-relaxed"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#3E2723] text-[#F5F5DC] py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all active:scale-[0.98]"
                    >
                        Simpan Bab
                    </button>
                </form>
            </main>
        </div>
    );
}
