import { checkAdmin } from "@/lib/admin";
import { updateNovel } from "@/app/actions/novel-actions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
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

export default async function EditNovelPage({ params }: { params: Promise<{ id: string }> }) {
    await checkAdmin();
    const { id } = await params;

    const novel = await prisma.novel.findUnique({
        where: { id },
        include: {
            genres: true,
            tags: true
        }
    });

    if (!novel) {
        return notFound();
    }

    // Fetch existing tags to suggest
    const existingTags = await (prisma as any).tag.findMany({
        select: { name: true }
    });
    const tagSuggestions = existingTags.map((t: { name: string }) => t.name);

    const updateNovelWithId = updateNovel.bind(null, id);

    return (
        <div className="min-h-screen bg-[#F5F5DC] text-[#3E2723]">
            <nav className="border-b border-black/5 px-6 py-4 backdrop-blur-sm sticky top-0 bg-white/50 z-50">
                <div className="max-w-2xl mx-auto flex justify-between items-center">
                    <Link href="/admin" className="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity">← Kembali ke Dashboard</Link>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-6 py-12">
                <header className="mb-8">
                    <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Edit Novel</h2>
                    <p className="opacity-70">Ubah informasi detail untuk novel: <strong>{novel.title}</strong></p>
                </header>

                <AdminNovelForm
                    novel={novel}
                    action={updateNovelWithId}
                    tagSuggestions={tagSuggestions}
                    predefinedGenres={PREDEFINED_GENRES}
                />
            </main>
        </div>
    );
}
