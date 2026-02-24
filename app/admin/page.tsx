import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/admin";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default async function AdminDashboard() {
    await checkAdmin();

    const novels = await prisma.novel.findMany({
        include: {
            _count: {
                select: { chapters: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="min-h-screen bg-[#F5F5DC] text-[#3E2723]">
            <nav className="border-b border-black/5 px-6 py-4 backdrop-blur-sm sticky top-0 bg-white/50 z-50">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold tracking-tight">Lentera Baca <span className="text-xs bg-black text-white px-2 py-0.5 rounded ml-2">ADMIN</span></Link>
                    <UserButton />
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-extrabold mb-2 tracking-tight">Admin Dashboard</h2>
                        <p className="text-lg opacity-70">Kelola koleksi novel dan bab.</p>
                    </div>
                    <Link
                        href="/admin/novel/new"
                        className="bg-[#3E2723] text-[#F5F5DC] px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95"
                    >
                        + Tambah Novel
                    </Link>
                </header>

                <div className="grid grid-cols-1 gap-4">
                    {novels.map((novel: any) => (
                        <div
                            key={novel.id}
                            className="bg-white/60 border border-black/5 p-6 rounded-2xl flex justify-between items-center"
                        >
                            <div>
                                <h3 className="text-xl font-bold mb-1">{novel.title}</h3>
                                <p className="text-sm opacity-60 italic mb-1">Oleh {novel.author}</p>
                                <p className="text-xs opacity-70 mb-1">slug: <code className="bg-white/20 px-1 rounded">{novel.slug}</code></p>
                                {novel.status && (
                                    <span className="text-xs font-bold uppercase px-2 py-1 rounded-full bg-[#3E2723]/20 text-[#3E2723]">
                                        {novel.status.toLowerCase().replace(/_/g, '-')}
                                    </span>
                                )}
                                <span className="text-xs font-semibold px-2 py-1 bg-black/5 rounded-full">
                                    {novel._count.chapters} Bab
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <Link
                                    href={`/admin/novel/${novel.id}/chapter/new`}
                                    className="text-sm font-bold border border-black/10 px-4 py-2 rounded-lg hover:bg-black/5 transition-colors"
                                >
                                    + Tambah Bab
                                </Link>
                                <Link
                                    href={`/novel/${novel.slug}`}
                                    className="text-sm font-bold border border-black/10 px-4 py-2 rounded-lg hover:bg-black/5 transition-colors"
                                >
                                    Lihat
                                </Link>
                            </div>
                        </div>
                    ))}

                    {novels.length === 0 && (
                        <div className="text-center py-12 opacity-40 italic">
                            Belum ada novel. Klik "+ Tambah Novel" untuk memulai.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
