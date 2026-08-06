import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/admin";
import { Search, Zap, Clock, BookOpen, Shield, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import PopularSlider from "@/components/PopularSlider";

export const metadata = {
  title: "Beranda | Lentera Baca",
  description: "Jelajahi koleksi novel terbaru dan terpopuler di Lentera Baca. Terangi imajinasi Anda dengan ribuan cerita menarik.",
};

export const revalidate = 60;

// Tag yang dianggap konten 18+
const ADULT_TAGS = ["18+", "adult", "mature", "r18", "smut", "ecchi"];

function isAdultContent(tags: any[]): boolean {
  if (!tags || tags.length === 0) return false;
  return tags.some((tag: any) =>
    ADULT_TAGS.some(adult =>
      tag.name.toLowerCase().includes(adult.toLowerCase())
    )
  );
}

export default async function Home() {
  const { userId } = await auth();
  const user = await currentUser();
  const theme = (user?.publicMetadata?.theme as string) || "light";
  const userName = user?.firstName || user?.username || null;
  const adminStatus = await isAdmin();

  // Fetch novels for different sections (including tags for 18+ filtering)
  const [newlyAddedRaw, latestRaw] = await Promise.all([
    prisma.novel.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { chapters: true, volumes: true } }, genres: true, tags: true } as any,
    }),
    prisma.novel.findMany({
      take: 20,
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { chapters: true, volumes: true } }, genres: true, tags: true } as any,
    }),
  ]);

  // Filter out 18+ content from home page (Limit slider to 5 novels)
  const newlyAddedNovels = (newlyAddedRaw as any[]).filter(n => !isAdultContent(n.tags)).slice(0, 5);
  const latestUpdated = (latestRaw as any[]).filter(n => !isAdultContent(n.tags)).slice(0, 10);

  const getTypeLabel = (type: string) => {
    if (type === "WEB") return "Web Novel";
    if (type === "LIGHTNOVEL_WEB") return "Light Novel";
    return type;
  };

  const getStatusColor = (status: string) => {
    if (status === "ONGOING") return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
    if (status === "COMPLETE") return "bg-blue-500/15 text-blue-600 dark:text-blue-400";
    if (status === "DROP") return "bg-red-500/15 text-red-500";
    return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
  };

  const getStatusLabel = (status: string) => {
    if (status === "ONGOING") return "Ongoing";
    if (status === "COMPLETE") return "Selesai";
    if (status === "DROP") return "Drop";
    return "Hiatus";
  };

  const NovelCard = ({ novel }: { novel: any }) => (
    <Link href={`/novel/${novel.slug}`} className="group flex flex-col">
      <div className="relative aspect-[10/14] overflow-hidden rounded-2xl bg-zinc-200 dark:bg-zinc-800 mb-3 shadow-md group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500">
        {novel.coverImage ? (
          <img
            src={novel.coverImage}
            alt={novel.title}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-zinc-800 dark:to-zinc-700">
            <BookOpen size={28} className="opacity-20" />
            <span className="text-[0.5rem] opacity-20 uppercase font-black tracking-widest">No Cover</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Badges on hover */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <span className="text-[0.5rem] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-white/90 dark:bg-black/90 text-black dark:text-white backdrop-blur">
            {getTypeLabel(novel.type)}
          </span>
          <span className={`text-[0.5rem] font-black uppercase tracking-wider px-2 py-1 rounded-lg backdrop-blur ${getStatusColor(novel.status)} bg-white/90 dark:bg-black/90`}>
            {getStatusLabel(novel.status)}
          </span>
        </div>
      </div>
      <h3 className="text-[0.8rem] font-bold line-clamp-2 leading-snug tracking-tight mb-1.5 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
        {novel.title}
      </h3>
      <div className="flex justify-between items-center mt-auto">
        <span className="text-[0.6rem] opacity-40 font-semibold truncate max-w-[65%]">{novel.author}</span>
        <span className="text-[0.55rem] opacity-30 font-black uppercase tracking-widest">
          {novel.type === "WEB" ? `${novel._count.chapters} Ch` : `${novel._count.volumes} Vol`}
        </span>
      </div>
    </Link>
  );

  const SectionHeader = ({ title, icon: Icon, href, color }: { title: string; icon: any; href: string; color: string }) => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${color}`}>
          <Icon size={16} className="text-white" />
        </div>
        <h2 className="text-lg font-black uppercase tracking-tight">{title}</h2>
      </div>
      <Link
        href={href}
        className="group flex items-center gap-1.5 text-[0.6rem] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all"
      >
        Lihat Semua
        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-[#3E2723] dark:bg-[#0f0f0f] dark:text-[#e8e8e8] transition-colors duration-500">
      {/* ─── NAVBAR ─────────────────────────────────────────────── */}
      <nav className="border-b border-black/5 dark:border-white/5 px-6 py-4 backdrop-blur-xl sticky top-0 bg-[#FDFCF0]/80 dark:bg-[#0f0f0f]/80 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg">
              <BookOpen size={14} className="text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter">Lentera Baca</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-sm mx-8">
            <form action="/browse" method="GET" className="relative w-full group">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-60 transition-opacity" />
              <input
                type="text"
                name="q"
                placeholder="Cari novel, penulis, tag..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-black/10 dark:focus:border-white/10 focus:bg-white dark:focus:bg-white/10 text-sm font-medium outline-none transition-all placeholder:opacity-40"
              />
            </form>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-5">
              <Link href="/browse" className="text-[0.65rem] font-black uppercase tracking-[0.15em] opacity-50 hover:opacity-100 transition-opacity">
                Jelajah
              </Link>
              {adminStatus && (
                <Link href="/admin" className="text-[0.65rem] font-black uppercase tracking-[0.15em] opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1.5">
                  <Shield size={12} />
                  Admin
                </Link>
              )}
            </div>

            <div className="h-4 w-px bg-black/10 dark:bg-white/10 hidden md:block" />

            <div className="flex items-center gap-3">
              <ThemeToggle currentTheme={theme} variant="minimal" />
              <SignedIn>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="text-[0.65rem] font-black uppercase tracking-[0.15em] px-4 py-2 bg-[#3E2723] text-[#F5F5DC] dark:bg-white dark:text-black rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
                >
                  Masuk
                </Link>
              </SignedOut>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        {/* ─── HERO + POPULAR SLIDER ──────────────────────────────── */}
        <section className="py-8 md:py-12 relative overflow-hidden">
          {/* Unified amber ambient background glow across both slider and text */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[140%] bg-gradient-to-r from-amber-400/25 via-orange-400/25 to-amber-500/20 dark:from-amber-500/15 dark:via-orange-500/20 dark:to-amber-500/15 blur-[100px] opacity-85 rounded-full transform-gpu" />
          </div>

          {/* Grid Layout: Slider (70% = 8 cols), Hero Text (30% = 4 cols with min-w-0 to prevent clipping) */}
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center w-full max-w-full">
            {/* Slider (Desktop Left 8/12 cols ~70%, Mobile order-2) */}
            <div className="lg:col-span-8 w-full min-w-0 order-2 lg:order-1">
              <div className="min-h-[280px] sm:min-h-[320px] md:min-h-[350px] h-full">
                <PopularSlider novels={newlyAddedNovels as any} />
              </div>
            </div>

            {/* Hero Text & Search (Desktop Right 4/12 cols ~30%, Mobile order-1 on top) */}
            <div className="lg:col-span-4 w-full min-w-0 flex flex-col justify-center order-1 lg:order-2 text-center lg:text-left overflow-hidden">
              {/* Welcome back banner for logged-in users */}
              {userId && userName && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4 mx-auto lg:mx-0 max-w-full">
                  <Sparkles size={12} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-[0.7rem] font-bold text-amber-700 dark:text-amber-300 truncate">
                    Halo, <strong>{userName}</strong>! Siap membaca?
                  </span>
                </div>
              )}

              {!userId && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3E2723]/5 dark:bg-white/5 border border-black/5 dark:border-white/5 mb-4 mx-auto lg:mx-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[0.58rem] font-black uppercase tracking-widest opacity-60">Terangi Imajinasi Anda</span>
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl lg:text-2xl xl:text-3xl font-black tracking-tighter leading-tight mb-2.5">
                Terangi Harimu Dengan{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500 dark:from-amber-400 dark:to-orange-400">
                  Kisah Terbaik.
                </span>
              </h1>

              <p className="text-xs sm:text-sm opacity-70 mb-5 leading-relaxed font-medium">
                Temukan ribuan Light Novel & Web Novel pilihan dengan update bab terbaru setiap hari.
              </p>

              {/* Search bar & CTA */}
              <div className="flex flex-col gap-2.5 w-full">
                <form action="/browse" method="GET" className="relative w-full group">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-80 transition-opacity" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Cari judul, genre, penulis..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 focus:border-amber-400/60 text-xs font-medium outline-none transition-all placeholder:opacity-40 shadow-sm"
                  />
                </form>
                <Link
                  href="/browse"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl font-black uppercase tracking-wider text-[0.65rem] hover:shadow-lg transition-all active:scale-95 shadow-md shadow-amber-600/20"
                >
                  Mulai Membaca Sekarang
                  <Zap size={13} className="fill-current" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── DIVIDER ────────────────────────────────────────────── */}
        <div className="h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent mb-14" />

        {/* ─── NOVEL SECTIONS ─────────────────────────────────────── */}
        <div className="space-y-16 pb-20">

          {/* Latest Updated */}
          <section>
            <SectionHeader title="Update Terkini" icon={Clock} href="/browse?sort=updated" color="bg-gradient-to-br from-blue-500 to-indigo-600" />
            {latestUpdated.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {latestUpdated.map((novel) => (
                  <NovelCard key={novel.id} novel={novel} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center opacity-20">
                <BookOpen size={40} className="mx-auto mb-3" strokeWidth={1} />
                <p className="text-sm font-bold uppercase tracking-widest">Belum ada novel</p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ─── FOOTER ─────────────────────────────────────────────── */}
      <footer className="border-t border-black/5 dark:border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow">
              <BookOpen size={11} className="text-white" />
            </div>
            <span className="text-sm font-black tracking-tighter opacity-60">Lentera Baca</span>
          </div>
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.25em] opacity-25">
            © 2026 Lentera Baca. Terangi segalanya.
          </p>
          <div className="flex items-center gap-4 text-[0.6rem] font-black uppercase tracking-widest opacity-30">
            <Link href="/browse" className="hover:opacity-100 transition-opacity">Jelajah</Link>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in" className="hover:opacity-100 transition-opacity">Masuk</Link>
            </SignedOut>
          </div>
        </div>
      </footer>
    </div>
  );
}
