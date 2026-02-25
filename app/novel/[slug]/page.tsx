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

                {/* Novel Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                    {/* Cover Image */}
                    <div className="md:col-span-1">
                        <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5 sticky top-24">
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
                                <h1 className="text-5xl font-black mb-4 tracking-tight leading-tight">{novel.title}</h1>
                                <p className="text-xl opacity-70 italic mb-6">Oleh {novel.author}</p>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-8">
                            <span className={`text-xs font-black uppercase tracking-[0.15em] px-5 py-2.5 rounded-full shadow-sm ${statusColors[novel.status] || 'bg-gray-100 text-gray-800'}`}>
                                {statusLabel[novel.status] || novel.status}
                            </span>
                        </div>

                        {/* Genres */}
                        {novel.genres.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.2em] opacity-40 mb-3">Genre</h3>
                                <div className="flex flex-wrap gap-2">
                                    {novel.genres.map((genre) => (
                                        <span
                                            key={genre.id}
                                            className="px-4 py-1.5 bg-white/60 text-[#3E2723] rounded-xl text-sm font-bold border border-black/5 shadow-sm"
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="bg-white/40 border border-black/5 p-6 rounded-2xl mb-8 flex gap-12 shadow-inner">
                            <div>
                                <p className="text-[0.6rem] opacity-40 uppercase tracking-[0.2em] mb-1 font-bold">Total Chapter</p>
                                <p className="text-3xl font-black">{novel.chapters.length}</p>
                            </div>
                            <div className="w-px bg-black/5" />
                            <div>
                                <p className="text-[0.6rem] opacity-40 uppercase tracking-[0.2em] mb-1 font-bold">Terakhir Update</p>
                                <p className="text-sm font-bold">
                                    {novel.updatedAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.2em] opacity-40 mb-3">Deskripsi</h3>
                            <p className="text-lg leading-relaxed opacity-80 whitespace-pre-wrap font-medium max-w-2xl">
                                {novel.description || "Tidak ada deskripsi tersedia."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chapters Section */}
                <div className="mt-24 max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-black tracking-tight">Daftar Chapter</h2>
                        <span className="text-xs font-bold opacity-30 tracking-widest uppercase">{novel.chapters.length} Bab</span>
                    </div>

                    {/* Reading History - NOW ABOVE LIST */}
                    <HistoryDisplay novelId={novel.id} slug={slug} />

                    {novel.chapters.length === 0 ? (
                        <div className="bg-white/40 border border-black/5 rounded-3xl p-16 text-center shadow-inner">
                            <p className="opacity-40 font-bold uppercase tracking-widest text-sm">Belum ada chapter tersedia.</p>
                        </div>
                    ) : (
                        <ChapterList chapters={novel.chapters} slug={slug} novelId={novel.id} />
                    )}
                </div>
            </main>

            <footer className="max-w-6xl mx-auto px-6 py-20 border-t border-black/5 opacity-40 text-xs font-bold tracking-[0.2em] text-center mt-24 uppercase">
                © 2026 Lentera Baca. Dibuat dengan cinta untuk para pembaca.
            </footer>
        </div>
    );
}
