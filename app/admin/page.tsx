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

    const statusLabel: Record<string, string> = {
        ONGOING: "On-going",
        COMPLETE: "Complete",
        DROP: "Drop",
        HIATUS: "Hiatus",
    };

    const statusColors: Record<string, string> = {
        ONGOING: "bg-blue-100 text-blue-800",
        COMPLETE: "bg-green-100 text-green-800",
        DROP: "bg-red-100 text-red-800",
        HIATUS: "bg-yellow-100 text-yellow-800",
    };

    return (
        <div className="min-h-screen bg-[#F5F5DC] text-[#3E2723]">
            <nav className="border-b border-black/5 px-6 py-4 backdrop-blur-sm sticky top-0 bg-white/50 z-50">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold tracking-tight">Lentera Baca <span className="text-xs bg-black text-white px-2 py-0.5 rounded ml-2">ADMIN</span></Link>
                    <UserButton />
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-12">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-extrabold mb-2 tracking-tight">Admin Dashboard</h2>
                        <p className="text-lg opacity-70">Kelola koleksi novel dan bab. Total: <strong>{novels.length}</strong> novel</p>
                    </div>
                    <Link
                        href="/admin/novel/new"
                        className="bg-[#3E2723] text-[#F5F5DC] px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95"
                    >
                        + Tambah Novel
                    </Link>
                </header>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-black/5">
                                <th className="text-left py-4 px-4 font-bold uppercase text-xs tracking-widest opacity-60">Novel</th>
                                <th className="text-left py-4 px-4 font-bold uppercase text-xs tracking-widest opacity-60">Penulis</th>
                                <th className="text-left py-4 px-4 font-bold uppercase text-xs tracking-widest opacity-60">Status</th>
                                <th className="text-left py-4 px-4 font-bold uppercase text-xs tracking-widest opacity-60">Chapter</th>
                                <th className="text-right py-4 px-4 font-bold uppercase text-xs tracking-widest opacity-60">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {novels.map((novel: any) => (
                                <tr key={novel.id} className="border-b border-black/5 hover:bg-white/40 transition-colors">
                                    <td className="py-4 px-4">
                                        <div>
                                            <p className="font-bold">{novel.title}</p>
                                            <p className="text-xs opacity-60 mt-1">slug: <code>{novel.slug}</code></p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 opacity-70">{novel.author}</td>
                                    <td className="py-4 px-4">
                                        <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${statusColors[novel.status] || 'bg-gray-100 text-gray-800'}`}>
                                            {statusLabel[novel.status]}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-sm font-semibold px-3 py-1 bg-black/5 rounded-full">
                                            {novel._count.chapters}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Link
                                                href={`/admin/novel/${novel.id}/edit`}
                                                className="text-sm font-bold border border-black/10 px-3 py-1.5 rounded-lg hover:bg-black/5 transition-colors"
                                            >
                                                Edit
                                            </Link>
                                            <Link
                                                href={`/admin/novel/${novel.id}/chapter/new`}
                                                className="text-sm font-bold border border-black/10 px-3 py-1.5 rounded-lg hover:bg-black/5 transition-colors"
                                            >
                                                + Bab
                                            </Link>
                                            <Link
                                                href={`/novel/${novel.slug}`}
                                                className="text-sm font-bold bg-[#3E2723] text-[#F5F5DC] px-3 py-1.5 rounded-lg hover:shadow-md transition-all"
                                            >
                                                View
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {novels.length === 0 && (
                    <div className="bg-white/40 border border-black/5 rounded-2xl p-12 text-center mt-8">
                        <p className="opacity-70 mb-4">Belum ada novel. Klik "+ Tambah Novel" untuk memulai.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
