import { checkAdmin } from "@/lib/admin";
import { updateNovel } from "@/app/actions/novel-actions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { TagInput } from "@/components/TagInput";
import { notFound } from "next/navigation";

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
    const currentTags = novel.tags.map((t: any) => t.name).join(", ");

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

                <form action={updateNovelWithId} className="space-y-6 bg-white/40 p-8 rounded-3xl border border-black/5">
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-bold uppercase tracking-widest opacity-60">Judul Novel</label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            defaultValue={novel.title}
                            placeholder="Contoh: Sang Pencari Cahaya"
                            className="w-full bg-white/80 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="author" className="text-sm font-bold uppercase tracking-widest opacity-60">Penulis</label>
                        <input
                            type="text"
                            name="author"
                            id="author"
                            required
                            defaultValue={novel.author}
                            placeholder="Contoh: Ahmad Fuadi"
                            className="w-full bg-white/80 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest opacity-60">Genre</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/80 p-4 rounded-xl border border-black/5">
                            {PREDEFINED_GENRES.map((genre: any) => (
                                <label key={genre} className="flex items-center gap-2 text-sm font-medium cursor-pointer hover:opacity-70 transition-opacity">
                                    <input
                                        type="checkbox"
                                        name="genres"
                                        value={genre}
                                        defaultChecked={novel.genres.some((g: any) => g.name === genre)}
                                        className="w-4 h-4 accent-[#3E2723]"
                                    />
                                    {genre}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest opacity-60">Tag (Pilih atau Ketik)</label>
                        <TagInput suggestions={tagSuggestions} defaultValue={currentTags} />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="coverImage" className="text-sm font-bold uppercase tracking-widest opacity-60">URL Gambar Sampul (Opsional)</label>
                        <input
                            type="url"
                            name="coverImage"
                            id="coverImage"
                            defaultValue={novel.coverImage || ""}
                            placeholder="https://example.com/cover.jpg"
                            className="w-full bg-white/80 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="status" className="text-sm font-bold uppercase tracking-widest opacity-60">Status</label>
                        <select
                            name="status"
                            id="status"
                            defaultValue={novel.status}
                            className="w-full bg-white/80 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-medium"
                        >
                            <option value="ONGOING">On-going</option>
                            <option value="COMPLETE">Complete</option>
                            <option value="DROP">Drop</option>
                            <option value="HIATUS">Hiatus</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-bold uppercase tracking-widest opacity-60">Deskripsi</label>
                        <textarea
                            name="description"
                            id="description"
                            rows={4}
                            defaultValue={novel.description || ""}
                            placeholder="Ceritakan sedikit tentang novel ini..."
                            className="w-full bg-white/80 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-medium resize-none"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#3E2723] text-[#F5F5DC] py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all active:scale-[0.98]"
                    >
                        Update Novel
                    </button>
                </form>
            </main>
        </div>
    );
}
