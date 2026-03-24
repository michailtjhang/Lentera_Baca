import { checkAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import GenreManager from "@/components/admin/GenreManager";

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
        <div className="p-8 lg:p-12">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="h-px w-8 bg-[#3E2723]/20" />
                    <span className="text-[0.65rem] font-black uppercase tracking-[0.4em] text-[#3E2723]/40">Metadata Control</span>
                </div>
                <h2 className="text-4xl font-black mb-3 tracking-tight text-[#3E2723]">Manajemen Genre</h2>
                <p className="text-lg text-[#3E2723]/30 font-bold">Kelola kategori cerita untuk seluruh platform novel Anda.</p>
            </header>

            <GenreManager initialGenres={genres} />
        </div>
    );
}
