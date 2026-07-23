import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/admin";
import { Search, ChevronLeft, SlidersHorizontal, Hash, BookOpen, Shield, X, Filter, ChevronDown } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface BrowseProps {
  searchParams: Promise<{ q?: string; genre?: string; tag?: string; sort?: string; type?: string; region?: string; status?: string }>;
}

export const metadata = {
  title: "Jelajah Novel | Lentera Baca",
  description: "Temukan berbagai macam genre novel menarik di Lentera Baca. Cari novel favorit Anda sekarang.",
};

export const revalidate = 60;

// Tags considered 18+ content
const ADULT_TAGS = ["18+", "adult", "mature", "r18", "smut", "ecchi"];

function isAdultTag(tagName: string): boolean {
  return ADULT_TAGS.some(a => tagName.toLowerCase().includes(a.toLowerCase()));
}

function isExplicitAdultFilter(tag?: string): boolean {
  if (!tag) return false;
  return isAdultTag(tag);
}

export default async function BrowsePage({ searchParams }: BrowseProps) {
  const { userId } = await auth();
  const user = await currentUser();
  const theme = (user?.publicMetadata?.theme as string) || "light";
  const adminStatus = await isAdmin();
  const params = await searchParams;
  const { q, genre, tag, sort, type, region, status } = params;

  const isAdultFilterActive = isExplicitAdultFilter(tag);

  const where: any = {};

  // Search query
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { author: { contains: q, mode: "insensitive" } },
      { genres: { some: { name: { contains: q, mode: "insensitive" } } } },
      { tags: { some: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }

  // Genre filter
  if (genre) {
    where.genres = { some: { name: genre } };
  }

  // Tag filter
  if (tag) {
    where.tags = { some: { name: tag } };
  }

  // Type filter
  if (type && type !== "ALL") {
    where.type = type;
  }

  // Region filter
  if (region && region !== "ALL") {
    where.region = region;
  }

  // Status filter
  if (status && status !== "ALL") {
    where.status = status;
  }

  // If no adult filter is active, exclude 18+ content by default
  if (!isAdultFilterActive) {
    where.NOT = {
      tags: {
        some: {
          OR: ADULT_TAGS.map(a => ({ name: { contains: a, mode: "insensitive" } })),
        },
      },
    };
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "updated") orderBy = { updatedAt: "desc" };
  if (sort === "popular") orderBy = { views: "desc" };
  if (sort === "newest") orderBy = { createdAt: "desc" };

  const [novelsResult, allGenres, allTags] = await Promise.all([
    prisma.novel.findMany({
      where,
      include: { _count: { select: { chapters: true, volumes: true } }, genres: true, tags: true } as any,
      orderBy,
    }),
    (prisma as any).genre.findMany({ orderBy: { name: "asc" } }),
    (prisma as any).tag.findMany({
      take: 30,
      orderBy: { novels: { _count: "desc" } },
    }),
  ]);

  const novels = novelsResult as any[];

  // Separate adult tags from regular tags
  const regularTags = allTags.filter((t: any) => !isAdultTag(t.name));
  const adultTagsList = allTags.filter((t: any) => isAdultTag(t.name));

  const hasActiveFilters = !!(q || genre || tag || (type && type !== "ALL") || (region && region !== "ALL") || (status && status !== "ALL"));

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const p: Record<string, string> = {};
    if (q) p.q = q;
    if (genre) p.genre = genre;
    if (tag) p.tag = tag;
    if (sort) p.sort = sort;
    if (type && type !== "ALL") p.type = type;
    if (region && region !== "ALL") p.region = region;
    if (status && status !== "ALL") p.status = status;

    // Apply overrides
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined || v === "ALL" || v === "") {
        delete p[k];
      } else {
        p[k] = v;
      }
    });

    const qs = new URLSearchParams(p).toString();
    return `/browse${qs ? `?${qs}` : ""}`;
  };

  const getTypeLabel = (t: string) => {
    const TYPE_LABELS: Record<string, string> = {
      WEB: "Web Novel",
      LIGHTNOVEL_WEB: "Light Novel",
    };
    return TYPE_LABELS[t] || t;
  };

  const getStatusLabel = (s: string) => {
    const map: Record<string, string> = {
      ONGOING: "Ongoing",
      COMPLETE: "Selesai",
      DROP: "Drop",
      HIATUS: "Hiatus",
    };
    return map[s] || s;
  };

  const getStatusColor = (s: string) => {
    if (s === "ONGOING") return "text-emerald-600 dark:text-emerald-400";
    if (s === "COMPLETE") return "text-blue-600 dark:text-blue-400";
    if (s === "DROP") return "text-red-500";
    return "text-amber-600 dark:text-amber-400";
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-[#3E2723] dark:bg-[#0f0f0f] dark:text-[#e8e8e8] transition-colors duration-500">
      {/* ─── NAVBAR ─────────────────────────────────────────────── */}
      <nav className="border-b border-black/5 dark:border-white/5 px-6 py-4 backdrop-blur-xl sticky top-0 bg-[#FDFCF0]/80 dark:bg-[#0f0f0f]/80 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-5">
            <Link href="/" className="group flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
              <ChevronLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
              Beranda
            </Link>
            <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
            <div className="flex items-center gap-2">
              <Filter size={14} className="opacity-40" />
              <h1 className="text-sm font-black tracking-tight">Jelajah</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle currentTheme={theme} variant="minimal" />
            <SignedIn><UserButton /></SignedIn>
            <SignedOut>
              <Link href="/sign-in" className="text-[0.65rem] font-black uppercase tracking-[0.15em] px-4 py-2 bg-[#3E2723] text-[#F5F5DC] dark:bg-white dark:text-black rounded-xl hover:shadow-lg transition-all active:scale-95">
                Masuk
              </Link>
            </SignedOut>
            {adminStatus && (
              <Link href="/admin" className="text-[0.65rem] font-black uppercase tracking-[0.15em] opacity-50 hover:opacity-100 flex items-center gap-1.5 transition-opacity">
                <Shield size={13} /> Admin
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ─── SEARCH BAR TOP ──────────────────────────────────────── */}
        <div className="mb-8">
          <form action="/browse" method="GET" className="relative group max-w-2xl">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-70 transition-opacity" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Cari judul, penulis, genre, tag..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white dark:bg-white/8 border border-black/8 dark:border-white/8 focus:border-black/20 dark:focus:border-white/20 focus:bg-white dark:focus:bg-white/12 text-sm font-medium outline-none transition-all placeholder:opacity-40 shadow-sm"
            />
            {genre && <input type="hidden" name="genre" value={genre} />}
            {tag && <input type="hidden" name="tag" value={tag} />}
            {type && type !== "ALL" && <input type="hidden" name="type" value={type} />}
            {region && region !== "ALL" && <input type="hidden" name="region" value={region} />}
            {status && status !== "ALL" && <input type="hidden" name="status" value={status} />}
            {sort && <input type="hidden" name="sort" value={sort} />}
          </form>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-[0.6rem] font-black uppercase tracking-widest opacity-40">Filter aktif:</span>
            {q && (
              <Link href={buildUrl({ q: undefined })} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-[0.65rem] font-bold border border-amber-200 dark:border-amber-700/50 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors">
                Carian: "{q}" <X size={10} />
              </Link>
            )}
            {genre && (
              <Link href={buildUrl({ genre: undefined })} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-[0.65rem] font-bold border border-blue-200 dark:border-blue-700/50 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                Genre: {genre} <X size={10} />
              </Link>
            )}
            {tag && (
              <Link href={buildUrl({ tag: undefined })} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.65rem] font-bold border transition-colors ${isAdultFilterActive ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700/50 hover:bg-red-200 dark:hover:bg-red-900/50" : "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700/50 hover:bg-purple-200 dark:hover:bg-purple-900/50"}`}>
                #{tag} <X size={10} />
              </Link>
            )}
            {type && type !== "ALL" && (
              <Link href={buildUrl({ type: undefined })} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-[0.65rem] font-bold border border-green-200 dark:border-green-700/50 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                {getTypeLabel(type)} <X size={10} />
              </Link>
            )}
            {region && region !== "ALL" && (
              <Link href={buildUrl({ region: undefined })} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-[0.65rem] font-bold border border-orange-200 dark:border-orange-700/50 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors">
                {region} <X size={10} />
              </Link>
            )}
            {status && status !== "ALL" && (
              <Link href={buildUrl({ status: undefined })} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-[0.65rem] font-bold border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                {getStatusLabel(status)} <X size={10} />
              </Link>
            )}
            <Link href="/browse" className="flex items-center gap-1.5 px-3 py-1.5 text-[0.65rem] font-bold opacity-40 hover:opacity-100 transition-opacity">
              Hapus Semua <X size={10} />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          {/* ─── SIDEBAR FILTERS ─────────────────────────────────── */}
          <aside className="space-y-8">
            {/* Sort */}
            <div>
              <p className="text-[0.6rem] font-black uppercase tracking-widest opacity-30 mb-3 flex items-center gap-2">
                <SlidersHorizontal size={11} /> Urutkan
              </p>
              <div className="flex flex-col gap-1">
                {[
                  { label: "Terbaru", value: "newest" },
                  { label: "Update Terakhir", value: "updated" },
                  { label: "Paling Populer", value: "popular" },
                ].map(s => (
                  <Link key={s.value} href={buildUrl({ sort: s.value })} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${(!sort && s.value === "newest") || sort === s.value ? "bg-[#3E2723] text-[#F5F5DC] dark:bg-white dark:text-black shadow-md" : "hover:bg-black/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100"}`}>
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <p className="text-[0.6rem] font-black uppercase tracking-widest opacity-30 mb-3 flex items-center gap-2">
                <BookOpen size={11} /> Tipe
              </p>
              <div className="flex flex-col gap-1">
                {[
                  { label: "Semua Tipe", value: "ALL" },
                  { label: "Web Novel", value: "WEB" },
                  { label: "Light Novel", value: "LIGHTNOVEL_WEB" },
                ].map(t => (
                  <Link key={t.value} href={buildUrl({ type: t.value })} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${(!type && t.value === "ALL") || type === t.value ? "bg-[#3E2723] text-[#F5F5DC] dark:bg-white dark:text-black shadow-md" : "hover:bg-black/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100"}`}>
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Region Filter */}
            <div>
              <p className="text-[0.6rem] font-black uppercase tracking-widest opacity-30 mb-3">🌏 Region</p>
              <div className="flex flex-col gap-1">
                {[
                  { label: "Semua Region", value: "ALL" },
                  { label: "🇯🇵 Jepang", value: "JAPAN" },
                  { label: "🇰🇷 Korea", value: "KOREA" },
                  { label: "🇨🇳 China", value: "CHINA" },
                  { label: "🌐 Lainnya", value: "OTHER" },
                ].map(r => (
                  <Link key={r.value} href={buildUrl({ region: r.value })} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${(!region && r.value === "ALL") || region === r.value ? "bg-[#3E2723] text-[#F5F5DC] dark:bg-white dark:text-black shadow-md" : "hover:bg-black/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100"}`}>
                    {r.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <p className="text-[0.6rem] font-black uppercase tracking-widest opacity-30 mb-3">📌 Status</p>
              <div className="flex flex-col gap-1">
                {[
                  { label: "Semua Status", value: "ALL" },
                  { label: "Ongoing", value: "ONGOING" },
                  { label: "Selesai", value: "COMPLETE" },
                  { label: "Hiatus", value: "HIATUS" },
                  { label: "Drop", value: "DROP" },
                ].map(s => (
                  <Link key={s.value} href={buildUrl({ status: s.value })} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${(!status && s.value === "ALL") || status === s.value ? "bg-[#3E2723] text-[#F5F5DC] dark:bg-white dark:text-black shadow-md" : "hover:bg-black/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100"}`}>
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Genres */}
            {allGenres.length > 0 && (
              <div>
                <p className="text-[0.6rem] font-black uppercase tracking-widest opacity-30 mb-3 flex items-center gap-2">
                  <SlidersHorizontal size={11} /> Genre
                </p>
                <div className="flex flex-col gap-1">
                  <Link href={buildUrl({ genre: undefined })} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${!genre ? "bg-[#3E2723] text-[#F5F5DC] dark:bg-white dark:text-black shadow-md" : "hover:bg-black/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100"}`}>
                    Semua Genre
                  </Link>
                  {allGenres.map((g: any) => (
                    <Link key={g.id} href={buildUrl({ genre: g.name })} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${genre === g.name ? "bg-[#3E2723] text-[#F5F5DC] dark:bg-white dark:text-black shadow-md" : "hover:bg-black/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100"}`}>
                      {g.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Tags */}
            {regularTags.length > 0 && (
              <div>
                <p className="text-[0.6rem] font-black uppercase tracking-widest opacity-30 mb-3 flex items-center gap-2">
                  <Hash size={11} /> Tags Populer
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link href={buildUrl({ tag: undefined })} className={`px-3 py-1.5 rounded-full text-[0.65rem] font-bold transition-all ${!tag ? "bg-[#3E2723] text-[#F5F5DC] dark:bg-white dark:text-black shadow-md" : "bg-black/5 dark:bg-white/5 opacity-60 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10"}`}>
                    #Semua
                  </Link>
                  {regularTags.map((t: any) => (
                    <Link key={t.id} href={buildUrl({ tag: t.name })} className={`px-3 py-1.5 rounded-full text-[0.65rem] font-bold transition-all ${tag === t.name ? "bg-[#3E2723] text-[#F5F5DC] dark:bg-white dark:text-black shadow-md" : "bg-black/5 dark:bg-white/5 opacity-60 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10"}`}>
                      #{t.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 18+ Tags (separated with warning) */}
            {adultTagsList.length > 0 && (
              <div className="border border-red-200 dark:border-red-900/40 rounded-2xl p-4 bg-red-50/50 dark:bg-red-950/20">
                <p className="text-[0.6rem] font-black uppercase tracking-widest text-red-500/70 mb-3 flex items-center gap-2">
                  🔞 Konten Dewasa
                </p>
                <p className="text-[0.6rem] opacity-50 mb-3 leading-relaxed">Konten ini tersembunyi secara default. Pilih filter untuk melihat.</p>
                <div className="flex flex-wrap gap-2">
                  {adultTagsList.map((t: any) => (
                    <Link key={t.id} href={buildUrl({ tag: t.name })} className={`px-3 py-1.5 rounded-full text-[0.65rem] font-bold transition-all ${tag === t.name ? "bg-red-500 text-white shadow-md" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50"}`}>
                      #{t.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* ─── RESULTS ─────────────────────────────────────────── */}
          <div>
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-xl font-black tracking-tight">{novels.length}</span>
                <span className="text-sm opacity-40 font-semibold">
                  novel ditemukan
                  {isAdultFilterActive && (
                    <span className="ml-2 text-red-500 font-bold text-[0.65rem] uppercase tracking-wider">(termasuk konten 18+)</span>
                  )}
                </span>
              </div>
            </div>

            {novels.length === 0 ? (
              <div className="py-24 text-center border-2 border-dashed border-black/8 dark:border-white/8 rounded-3xl">
                <Search size={40} className="mx-auto mb-4 opacity-15" strokeWidth={1.5} />
                <h3 className="text-lg font-black mb-2">Tidak ada hasil</h3>
                <p className="text-sm opacity-40 font-medium mb-6">Coba ubah filter atau kata kunci pencarian.</p>
                <Link href="/browse" className="inline-flex items-center gap-2 px-6 py-3 bg-[#3E2723] text-[#F5F5DC] dark:bg-white dark:text-black rounded-xl text-sm font-black hover:shadow-lg transition-all active:scale-95">
                  Reset Filter
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {novels.map((novel) => {
                  const hasAdultTag = novel.tags?.some((t: any) => isAdultTag(t.name));
                  return (
                    <Link key={novel.id} href={`/novel/${novel.slug}`} className="group flex flex-col">
                      <div className="relative aspect-[10/14] overflow-hidden rounded-2xl bg-zinc-200 dark:bg-zinc-800 mb-3 shadow-md group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500">
                        {novel.coverImage ? (
                          <img src={novel.coverImage} alt={novel.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-zinc-800 dark:to-zinc-700">
                            <BookOpen size={24} className="opacity-20" />
                          </div>
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {/* 18+ badge */}
                        {hasAdultTag && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-md text-[0.5rem] font-black uppercase tracking-widest shadow-lg">
                            18+
                          </div>
                        )}
                        {/* Type/status badges */}
                        <div className="absolute bottom-3 left-2 right-2 flex justify-between items-end translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <span className="text-[0.45rem] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-white/90 dark:bg-black/90 text-black dark:text-white backdrop-blur">
                            {novel.type === "WEB" ? "Web" : "LN"}
                          </span>
                          <span className="text-[0.45rem] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-black/80 text-white dark:bg-white/80 dark:text-black backdrop-blur">
                            {novel.status === "ONGOING" ? "On" : novel.status === "COMPLETE" ? "Done" : novel.status}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-[0.8rem] font-bold line-clamp-2 leading-snug tracking-tight mb-1.5 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                        {novel.title}
                      </h3>
                      <div className="flex justify-between items-center mt-auto">
                        <span className="text-[0.6rem] opacity-40 font-semibold truncate max-w-[65%]">{novel.author}</span>
                        <span className="text-[0.55rem] opacity-30 font-black uppercase">
                          {novel.type === "WEB" ? `${novel._count.chapters} Ch` : `${novel._count.volumes} Vol`}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
