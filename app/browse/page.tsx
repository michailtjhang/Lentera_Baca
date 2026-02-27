import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/admin";
import { Search, ChevronLeft, SlidersHorizontal } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface BrowseProps {
    searchParams: Promise<{ q?: string; genre?: string; sort?: string }>;
}

export const metadata = {
    title: "Jelajah Novel",
    description: "Temukan berbagai macam genre novel menarik di Lentera Baca. Cari novel favorit Anda sekarang.",
};

export default async function BrowsePage({ searchParams }: BrowseProps) {
    const { userId } = await auth();
    const user = await currentUser();
    const theme = (user?.publicMetadata?.theme as string) || "light";
    const params = await searchParams;
    const { q, genre, sort } = params;

    const where: any = {};
    if (q) {
        where.OR = [
            { title: { contains: q, mode: 'insensitive' } },
            { author: { contains: q, mode: 'insensitive' } },
        ];
    }
    if (genre) {
        where.genres = { some: { name: genre } };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'updated') orderBy = { updatedAt: 'desc' };
    if (sort === 'popular') orderBy = { chapters: { _count: 'desc' } };

    const [novels, allGenres] = await Promise.all([
        prisma.novel.findMany({
            where,
            include: { _count: { select: { chapters: true } }, genres: true },
            orderBy
        }),
        (prisma as any).genre.findMany({ orderBy: { name: 'asc' } })
    ]);

    return (
        <div className="min-h-screen bg-[#F5F5DC] text-[#3E2723] dark:bg-[#1a1a1a] dark:text-[#d1d1d1] transition-colors duration-500">

            {/* Minimal Header */}
            <nav className="border-b border-black/5 dark:border-white/5 px-6 py-4 backdrop-blur-xl sticky top-0 bg-white/70 dark:bg-black/70 z-50">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="group flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali
                        </Link>
                        <h1 className="text-xl font-black tracking-tighter">Jelajah</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle currentTheme={theme} variant="minimal" />
                        <SignedIn><UserButton /></SignedIn>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sidebar / Filters */}
                    <aside className="lg:col-span-1 space-y-10">
                        <div>
                            <div className="flex items-center gap-2 mb-6 opacity-30">
                                <Search size={14} />
                                <h3 className="text-[0.65rem] font-black uppercase tracking-[0.2em]">Carian</h3>
                            </div>
                            <form action="/browse" method="GET" className="relative group">
                                <input
                                    type="text"
                                    name="q"
                                    defaultValue={q}
                                    placeholder="Cari novel..."
                                    className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-white/10 rounded-2xl px-5 py-3 focus:outline-none transition-all text-sm font-bold"
                                />
                                {genre && <input type="hidden" name="genre" value={genre} />}
                            </form>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-6 opacity-30">
                                <SlidersHorizontal size={14} />
                                <h3 className="text-[0.65rem] font-black uppercase tracking-[0.2em]">Genres</h3>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Link href="/browse" className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${!genre ? 'bg-[#3E2723] text-[#F5F5DC] dark:bg-white dark:text-black' : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-60'}`}>
                                    Semua Genre
                                </Link>
                                {allGenres.map((g: any) => (
                                    <Link key={g.id} href={`/browse?genre=${g.name}${q ? `&q=${q}` : ''}`} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${genre === g.name ? 'bg-[#3E2723] text-[#F5F5DC] dark:bg-white dark:text-black' : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-60'}`}>
                                        {g.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Result Grid */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-8 opacity-40">
                            <span className="text-[0.65rem] font-black uppercase tracking-widest">{novels.length} Hasil Ditemukan</span>
                            <div className="flex items-center gap-4 text-[0.65rem] font-black uppercase tracking-widest">
                                <span>Urutkan:</span>
                                <Link href={`/browse?${q ? `q=${q}&` : ''}${genre ? `genre=${genre}&` : ''}sort=newest`} className={!sort || sort === 'newest' ? 'text-[#3E2723] dark:text-white' : ''}>Terbaru</Link>
                                <Link href={`/browse?${q ? `q=${q}&` : ''}${genre ? `genre=${genre}&` : ''}sort=updated`} className={sort === 'updated' ? 'text-[#3E2723] dark:text-white' : ''}>Update</Link>
                                <Link href={`/browse?${q ? `q=${q}&` : ''}${genre ? `genre=${genre}&` : ''}sort=popular`} className={sort === 'popular' ? 'text-[#3E2723] dark:text-white' : ''}>Populer</Link>
                            </div>
                        </div>

                        {novels.length === 0 ? (
                            <div className="py-24 text-center border-2 border-dashed border-black/5 dark:border-white/5 rounded-[3rem]">
                                <h3 className="text-xl font-black mb-2">Ops! Tidak ditemukan</h3>
                                <p className="opacity-40 text-xs uppercase tracking-widest font-black">Coba kata kunci lain.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                {novels.map((novel) => (
                                    <Link key={novel.id} href={`/novel/${novel.slug}`} className="group flex flex-col">
                                        <div className="relative aspect-[10/14] overflow-hidden rounded-[2rem] bg-zinc-200 dark:bg-zinc-800 mb-4 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500">
                                            {novel.coverImage ? (
                                                <img src={novel.coverImage} alt={novel.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[0.6rem] opacity-20 uppercase font-black">No Cover</div>
                                            )}
                                        </div>
                                        <h3 className="text-sm font-black line-clamp-2 leading-tight tracking-tight mb-2 group-hover:text-black dark:group-hover:text-white transition-colors">{novel.title}</h3>
                                        <div className="flex justify-between items-center mt-auto opacity-40 text-[0.55rem] font-black uppercase tracking-widest">
                                            <span>{novel.author}</span>
                                            <span>{novel._count.chapters} ch</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
