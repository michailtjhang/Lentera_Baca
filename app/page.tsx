import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/admin";
import { Search, Hash, Star, Zap, Clock, ChevronRight } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default async function Home() {
  const { userId } = await auth();
  const user = await currentUser();
  const theme = (user?.publicMetadata?.theme as string) || "light";

  // Fetch novels for different sections
  const [latestUpdated, newestNovels, trendingNovels] = await Promise.all([
    // 1. Latest Updated (by update time)
    prisma.novel.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { chapters: true } }, genres: true }
    }),
    // 2. Newest (by creation time)
    prisma.novel.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { chapters: true } }, genres: true }
    }),
    // 3. Trending (Simulated for now by using a mix or specific titles if we had popularity score)
    prisma.novel.findMany({
      take: 10,
      orderBy: { chapters: { _count: 'desc' } }, // More chapters as a proxy for popularity for now
      include: { _count: { select: { chapters: true } }, genres: true }
    })
  ]);

  const NovelSection = ({ title, icon: Icon, novels, href }: { title: string, icon: any, novels: any[], href: string }) => (
    <section className="mb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#3E2723] dark:bg-white text-white dark:text-black rounded-xl">
            <Icon size={18} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">{title}</h2>
        </div>
        <Link href={href} className="group text-[0.6rem] font-black uppercase tracking-widest opacity-40 hover:opacity-100 flex items-center gap-1 transition-all">
          Lihat Semua <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {novels.map((novel) => (
          <Link key={novel.id} href={`/novel/${novel.slug}`} className="group flex flex-col">
            <div className="relative aspect-[10/14] overflow-hidden rounded-[2rem] bg-zinc-200 dark:bg-zinc-800 mb-4 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500">
              {novel.coverImage ? (
                <img src={novel.coverImage} alt={novel.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[0.6rem] opacity-20 uppercase font-black">No Cover</div>
              )}
              <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                <span className="text-[0.55rem] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-full bg-white/90 dark:bg-black/90 text-black dark:text-white backdrop-blur shadow-xl">
                  {(novel.status === 'ONGOING' ? 'On' : novel.status === 'COMPLETE' ? 'Done' : novel.status).toLowerCase()}
                </span>
              </div>
            </div>
            <h3 className="text-sm font-black line-clamp-2 leading-tight tracking-tight mb-2 group-hover:text-black dark:group-hover:text-white transition-colors">{novel.title}</h3>
            <div className="flex justify-between items-center mt-auto opacity-40 text-[0.55rem] font-black uppercase tracking-widest">
              <span>{novel.author}</span>
              <span>{novel._count.chapters} ch</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-[#F5F5DC] text-[#3E2723] dark:bg-[#121212] dark:text-[#e0e0e0] transition-colors duration-500">
      <nav className="border-b border-black/5 dark:border-white/5 px-6 py-4 backdrop-blur-xl sticky top-0 bg-white/70 dark:bg-black/70 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-8">
          <Link href="/" className="text-2xl font-black tracking-tighter shrink-0">Lentera Baca</Link>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8">
              <Link href="/browse" className="text-[0.65rem] font-black uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity flex items-center gap-2">
                <Search size={14} /> Jelajah
              </Link>
              {await isAdmin() && (
                <Link href="/admin" className="text-[0.65rem] font-black uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity">
                  Admin
                </Link>
              )}
            </div>

            <div className="h-4 w-px bg-black/10 dark:bg-white/10 hidden md:block" />

            <div className="flex items-center gap-4">
              <ThemeToggle currentTheme={theme} variant="minimal" />
              <SignedIn>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <Link href="/sign-in" className="text-[0.65rem] font-black uppercase tracking-[0.2em] px-5 py-2.5 bg-[#3E2723] text-[#F5F5DC] dark:bg-white dark:text-black rounded-xl hover:shadow-xl transition-all active:scale-95">
                  Masuk
                </Link>
              </SignedOut>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <header className="mb-24 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3E2723]/5 dark:bg-white/5 border border-black/5 dark:border-white/5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[0.6rem] font-black uppercase tracking-widest opacity-40">Terangi Imajinasi Anda</span>
          </div>
          <h2 className="text-7xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.85] text-center max-w-4xl">
            Eksplorasi Dunia <span className="opacity-20 italic font-serif font-light">Tanpa</span> Batas.
          </h2>
          <Link href="/browse" className="group flex items-center gap-3 px-10 py-5 bg-[#3E2723] dark:bg-white text-[#F5F5DC] dark:text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-[0.7rem] hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95">
            Mulai Jelajahi
            <Zap size={16} className="fill-current" />
          </Link>
        </header>

        <NovelSection title="Update Terkini" icon={Clock} novels={latestUpdated} href="/browse?sort=updated" />
        <NovelSection title="Novel Terbaru" icon={Clock} novels={newestNovels} href="/browse?sort=newest" />
        <NovelSection title="Paling Populer" icon={Star} novels={trendingNovels} href="/browse?sort=popular" />
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-24 border-t border-black/5 dark:border-white/5 opacity-20 text-[0.6rem] font-black tracking-[0.3em] text-center uppercase">
        © 2026 Lentera Baca. Terangi segalanya.
      </footer>
    </div>
  );
}
