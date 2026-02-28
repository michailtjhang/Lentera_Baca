import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ChevronRight, Bookmark, Play, Clock, BookOpen, Hash } from "lucide-react";
import ChapterList from "@/components/ChapterList";
import HistoryDisplay from "@/components/HistoryDisplay";
import ThemeToggle from "@/components/ThemeToggle";
import ReadButton from "@/components/ReadButton";


interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const novel = await prisma.novel.findUnique({
        where: { slug },
        select: { title: true, description: true, coverImage: true, author: true }
    });

    if (!novel) return { title: "Novel Tidak Ditemukan" };

    return {
        title: novel.title,
        description: novel.description?.slice(0, 160) || `Baca novel ${novel.title} oleh ${novel.author} di Lentera Baca.`,
        openGraph: {
            title: novel.title,
            description: novel.description?.slice(0, 160),
            images: novel.coverImage ? [novel.coverImage] : [],
            type: "article",
        }
    };
}

export default async function NovelOverviewPage({ params }: PageProps) {

    const { slug } = await params;
    const user = await currentUser();
    const theme = (user?.publicMetadata?.theme as string) || "light";

    const novel = await prisma.novel.findUnique({
        where: { slug },
        include: {
            chapters: { orderBy: { order: 'asc' } },
            genres: true,
            tags: true,
        }
    });

    if (!novel) return notFound();

    const statusColors: Record<string, string> = {
        ONGOING: "text-blue-500 bg-blue-500/10",
        COMPLETE: "text-emerald-500 bg-emerald-500/10",
        DROP: "text-red-500 bg-red-500/10",
        HIATUS: "text-amber-500 bg-amber-500/10",
    };

    return (
        <div className="min-h-screen bg-[#F5F5DC] text-[#3E2723] dark:bg-[#121212] dark:text-[#e0e0e0] transition-colors duration-500">
            <nav className="border-b border-black/5 dark:border-white/5 px-6 py-4 backdrop-blur-xl sticky top-0 bg-white/70 dark:bg-black/70 z-50">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-2xl font-black tracking-tighter">Lentera Baca</Link>
                        <div className="hidden md:flex h-4 w-px bg-black/10 dark:bg-white/10" />
                        <Link href="/browse" className="hidden md:block text-[0.65rem] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity">Jelajah</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle currentTheme={theme} variant="minimal" />
                        <SignedIn><UserButton /></SignedIn>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
                    {/* Hero Left: Cover */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
                        <div className="rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_40px_80px_-15px_rgba(255,255,255,0.05)] border-4 border-white/50 dark:border-white/5 aspect-[3/4] group">
                            {novel.coverImage ? (
                                <img src={novel.coverImage} alt={novel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-black uppercase opacity-20 tracking-widest text-xs">No Cover</div>
                            )}
                        </div>
                    </div>

                    {/* Hero Right: Content */}
                    <div className="lg:col-span-8 space-y-12">
                        <div>
                            <div className="flex flex-wrap items-center gap-4 mb-8">
                                <span className={`text-[0.6rem] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full ${statusColors[novel.status]}`}>
                                    {novel.status}
                                </span>
                                <div className="flex items-center gap-2 opacity-30 text-[0.65rem] font-black uppercase tracking-widest">
                                    <Clock size={14} /> {novel.updatedAt.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                            <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6">{novel.title}</h1>
                            {novel.description && (
                                <div
                                    className="text-sm sm:text-base leading-relaxed opacity-80 prose prose-sm dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ __html: novel.description }}
                                />
                            )}
                            <p className="text-2xl font-serif italic opacity-40 px-1">oleh {novel.author}</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {novel.genres.map((g) => (
                                <Link key={g.id} href={`/browse?genre=${g.name}`} className="px-6 py-2.5 bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest hover:bg-white dark:hover:bg-white/10 transition-all">
                                    {g.name}
                                </Link>
                            ))}
                        </div>

                        {novel.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {novel.tags.map((t) => (
                                    <Link key={t.id} href={`/browse?tag=${t.name}`} className="px-4 py-1.5 bg-black/5 dark:bg-white/5 rounded-full text-[0.6rem] font-bold opacity-60 hover:opacity-100 transition-all">
                                        #{t.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-6 bg-white/40 dark:bg-white/5 rounded-[2rem] border border-black/5 dark:border-white/5 flex flex-col md:block items-center text-center md:text-left">
                                <p className="text-[0.5rem] opacity-30 font-black uppercase tracking-widest mb-2">Total Bab</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-black">{novel.chapters.length}</span>
                                    <BookOpen size={18} className="mb-1 opacity-20" />
                                </div>
                            </div>
                            {/* Actions */}
                            <div className="md:col-span-3 flex items-stretch gap-4 h-16 md:h-auto">
                                {novel.chapters.length > 0 && (
                                    <ReadButton
                                        novelId={novel.id}
                                        slug={slug}
                                        firstChapterOrder={novel.chapters[0].order}
                                    />
                                )}
                                <button className="aspect-square flex items-center justify-center bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-[2rem] hover:bg-white transition-all active:scale-90">
                                    <Bookmark size={20} />
                                </button>
                            </div>

                        </div>

                        <div>
                            <h3 className="text-[0.65rem] font-black uppercase tracking-[0.3em] opacity-30 mb-6 flex items-center gap-2">
                                <Hash size={14} /> Sinopsis
                            </h3>
                            <p className="text-xl leading-[1.8] font-medium opacity-80 whitespace-pre-wrap font-serif">
                                {novel.description || "Tidak ada deskripsi tersedia."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chapters Section */}
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-4xl font-black tracking-tighter">Daftar Bab</h2>
                        <div className="h-px flex-1 mx-8 bg-black/5 dark:bg-white/5 hidden md:block" />
                        <span className="text-xs font-black opacity-20 tracking-[0.3em] uppercase">{novel.chapters.length} Bab</span>
                    </div>

                    <HistoryDisplay novelId={novel.id} slug={slug} />
                    <ChapterList chapters={novel.chapters} slug={slug} novelId={novel.id} />
                </div>
            </main>

            <footer className="max-w-6xl mx-auto px-6 py-24 border-t border-black/5 dark:border-white/5 opacity-20 text-[0.6rem] font-black tracking-[0.4em] text-center uppercase">

                © 2026 Lentera Baca. Terangi ceritamu.
            </footer>
        </div>
    );
}
