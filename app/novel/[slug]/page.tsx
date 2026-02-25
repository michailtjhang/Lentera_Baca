import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import ChapterList from "@/components/ChapterList";
import HistoryDisplay from "@/components/HistoryDisplay";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function NovelOverviewPage({ params }: PageProps) {
    const { slug } = await params;

    const novel = await prisma.novel.findUnique({
        where: { slug },
        include: {
            chapters: {
                orderBy: { order: 'asc' }
            },
            genres: true,
            tags: true,
        }
    });

    if (!novel) {
        return notFound();
    }

    const { userId } = await auth();

    // Status color mapping
    const statusColors: Record<string, string> = {
        ONGOING: "bg-blue-100 text-blue-800",
        COMPLETE: "bg-green-100 text-green-800",
        DROP: "bg-red-100 text-red-800",
        HIATUS: "bg-yellow-100 text-yellow-800",
    };

    const statusLabel: Record<string, string> = {
        ONGOING: "On-going",
        COMPLETE: "Complete",
        DROP: "Drop",
        HIATUS: "Hiatus",
    };

    return (
        <div className="min-h-screen bg-[#F5F5DC] text-[#3E2723]">
            <nav className="border-b border-black/5 px-6 py-4 backdrop-blur-sm sticky top-0 bg-white/50 z-50">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold tracking-tight">Lentera Baca</Link>
                    <div className="flex items-center gap-4">
                        {userId && <UserButton />}
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Back Button */}
                <Link href="/" className="text-sm font-medium opacity-60 hover:opacity-100 mb-8 inline-block transition-opacity">
                    ← Kembali ke Koleksi
                </Link>

                {/* Reading History */}
                <HistoryDisplay novelId={novel.id} slug={slug} />

                {/* Novel Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* Cover Image */}
                    <div className="md:col-span-1">
                        <div className="rounded-2xl overflow-hidden shadow-lg sticky top-24">
                            {novel.coverImage ? (
                                <img
                                    src={novel.coverImage}
                                    alt={novel.title}
                                    className="w-full h-auto object-cover"
                                />
                            ) : (
                                <div className="w-full aspect-[3/4] bg-gradient-to-br from-[#3E2723]/10 to-[#3E2723]/5 flex items-center justify-center">
                                    <span className="text-opacity-40 text-[#3E2723]">No Cover</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Novel Info */}
                    <div className="md:col-span-2">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-4xl font-bold mb-2">{novel.title}</h1>
                                <p className="text-lg opacity-70 italic mb-4">Oleh {novel.author}</p>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-6">
                            <span className={`text-sm font-bold uppercase px-4 py-2 rounded-full ${statusColors[novel.status] || 'bg-gray-100 text-gray-800'}`}>
                                {statusLabel[novel.status] || novel.status}
                            </span>
                        </div>

                        {/* Genres */}
                        {novel.genres.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-2">Genre</h3>
                                <div className="flex flex-wrap gap-2">
                                    {novel.genres.map((genre) => (
                                        <span
                                            key={genre.id}
                                            className="px-3 py-1 bg-[#3E2723]/10 text-[#3E2723] rounded-full text-sm font-medium"
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {novel.tags.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-2">Tag</h3>
                                <div className="flex flex-wrap gap-2">
                                    {novel.tags.map((tag) => (
                                        <span
                                            key={tag.id}
                                            className="px-2 py-1 bg-white/40 border border-black/5 rounded text-xs"
                                        >
                                            #{tag.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="bg-white/40 border border-black/5 p-4 rounded-xl mb-6">
                            <div className="flex gap-8">
                                <div>
                                    <p className="text-xs opacity-60 uppercase tracking-widest mb-1">Total Chapter</p>
                                    <p className="text-2xl font-bold">{novel.chapters.length}</p>
                                </div>
                                <div>
                                    <p className="text-xs opacity-60 uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-sm font-bold">{statusLabel[novel.status]}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-2">Deskripsi</h3>
                            <p className="text-base leading-relaxed opacity-80 whitespace-pre-wrap">
                                {novel.description || "Tidak ada deskripsi tersedia."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chapters Section */}
                <div className="mt-16">
                    <h2 className="text-3xl font-bold mb-6">Daftar Chapter</h2>

                    {novel.chapters.length === 0 ? (
                        <div className="bg-white/40 border border-black/5 rounded-2xl p-12 text-center">
                            <p className="opacity-70">Belum ada chapter tersedia.</p>
                        </div>
                    ) : (
                        <ChapterList chapters={novel.chapters} slug={slug} novelId={novel.id} />
                    )}
                </div>
            </main>

            <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-black/5 opacity-40 text-sm text-center mt-20">
                © 2026 Lentera Baca. Dibuat dengan cinta untuk para pembaca.
            </footer>
        </div>
    );
}
