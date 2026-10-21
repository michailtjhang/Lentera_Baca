import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserButton, SignedIn } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { 
    BookOpen, 
    ChevronLeft, 
    Eye, 
    Layers, 
    Globe, 
    User, 
    PenTool, 
    Sparkles, 
    Bookmark, 
    Trophy 
} from "lucide-react";
import StarRating from "@/components/StarRating";
import ChapterList from "@/components/ChapterList";
import HistoryDisplay from "@/components/HistoryDisplay";
import ThemeToggle from "@/components/ThemeToggle";
import VolumeAccordion from "@/components/VolumeAccordion";
import NovelSynopsis from "@/components/NovelSynopsis";
import NovelHeroActions from "@/components/NovelHeroActions";
import Navbar from "@/components/Navbar";
import { isAdmin } from "@/lib/admin";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const novel = await prisma.novel.findUnique({
        where: { slug },
        select: { title: true, description: true, coverImage: true, author: true }
    });

    if (!novel) return { title: "Novel Tidak Ditemukan" };

    return {
        title: `${novel.title} — Lentera Baca`,
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
    const adminStatus = await isAdmin();

    const novelResult = await prisma.novel.findUnique({
        where: { slug },
        include: {
            chapters: { orderBy: { order: 'asc' } },
            volumes: { 
                orderBy: { order: 'asc' },
                include: { chapters: { orderBy: { order: 'asc' } } }
            },
            genres: true,
            tags: true,
        }
    });

    const novel = novelResult as any;
    if (!novel) return notFound();

    const rank = await prisma.novel.count({
        where: { views: { gt: novel.views } }
    }) + 1;

    const statusConfig: Record<string, { label: string; class: string }> = {
        ONGOING: { 
            label: "On-going", 
            class: "text-blue-700 dark:text-blue-400 bg-blue-500/10 border-blue-500/20" 
        },
        COMPLETE: { 
            label: "Tamat", 
            class: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
        },
        DROP: { 
            label: "Drop", 
            class: "text-red-700 dark:text-red-400 bg-red-500/10 border-red-500/20" 
        },
        HIATUS: { 
            label: "Hiatus", 
            class: "text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20" 
        },
    };

    const typeLabels: Record<string, string> = {
        WEB: "Web Novel",
        LIGHTNOVEL_WEB: "Light Novel",
    };

    const totalCount = (novel.type === 'WEB') ? novel.chapters.length : (novel.volumes.length || novel.chapters.length);
    const countUnit = (novel.type === 'WEB') ? 'Chapter' : (novel.volumes.length > 0 ? 'Volume' : 'Chapter');

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-[#2B1810] dark:bg-[#121212] dark:text-[#e0e0e0] transition-colors duration-500 font-sans relative overflow-x-hidden">
            {/* Ambient Blurred Cover Glow Backdrop */}
            {novel.coverImage && (
                <div className="absolute top-0 inset-x-0 h-[480px] overflow-hidden pointer-events-none -z-0">
                    <img 
                        src={novel.coverImage} 
                        alt="" 
                        className="w-full h-full object-cover blur-3xl scale-150 opacity-20 dark:opacity-25" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FDFBF7]/85 to-[#FDFBF7] dark:via-[#121212]/90 dark:to-[#121212]" />
                </div>
            )}

            {/* ─── UNIFIED RESPONSIVE NAVBAR ───────────────────────────── */}
            <Navbar currentTheme={theme} isAdmin={adminStatus} />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider opacity-50 mb-6 flex-wrap">
                    <Link href="/" className="hover:opacity-100 transition-opacity">Beranda</Link>
                    <span>/</span>
                    <Link href="/browse" className="hover:opacity-100 transition-opacity">Jelajah</Link>
                    <span>/</span>
                    <span className="opacity-80 truncate max-w-[200px] sm:max-w-md font-black">{novel.title}</span>
                </div>

                {/* ═════════════════════════════════════════════════════════════ */}
                {/* HERO SECTION                                                  */}
                {/* ═════════════════════════════════════════════════════════════ */}

                {/* Mobile Hero Header (< lg) */}
                <div className="lg:hidden space-y-6 mb-12">
                    {/* Top Row: Compact Cover + Primary Metadata */}
                    <div className="flex gap-4 sm:gap-6 items-start">
                        {/* Cover Image */}
                        <div className="w-28 sm:w-36 aspect-[3/4] shrink-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/60 dark:border-white/10 relative group bg-black/5">
                            {novel.coverImage ? (
                                <img 
                                    src={novel.coverImage} 
                                    alt={novel.title} 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-black opacity-30">
                                    No Cover
                                </div>
                            )}
                        </div>

                        {/* Title & Info */}
                        <div className="flex-1 min-w-0 space-y-2">
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`text-[0.6rem] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusConfig[novel.status]?.class || "bg-stone-500/10"}`}>
                                    {statusConfig[novel.status]?.label || novel.status}
                                </span>
                                <span className="text-[0.6rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 opacity-70">
                                    {typeLabels[novel.type] || novel.type}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug line-clamp-3 text-[#2B1810] dark:text-white">
                                {novel.title}
                            </h1>

                            {/* Author */}
                            <p className="text-xs font-semibold opacity-70 truncate">
                                Oleh <span className="font-bold opacity-100">{novel.author}</span>
                                {novel.illustrator && <span> • Illus. {novel.illustrator}</span>}
                            </p>

                            {/* Star Rating & Views */}
                            <div className="pt-1 flex items-center gap-3">
                                <StarRating views={novel.views} />
                                <span className="text-[0.65rem] opacity-40 font-bold">
                                    {novel.views.toLocaleString("id-ID")} view
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Rank Pill */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold">
                        <Trophy size={13} className="text-amber-600 dark:text-amber-400" />
                        <span>Peringkat #{rank} Populer di Lentera Baca</span>
                    </div>

                    {/* Quick Stats Grid Mobile */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10">
                            <p className="text-[0.55rem] font-black uppercase tracking-wider opacity-40">Konten</p>
                            <p className="text-xs sm:text-sm font-black mt-0.5">{totalCount} {countUnit}</p>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10">
                            <p className="text-[0.55rem] font-black uppercase tracking-wider opacity-40">Status</p>
                            <p className="text-xs sm:text-sm font-black mt-0.5">{statusConfig[novel.status]?.label || novel.status}</p>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10">
                            <p className="text-[0.55rem] font-black uppercase tracking-wider opacity-40">Regional</p>
                            <p className="text-xs sm:text-sm font-black mt-0.5">{novel.region}</p>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10">
                            <p className="text-[0.55rem] font-black uppercase tracking-wider opacity-40">Views</p>
                            <p className="text-xs sm:text-sm font-black mt-0.5">{novel.views >= 1000 ? `${(novel.views / 1000).toFixed(1)}k` : novel.views}</p>
                        </div>
                    </div>

                    {/* Mobile Action Buttons */}
                    <NovelHeroActions
                        novelId={novel.id}
                        slug={slug}
                        title={novel.title}
                        coverImage={novel.coverImage}
                        firstChapterOrder={novel.chapters[0]?.order || 1}
                        allChapters={novel.chapters}
                    />

                    {/* Genres */}
                    <div className="flex flex-wrap gap-2">
                        {novel.genres.map((g: any) => (
                            <Link 
                                key={g.id} 
                                href={`/browse?genre=${g.name}`}
                                className="px-3.5 py-1.5 bg-white/70 dark:bg-white/5 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 border border-black/5 dark:border-white/10 rounded-xl text-xs font-bold transition-all text-[#3E2723] dark:text-[#e0e0e0]"
                            >
                                {g.name}
                            </Link>
                        ))}
                    </div>

                    {/* Tags */}
                    {novel.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {novel.tags.map((t: any) => (
                                <Link 
                                    key={t.id} 
                                    href={`/browse?tag=${t.name}`}
                                    className="px-2.5 py-1 bg-black/4 dark:bg-white/5 hover:bg-black/8 dark:hover:bg-white/10 rounded-lg text-[0.65rem] font-medium opacity-60 hover:opacity-100 transition-all"
                                >
                                    #{t.name}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Synopsis */}
                    <NovelSynopsis description={novel.description} />
                </div>

                {/* Desktop Hero Layout (≥ lg) */}
                <div className="hidden lg:grid lg:grid-cols-12 lg:gap-12 mb-20 items-start">
                    {/* Left Column: Cover & Sticky Actions */}
                    <div className="lg:col-span-4 sticky top-24 space-y-6">
                        {/* Cover Card */}
                        <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white/60 dark:border-white/10 aspect-[3/4] group bg-black/5 relative">
                            {novel.coverImage ? (
                                <img 
                                    src={novel.coverImage} 
                                    alt={novel.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-black uppercase opacity-20 tracking-widest">
                                    No Cover
                                </div>
                            )}

                            {/* Floating Rank Badge on Cover */}
                            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-amber-300 text-xs font-black shadow-lg">
                                <Trophy size={13} className="text-amber-400" />
                                <span>#{rank} Populer</span>
                            </div>
                        </div>

                        {/* Desktop Hero Action Buttons */}
                        <NovelHeroActions
                            novelId={novel.id}
                            slug={slug}
                            title={novel.title}
                            coverImage={novel.coverImage}
                            firstChapterOrder={novel.chapters[0]?.order || 1}
                            allChapters={novel.chapters}
                        />

                        {/* Meta Sidebar Box */}
                        <div className="p-5 rounded-3xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-sm space-y-3.5 text-xs">
                            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
                                <span className="opacity-50 flex items-center gap-1.5 font-medium">
                                    <User size={14} /> Penulis
                                </span>
                                <span className="font-bold">{novel.author}</span>
                            </div>

                            {novel.illustrator && (
                                <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
                                    <span className="opacity-50 flex items-center gap-1.5 font-medium">
                                        <PenTool size={14} /> Ilustrator
                                    </span>
                                    <span className="font-bold">{novel.illustrator}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
                                <span className="opacity-50 flex items-center gap-1.5 font-medium">
                                    <Globe size={14} /> Regional
                                </span>
                                <span className="font-bold">{novel.region}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="opacity-50 flex items-center gap-1.5 font-medium">
                                    <Layers size={14} /> Format
                                </span>
                                <span className="font-bold">{typeLabels[novel.type] || novel.type}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Title, Metadata, Synopsis */}
                    <div className="lg:col-span-8 space-y-8">
                        <div>
                            {/* Badges Row */}
                            <div className="flex flex-wrap items-center gap-2.5 mb-4">
                                <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${statusConfig[novel.status]?.class || "bg-stone-500/10"}`}>
                                    {statusConfig[novel.status]?.label || novel.status}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full opacity-70">
                                    {typeLabels[novel.type] || novel.type}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full opacity-70">
                                    {novel.region}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-tight mb-4 text-[#2B1810] dark:text-white">
                                {novel.title}
                            </h1>

                            {/* Star Rating & Views Info */}
                            <div className="flex items-center gap-4">
                                <StarRating views={novel.views} />
                                <span className="h-3 w-px bg-black/10 dark:bg-white/10" />
                                <span className="text-xs font-bold opacity-50 flex items-center gap-1.5">
                                    <Eye size={14} /> {novel.views.toLocaleString("id-ID")} kali dibaca
                                </span>
                            </div>
                        </div>

                        {/* Quick Stats Grid Desktop */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                                <p className="text-[0.65rem] font-black uppercase tracking-wider opacity-40">Total Konten</p>
                                <p className="text-lg font-black mt-1 text-[#3E2723] dark:text-white">{totalCount} {countUnit}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                                <p className="text-[0.65rem] font-black uppercase tracking-wider opacity-40">Status Rilis</p>
                                <p className="text-lg font-black mt-1 text-[#3E2723] dark:text-white">{statusConfig[novel.status]?.label || novel.status}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                                <p className="text-[0.65rem] font-black uppercase tracking-wider opacity-40">Peringkat</p>
                                <p className="text-lg font-black mt-1 text-amber-600 dark:text-amber-400">#{rank} Populer</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                                <p className="text-[0.65rem] font-black uppercase tracking-wider opacity-40">Bahasa / Asal</p>
                                <p className="text-lg font-black mt-1 text-[#3E2723] dark:text-white">{novel.region}</p>
                            </div>
                        </div>

                        {/* Genres Pills */}
                        <div className="space-y-2">
                            <p className="text-[0.65rem] font-black uppercase tracking-widest opacity-40">Genre Cerita</p>
                            <div className="flex flex-wrap gap-2">
                                {novel.genres.map((g: any) => (
                                    <Link 
                                        key={g.id} 
                                        href={`/browse?genre=${g.name}`}
                                        className="px-4 py-2 bg-white/70 dark:bg-white/5 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 border border-black/5 dark:border-white/10 rounded-2xl text-xs font-bold transition-all text-[#3E2723] dark:text-[#e0e0e0]"
                                    >
                                        {g.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Tags Badges */}
                        {novel.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {novel.tags.map((t: any) => (
                                    <Link 
                                        key={t.id} 
                                        href={`/browse?tag=${t.name}`}
                                        className="px-3 py-1 bg-black/4 dark:bg-white/5 hover:bg-black/8 dark:hover:bg-white/10 rounded-xl text-xs font-medium opacity-60 hover:opacity-100 transition-all"
                                    >
                                        #{t.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Synopsis */}
                        <NovelSynopsis description={novel.description} />
                    </div>
                </div>

                {/* ═════════════════════════════════════════════════════════════ */}
                {/* CHAPTER / VOLUME CONTENT LIST                                 */}
                {/* ═════════════════════════════════════════════════════════════ */}
                <div className="max-w-4xl mx-auto pt-6 border-t border-black/5 dark:border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#2B1810] dark:text-white">
                                {(novel.type === 'WEB') ? 'Daftar Chapter' : 'Koleksi Volume & Chapter'}
                            </h2>
                            <p className="text-xs opacity-50 font-medium mt-1">
                                Pilih chapter untuk membaca cerita. Riwayat bacaan Anda tersimpan secara otomatis.
                            </p>
                        </div>
                        <span className="self-start sm:self-center text-xs font-black px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 shrink-0">
                            {(novel.type === 'WEB') ? `${novel.chapters.length} Chapter` : `${novel.volumes.length} Volume (${novel.chapters.length} Total)`}
                        </span>
                    </div>

                    {/* History Banner if user was reading */}
                    <HistoryDisplay novelId={novel.id} slug={slug} allChapters={novel.chapters} />

                    {/* Volume Accordion or Flat Chapter List */}
                    {novel.volumes.length > 0 ? (
                        <VolumeAccordion
                            volumes={novel.volumes}
                            standaloneChapters={novel.chapters.filter((c: any) => !c.volumeId)}
                            allChapters={novel.chapters}
                            slug={slug}
                            novelId={novel.id}
                        />
                    ) : (
                        <ChapterList chapters={novel.chapters} slug={slug} novelId={novel.id} />
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="max-w-6xl mx-auto px-6 py-16 border-t border-black/5 dark:border-white/5 opacity-30 text-[0.65rem] font-black tracking-[0.3em] text-center uppercase">
                © 2026 Lentera Baca. Terangi ceritamu di setiap bab.
            </footer>
        </div>
    );
}
