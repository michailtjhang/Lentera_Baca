import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/admin";
import { 
  Search, 
  Zap, 
  Clock, 
  BookOpen, 
  Flame, 
  Sparkles, 
  ArrowRight, 
  Star, 
  Trophy, 
  Compass, 
  CheckCircle2, 
  Moon, 
  Smartphone 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Logo from "@/components/Logo";
import NewSlider from "@/components/NewSlider";
import { calculateRating } from "@/components/StarRating";

export const metadata = {
  title: "Lentera Baca - Baca Novel Online Versi Premium",
  description: "Jelajahi koleksi novel terbaru dan terpopuler di Lentera Baca. Terangi imajinasi Anda dengan ribuan cerita menarik dalam antarmuka modern dan nyaman.",
};

export const revalidate = 60;

// Tag yang dianggap konten 18+
const ADULT_TAGS = ["18+", "adult", "mature", "r18", "smut", "ecchi"];

function isAdultContent(tags: any[]): boolean {
  if (!tags || tags.length === 0) return false;
  return tags.some((tag: any) =>
    ADULT_TAGS.some((adult) =>
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

  // Fetch novels and genres for homepage sections
  const [newlyAddedRaw, latestRaw, popularRaw, topGenres] = await Promise.all([
    prisma.novel.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { chapters: true, volumes: true } }, genres: true, tags: true } as any,
    }),
    prisma.novel.findMany({
      take: 30,
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { chapters: true, volumes: true } }, genres: true, tags: true } as any,
    }),
    prisma.novel.findMany({
      take: 15,
      orderBy: { views: "desc" },
      include: { _count: { select: { chapters: true, volumes: true } }, genres: true, tags: true } as any,
    }),
    (prisma as any).genre.findMany({
      take: 8,
      orderBy: { novels: { _count: "desc" } },
      include: { _count: { select: { novels: true } } },
    }),
  ]);

  // Filter out 18+ content from home page
  const newlyAddedNovels = (newlyAddedRaw as any[]).filter((n) => !isAdultContent(n.tags)).slice(0, 5);
  const latestUpdated = (latestRaw as any[]).filter((n) => !isAdultContent(n.tags)).slice(0, 10);
  const popularNovels = (popularRaw as any[]).filter((n) => !isAdultContent(n.tags)).slice(0, 5);

  const getTypeLabel = (type: string) => {
    if (type === "WEB") return "Web Novel";
    if (type === "LIGHTNOVEL_WEB") return "Light Novel";
    return type;
  };

  const getStatusColor = (status: string) => {
    if (status === "ONGOING") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
    if (status === "COMPLETE") return "bg-blue-500/15 text-blue-700 dark:text-blue-300";
    if (status === "DROP") return "bg-red-500/15 text-red-600 dark:text-red-400";
    return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  };

  const getStatusLabel = (status: string) => {
    if (status === "ONGOING") return "Ongoing";
    if (status === "COMPLETE") return "Selesai";
    if (status === "DROP") return "Drop";
    return "Hiatus";
  };

  const NovelCard = ({ novel, rank }: { novel: any; rank?: number }) => (
    <Link href={`/novel/${novel.slug}`} className="group flex flex-col h-full">
      <div className="relative aspect-[10/14] overflow-hidden rounded-2xl bg-zinc-200 dark:bg-zinc-800 mb-3 shadow-md group-hover:shadow-2xl group-hover:-translate-y-1.5 transition-all duration-300 border border-black/5 dark:border-white/10">
        {novel.coverImage ? (
          <img
            src={novel.coverImage}
            alt={novel.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-zinc-800 dark:to-zinc-700">
            <BookOpen size={28} className="opacity-20" />
            <span className="text-[0.55rem] opacity-30 uppercase font-black tracking-widest">No Cover</span>
          </div>
        )}

        {/* Rank Badge if specified */}
        {rank !== undefined && (
          <div
            className={`absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-black shadow-lg backdrop-blur-md ${
              rank === 1
                ? "bg-amber-500 text-white shadow-amber-500/40"
                : rank === 2
                ? "bg-slate-300 text-slate-900 dark:bg-slate-600 dark:text-white"
                : rank === 3
                ? "bg-amber-700 text-white"
                : "bg-black/75 text-white"
            }`}
          >
            <span>#{rank}</span>
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating Badge on hover (top right) */}
        <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-lg shadow-lg flex items-center gap-1 border border-white/10">
          <Star size={10} className="text-amber-400 fill-amber-400" />
          <span className="text-[0.65rem] font-black text-amber-300">{calculateRating(novel.views).toFixed(1)}</span>
        </div>

        {/* Badges on hover */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <span className="text-[0.55rem] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/95 dark:bg-black/95 text-black dark:text-white backdrop-blur">
            {getTypeLabel(novel.type)}
          </span>
          <span className={`text-[0.55rem] font-black uppercase tracking-wider px-2 py-0.5 rounded-md backdrop-blur ${getStatusColor(novel.status)} bg-white/95 dark:bg-black/95`}>
            {getStatusLabel(novel.status)}
          </span>
        </div>
      </div>

      <h3 className="text-xs sm:text-sm font-bold line-clamp-2 leading-snug tracking-tight mb-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors text-[#2B1810] dark:text-[#f0f0f0]">
        {novel.title}
      </h3>

      <div className="flex justify-between items-center mt-auto pt-1">
        <span className="text-[0.65rem] opacity-50 font-medium truncate max-w-[65%]">{novel.author}</span>
        <span className="text-[0.6rem] opacity-40 font-black uppercase tracking-wider">
          {novel.type === "WEB" ? `${novel._count.chapters} Bab` : `${novel._count.volumes} Vol`}
        </span>
      </div>
    </Link>
  );

  const SectionHeader = ({
    title,
    icon: Icon,
    href,
    badge,
  }: {
    title: string;
    icon: any;
    href: string;
    badge?: string;
  }) => (
    <div className="flex items-center justify-between mb-6 pb-2 border-b border-black/5 dark:border-white/10">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
          <Icon size={18} />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#2B1810] dark:text-white flex items-center gap-2">
            <span>{title}</span>
            {badge && (
              <span className="text-[0.6rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300">
                {badge}
              </span>
            )}
          </h2>
        </div>
      </div>

      <Link
        href={href}
        className="group flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors"
      >
        <span>Lihat Semua</span>
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2B1810] dark:bg-[#0f0f0f] dark:text-[#e8e8e8] transition-colors duration-500 font-sans">
      {/* ─── UNIFIED RESPONSIVE NAVBAR ───────────────────────────── */}
      <Navbar currentTheme={theme} isAdmin={adminStatus} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* ─── HERO + NEW SLIDER ──────────────────────────────────── */}
        <section className="py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center w-full max-w-full">
            {/* New Releases Slider */}
            <div className="lg:col-span-7 w-full min-w-0 order-2 lg:order-1">
              <div className="min-h-[280px] sm:min-h-[320px] md:min-h-[340px] h-full">
                <NewSlider novels={newlyAddedNovels as any} />
              </div>
            </div>

            {/* Hero Text & Search CTA */}
            <div className="lg:col-span-5 w-full min-w-0 flex flex-col justify-center order-1 lg:order-2 text-center lg:text-left pl-0 lg:pl-2">
              {userId && userName ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4 mx-auto lg:mx-0 max-w-full">
                  <Sparkles size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 truncate">
                    Selamat datang kembali, <strong>{userName}</strong>!
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4 mx-auto lg:mx-0">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[0.65rem] font-black uppercase tracking-widest text-amber-800 dark:text-amber-300">
                    Platform Baca Novel Modern
                  </span>
                </div>
              )}

              <h1 className="text-2xl sm:text-4xl lg:text-3xl xl:text-4xl font-black tracking-tight leading-tight mb-3">
                Terangi Harimu Dengan{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500 dark:from-amber-400 dark:to-orange-400">
                  Kisah Terbaik.
                </span>
              </h1>

              <p className="text-xs sm:text-sm opacity-70 mb-6 leading-relaxed font-medium">
                Jelajahi koleksi Light Novel & Web Novel terpopuler dengan bab cerita terupdate setiap hari dan antarmuka yang nyaman di mata.
              </p>

              {/* Search bar & CTA */}
              <div className="flex flex-col gap-3 w-full">
                <form action="/browse" method="GET" className="relative w-full group">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-80 transition-opacity" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Cari judul, genre, penulis..."
                    className="w-full pl-9 pr-4 py-3 rounded-2xl bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-xs font-medium outline-none transition-all placeholder:opacity-40 shadow-sm"
                  />
                </form>

                <div className="flex gap-2.5">
                  <Link
                    href="/browse"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-2xl font-black uppercase tracking-wider text-xs hover:shadow-xl hover:shadow-amber-600/25 transition-all active:scale-[0.98] shadow-md shadow-amber-600/20"
                  >
                    <span>Mulai Membaca</span>
                    <Zap size={14} className="fill-current" />
                  </Link>
                  <Link
                    href="/browse?sort=popular"
                    className="flex items-center justify-center gap-1.5 px-4 py-3 bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl text-xs font-bold hover:bg-black/5 dark:hover:bg-white/10 transition-all shrink-0"
                  >
                    <Flame size={14} className="text-amber-600 dark:text-amber-400" />
                    <span className="hidden sm:inline">Paling Populer</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── GENRE QUICK ACCESS PILLS ───────────────────────────── */}
        {topGenres.length > 0 && (
          <section className="py-4 mb-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-[0.65rem] font-black uppercase tracking-wider opacity-40 shrink-0 mr-1 flex items-center gap-1">
                <Compass size={12} /> Kategori:
              </span>
              {topGenres.map((g: any) => (
                <Link
                  key={g.id}
                  href={`/browse?genre=${g.name}`}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-white/5 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 border border-black/5 dark:border-white/10 text-xs font-bold transition-all hover:border-amber-500/30"
                >
                  <span>{g.name}</span>
                  <span className="text-[0.6rem] opacity-40">({g._count.novels})</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── POPULAR / TRENDING SECTION ─────────────────────────── */}
        {popularNovels.length > 0 && (
          <section className="py-6">
            <SectionHeader
              title="Paling Populer"
              icon={Trophy}
              href="/browse?sort=popular"
              badge="Top Rated"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
              {popularNovels.map((novel, index) => (
                <NovelCard key={novel.id} novel={novel} rank={index + 1} />
              ))}
            </div>
          </section>
        )}

        {/* ─── LATEST UPDATES SECTION ─────────────────────────────── */}
        <section className="py-8">
          <SectionHeader
            title="Update Bab Terkini"
            icon={Clock}
            href="/browse?sort=updated"
            badge="Terbaru"
          />
          {latestUpdated.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
              {latestUpdated.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center opacity-30">
              <BookOpen size={40} className="mx-auto mb-3" strokeWidth={1} />
              <p className="text-sm font-bold uppercase tracking-widest">Belum ada novel tersedia</p>
            </div>
          )}
        </section>

        {/* ─── VALUE PROPOSITION / FEATURES HIGHLIGHT ─────────────── */}
        <section className="py-12 my-8 border-y border-black/5 dark:border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4 p-5 rounded-3xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 shrink-0">
                <Moon size={22} />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight mb-1">Soft Dark Mode</h3>
                <p className="text-xs opacity-60 leading-relaxed font-medium">
                  Dirancang khusus agar mata tidak cepat lelah saat membaca berjam-jam di malam hari.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-3xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 shrink-0">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight mb-1">Riwayat Otomatis</h3>
                <p className="text-xs opacity-60 leading-relaxed font-medium">
                  Bab terakhir yang Anda baca tersimpan otomatis di perangkat tanpa perlu menandai manual.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-3xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 shrink-0">
                <Smartphone size={22} />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight mb-1">Responsif di Semua Layar</h3>
                <p className="text-xs opacity-60 leading-relaxed font-medium">
                  Pengalaman membaca yang mulus baik melalui smartphone, tablet, maupun desktop browser.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─────────────────────────────────────────────── */}
      <footer className="border-t border-black/5 dark:border-white/5 py-12 mt-12 bg-white/40 dark:bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo variant="full" size="sm" />

          <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] opacity-30 text-center">
            © 2026 Lentera Baca. Terangi imajinasi di setiap bab cerita.
          </p>

          <div className="flex items-center gap-5 text-xs font-bold opacity-60">
            <Link href="/browse" className="hover:opacity-100 transition-opacity">Jelajah</Link>
            <Link href="/browse?sort=popular" className="hover:opacity-100 transition-opacity">Populer</Link>
            <Link href="/browse?sort=updated" className="hover:opacity-100 transition-opacity">Terbaru</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
