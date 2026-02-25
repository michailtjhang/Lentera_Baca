import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/admin";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Plus, BookOpen, Clock, Layers, ExternalLink, Settings } from "lucide-react";

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
        ONGOING: "bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20",
        COMPLETE: "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20",
        DROP: "bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20",
        HIATUS: "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20",
    };

    return (
        <div className="min-h-screen bg-[#FDFCF0] text-[#1A1A1A]">
            <nav className="border-b border-black/[0.03] px-8 py-5 backdrop-blur-xl sticky top-0 bg-white/70 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-2xl font-black tracking-tighter hover:opacity-70 transition-opacity">
                            Lentera Baca <span className="text-[0.6rem] bg-black text-white px-2 py-1 rounded ml-2 align-middle tracking-widest font-bold">ADMIN</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-6">
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-8 py-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
                    <div>
                        <h2 className="text-5xl font-black tracking-tighter mb-4 pr-10">Control Center.</h2>
                        <p className="text-lg text-black/40 font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                            <Layers size={18} />
                            Manage <span className="text-black font-black">{novels.length}</span> Active Collections
                        </p>
                    </div>
                    <Link
                        href="/admin/novel/new"
                        className="group flex items-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-black/10"
                    >
                        <Plus size={20} className="transition-transform group-hover:rotate-90" />
                        Tambah Novel
                    </Link>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {novels.map((novel: any) => (
                        <div key={novel.id} className="group bg-white/60 border border-black/[0.03] p-6 rounded-[2.5rem] hover:bg-white hover:shadow-2xl hover:shadow-black/[0.04] transition-all duration-500">
                            <div className="flex flex-col lg:flex-row items-center gap-8">
                                {/* Short Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-4 mb-3">
                                        <span className={`text-[0.6rem] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${statusColors[novel.status]}`}>
                                            {statusLabel[novel.status]}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-black/30">
                                            <BookOpen size={14} />
                                            <span className="text-xs font-black uppercase tracking-widest">{novel._count.chapters} Bab</span>
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black tracking-tight mb-2 group-hover:text-black transition-colors truncate">
                                        {novel.title}
                                    </h3>
                                    <p className="text-sm font-bold text-black/40 uppercase tracking-widest">Oleh {novel.author}</p>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex flex-wrap justify-center gap-3">
                                    <Link
                                        href={`/admin/novel/${novel.id}/edit`}
                                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white border border-black/5 px-6 py-3.5 rounded-2xl hover:bg-black hover:text-white transition-all shadow-sm"
                                    >
                                        <Settings size={14} />
                                        Update
                                    </Link>
                                    <Link
                                        href={`/admin/novel/${novel.id}/chapter`}
                                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white border border-black/5 px-6 py-3.5 rounded-2xl hover:bg-black hover:text-white transition-all shadow-sm"
                                    >
                                        <Layers size={14} />
                                        Chapters
                                    </Link>
                                    <Link
                                        href={`/novel/${novel.slug}`}
                                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-black text-white px-6 py-3.5 rounded-2xl hover:opacity-70 transition-all shadow-xl shadow-black/5"
                                    >
                                        <ExternalLink size={14} />
                                        Preview
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {novels.length === 0 && (
                    <div className="bg-white/40 border-2 border-dashed border-black/[0.05] rounded-[3rem] p-24 text-center mt-8">
                        <Plus className="mx-auto mb-6 text-black/10" size={64} />
                        <p className="text-black/40 font-black uppercase tracking-widest text-sm">Belum ada novel dalam koleksi.</p>
                        <Link href="/admin/novel/new" className="text-black font-black underline underline-offset-8 decoration-2 hover:opacity-60 transition-opacity mt-4 inline-block">Mulai menulis sekarang →</Link>
                    </div>
                )}
            </main>
        </div>
    );
}
