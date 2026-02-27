import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/admin";
import { Search } from "lucide-react";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string; tag?: string }>;
}) {
  const { userId } = await auth();
  const params = await searchParams;
  const { q, genre, tag } = params;

  // Build the filter
  const where: any = {};

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { author: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (genre) {
    where.genres = {
      some: { name: genre }
    };
  }

  if (tag) {
    where.tags = {
      some: { name: tag }
    };
  }

  // Fetch novels from database with filtering and counts
  const novels = await prisma.novel.findMany({
    where,
    include: {
      _count: {
        select: { chapters: true }
      },
      genres: true,
      tags: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch all genres for the filter bar
  const allGenres = await (prisma as any).genre.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="min-h-screen bg-[#F5F5DC] text-[#3E2723] dark:bg-black dark:text-gray-400 transition-colors duration-500 selection:bg-[#3E2723]/10">
      <nav className="border-b border-black/5 dark:border-white/5 px-6 py-4 backdrop-blur-xl sticky top-0 bg-white/70 dark:bg-black/70 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center justify-between w-full md:w-auto gap-8">
            <h1 className="text-2xl font-black tracking-tighter text-[#3E2723] dark:text-white">Lentera Baca</h1>
            <div className="md:hidden flex items-center gap-3">
              {await isAdmin() && (
                <Link href="/admin" className="p-2 bg-[#3E2723] dark:bg-white text-white dark:text-black rounded-full">
                  <span className="sr-only">Admin</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                </Link>
              )}
              {!userId ? (
                <Link href="/sign-in" className="text-xs font-bold uppercase tracking-widest">Login</Link>
              ) : (
                <UserButton />
              )}
            </div>
          </div>

          <form action="/" method="GET" className="relative flex-1 max-w-xl w-full group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Cari ribuan kisah menarik..."
              className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-white/10 focus:border-black/5 dark:focus:border-white/10 rounded-2xl px-12 py-3 focus:outline-none transition-all font-medium text-sm placeholder:opacity-40"
            />
          </form>

          <div className="hidden md:flex items-center gap-6">
            {await isAdmin() && (
              <Link
                href="/admin"
                className="text-xs font-black uppercase tracking-[0.2em] px-5 py-2.5 bg-[#3E2723] text-[#F5F5DC] dark:bg-white dark:text-black rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
              >
                Admin Panel
              </Link>
            )}
            {!userId ? (
              <Link
                href="/sign-in"
                className="text-xs font-black uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-all border-b border-black/20 dark:border-white/20"
              >
                Masuk
              </Link>
            ) : (
              <UserButton />
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <header className="mb-20 text-center">
          <h2 className="text-6xl font-black mb-6 tracking-tighter text-[#3E2723] dark:text-white leading-[0.9]">
            Koleksi <span className="opacity-20 block md:inline italic font-serif font-light">Novel</span>
          </h2>
          <p className="text-lg opacity-50 max-w-xl mx-auto leading-relaxed font-serif">
            Terangi imajinasimu dengan ribuan kisah menarik.
          </p>
        </header>

        {/* Filters */}
        <section className="mb-16">
          {allGenres.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/"
                className={`px-6 py-2.5 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest transition-all border-2 ${!genre ? 'bg-[#3E2723] text-[#F5F5DC] border-[#3E2723] dark:bg-white dark:text-black dark:border-white' : 'bg-white/20 dark:bg-white/5 border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10'}`}
              >
                Semua
              </Link>
              {allGenres.map((g: any) => (
                <Link
                  key={g.id}
                  href={`/?genre=${g.name}${q ? `&q=${q}` : ''}`}
                  className={`px-6 py-2.5 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest transition-all border-2 ${genre === g.name ? 'bg-[#3E2723] text-[#F5F5DC] border-[#3E2723] dark:bg-white dark:text-black dark:border-white' : 'bg-white/20 dark:bg-white/5 border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10'}`}
                >
                  {g.name}
                </Link>
              ))}
            </div>
          )}
        </section>

        {novels.length === 0 ? (
          <div className="bg-white/30 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-[2rem] p-24 text-center backdrop-blur-sm">
            <h3 className="text-2xl font-black mb-3 text-[#3E2723] dark:text-white">Tidak ditemukan</h3>
            <p className="opacity-40 mb-10 text-sm tracking-widest uppercase font-bold">"{q || genre || tag}"</p>
            <Link href="/" className="text-xs font-black uppercase tracking-[0.3em] border-b-2 border-black/10 dark:border-white/10 pb-1 hover:border-black/40 transition-all">Reset Pencarian</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
            {novels.map((novel: any) => (
              <Link
                key={novel.id}
                href={`/novel/${novel.slug}`}
                className="group flex flex-col"
              >
                {/* Cover Image Container */}
                <div className="relative aspect-[11/16] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#3E2723]/10 to-[#3E2723]/5 dark:from-white/10 dark:to-white/5 mb-6 shadow-sm group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.05)] transition-all duration-500 group-hover:-translate-y-2">
                  {novel.coverImage ? (
                    <img
                      src={novel.coverImage}
                      alt={`${novel.title} cover`}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[0.6rem] font-black uppercase tracking-widest opacity-20">
                      No Cover
                    </div>
                  )}

                  {/* Status Overlay */}
                  <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-[0.6rem] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/90 dark:bg-black/90 text-black dark:text-white backdrop-blur shadow-xl">
                      {(novel.status === 'ONGOING' ? 'On' : novel.status === 'COMPLETE' ? 'Done' : novel.status).toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col px-1">
                  <h3 className="text-sm font-black group-hover:text-black dark:group-hover:text-white transition-colors mb-2 line-clamp-2 leading-tight tracking-tight">{novel.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[0.65rem] font-bold opacity-40 uppercase tracking-widest truncate">{novel.author}</span>
                  </div>

                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex gap-1">
                      {novel.genres.slice(0, 1).map((g: any) => (
                        <span key={g.id} className="text-[0.55rem] font-black uppercase tracking-widest bg-[#3E2723]/5 dark:bg-white/5 text-[#3E2723]/40 dark:text-white/40 px-2 py-0.5 rounded-lg border border-black/5 dark:border-white/5">
                          {g.name}
                        </span>
                      ))}
                    </div>
                    <span className="text-[0.6rem] font-black opacity-20 uppercase tracking-widest">{novel._count.chapters} ch</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-24 border-t border-black/5 dark:border-white/5 opacity-20 text-[0.6rem] font-black tracking-[0.4em] text-center uppercase">
        © 2026 Lentera Baca. Terangi imajinasimu.
      </footer>
    </div>
  );
}
