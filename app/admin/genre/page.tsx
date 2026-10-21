import { checkAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import GenreManager from "@/components/admin/GenreManager";
import { ChevronLeft, Tag } from "lucide-react";
import Link from "next/link";

export default async function GenreAdminPage() {
    await checkAdmin();

    const genres = await (prisma as any).genre.findMany({
        orderBy: { name: "asc" },
        include: {
            _count: {
                select: { novels: true }
            }
        }
    });

    return (
        <div className="min-h-screen">
            {/* Desktop Page Sticky Header */}
            <div className="sticky top-0 z-20 bg-[#F7F3EC]/90 dark:bg-[#0f0f0f]/90 backdrop-blur-xl border-b border-black/8 dark:border-white/8 px-6 lg:px-10 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/admin" 
                            className="group flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-50 hover:opacity-100 transition-opacity"
                        >
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Dashboard
                        </Link>
                        <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
                        <div className="flex items-center gap-2">
                            <Tag size={15} className="text-amber-600 dark:text-amber-400" />
                            <h1 className="text-sm font-black tracking-tight">Manajemen Genre</h1>
                        </div>
                    </div>
                    <span className="text-xs font-black px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300">
                        {genres.length} Genre Terdaftar
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 lg:p-10 max-w-7xl mx-auto">
                <div className="mb-8">
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.25em] opacity-40 mb-1">Metadata Kontrol</p>
                    <h2 className="text-3xl font-black tracking-tight mb-2">Manajemen Genre & Kategori</h2>
                    <p className="text-sm opacity-50 font-medium">
                        Kelola genre cerita untuk seluruh platform — tambah, ubah, atau hapus kategori novel.
                    </p>
                </div>

                <GenreManager initialGenres={genres} />
            </div>
        </div>
    );
}
