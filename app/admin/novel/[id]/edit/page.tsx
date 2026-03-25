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
            tags: true,
            volumes: { orderBy: { order: "asc" } }
        }
    });

    if (!novel) {
        return notFound();
    }

    // Fetch existing tags and genres to suggest
    const [existingTags, genres] = await Promise.all([
        (prisma as any).tag.findMany({ select: { name: true } }),
        (prisma as any).genre.findMany({ select: { name: true }, orderBy: { name: "asc" } })
    ]);
    
    const tagSuggestions = existingTags.map((t: { name: string }) => t.name);
    const genreSuggestions = genres.map((g: { name: string }) => g.name);

    const updateNovelWithId = updateNovel.bind(null, id);

    return (
        <div className="p-8 lg:p-12">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="h-px w-8 bg-[#3E2723]/20" />
                    <span className="text-[0.65rem] font-black uppercase tracking-[0.4em] text-[#3E2723]/40">Edit Series</span>
                </div>
                <h2 className="text-4xl font-black mb-3 tracking-tight text-[#3E2723]">Edit Novel</h2>
                <p className="text-[#3E2723]/30 font-bold">Ubah informasi detail untuk novel: <span className="text-[#3E2723] italic font-black">{novel.title}</span></p>
            </header>

            <div className="bg-white/80 border border-black/5 rounded-[3rem] p-10 shadow-2xl shadow-black/5">
                <AdminNovelForm
                    novel={novel}
                    action={updateNovel}
                    tagSuggestions={tagSuggestions}
                    predefinedGenres={genreSuggestions}
                    mode="edit"
                />
            </div>
        </div>
    );
}
