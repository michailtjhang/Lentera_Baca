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
            {/* Page Header */}
            <div className="sticky top-0 z-10 bg-[#F7F3EC]/90 dark:bg-[#111]/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-6 lg:px-10 py-4">
                <div className="flex items-center gap-4 max-w-7xl mx-auto">
                    <Link href="/admin" className="group flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Dashboard
                    </Link>
                    <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
                    <div className="flex items-center gap-2">
                        <Tag size={14} className="opacity-40" />
                        <h1 className="text-sm font-black tracking-tight">Manajemen Genre</h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 lg:p-10 max-w-7xl mx-auto">
                <div className="mb-8">
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] opacity-30 mb-1">Metadata Control</p>
                    <h2 className="text-3xl font-black tracking-tighter mb-2">Manajemen Genre</h2>
                    <p className="text-sm opacity-40 font-medium">
                        Kelola kategori cerita untuk seluruh platform — <span className="font-black opacity-80">{genres.length} genre</span> tersedia.
                    </p>
                </div>

                <GenreManager initialGenres={genres} />
            </div>
        </div>
    );
}
