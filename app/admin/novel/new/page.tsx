import { checkAdmin } from "@/lib/admin";
import { createNovel } from "@/app/actions/novel-actions";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminNovelForm from "@/components/admin/NovelForm";

const PREDEFINED_GENRES = [
    "Action", "Adventure", "Adult", "Comedy", "Drama", "Ecchi",
    "Fan-Fiction", "Fantasy", "Game", "Gender-Bender", "Harem",
    "Historical", "Horror", "Josei", "Martial-Arts", "Mature",
    "Mecha", "Military", "Mystery", "Psychological", "Romance",
    "School-Life", "Sci-Fi", "Seinen", "Shoujo", "Shoujo-Ai",
    "Shounen", "Shounen-Ai", "Slice-Of-Life", "Smut", "Sports",
    "Supernatural", "Tragedy", "Urban-Life", "Yaoi", "Yuri"
].sort();

export default async function NewNovelPage() {
    await checkAdmin();

    // Fetch existing tags to suggest
    const existingTags = await (prisma as any).tag.findMany({
        select: { name: true }
    });
    const tagSuggestions = existingTags.map((t: { name: string }) => t.name);

    return (
        <div className="min-h-screen bg-[#F5F5DC] text-[#3E2723]">
            <nav className="border-b border-black/5 px-6 py-4 backdrop-blur-sm sticky top-0 bg-white/50 z-50">
                <div className="max-w-2xl mx-auto flex justify-between items-center">
                    <Link href="/admin" className="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity">← Kembali ke Dashboard</Link>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-6 py-12">
                <header className="mb-8">
                    <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Tambah Novel Baru</h2>
                    <p className="opacity-70">Masukkan informasi detail untuk novel baru.</p>
                </header>

                <AdminNovelForm
                    action={createNovel}
                    tagSuggestions={tagSuggestions}
                    predefinedGenres={PREDEFINED_GENRES}
                />
            </main>
        </div>
    );
}

