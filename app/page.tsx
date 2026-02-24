import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/admin";

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
    <div className="min-h-screen bg-[#F5F5DC] text-[#3E2723] transition-colors duration-500 selection:bg-black/10">
      <nav className="border-b border-black/5 px-6 py-4 backdrop-blur-sm sticky top-0 bg-white/50 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Lentera Baca</h1>
          <div className="flex items-center gap-4">
            {await isAdmin() && (
              <Link
                href="/admin"
                className="text-sm font-bold bg-[#3E2723] text-[#F5F5DC] px-4 py-2 rounded-lg hover:shadow-md transition-all active:scale-95"
              >
                Admin Panel
              </Link>
            )}
            {!userId ? (
              <Link
                href="/sign-in"
                className="text-sm font-medium hover:underline transition-all"
              >
                Masuk
              </Link>
            ) : (
              <UserButton />
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Koleksi Novel</h2>
          <p className="text-lg opacity-70 max-w-2xl leading-relaxed">
            Terangi imajinasimu dengan ribuan kisah menarik. Selamat datang di Lentera Baca.
          </p>
        </header>

        {/* Search and Filters */}
        <section className="mb-12 space-y-6">
          <form action="/" method="GET" className="relative group">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Cari judul atau penulis..."
              className="w-full bg-white/60 border border-black/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 transition-all font-medium text-lg placeholder:opacity-40"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#3E2723] text-white px-4 py-2 rounded-xl font-bold text-sm hover:shadow-lg transition-all active:scale-95">
              Cari
            </button>
          </form>

          {allGenres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Link
                href="/"
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${!genre ? 'bg-[#3E2723] text-[#F5F5DC] border-[#3E2723]' : 'bg-white/40 border-black/5 hover:bg-white hover:border-black/10'}`}
              >
                Semua
              </Link>
              {allGenres.map((g: any) => (
                <Link
                  key={g.id}
                  href={`/?genre=${g.name}${q ? `&q=${q}` : ''}`}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${genre === g.name ? 'bg-[#3E2723] text-[#F5F5DC] border-[#3E2723]' : 'bg-white/40 border-black/5 hover:bg-white hover:border-black/10'}`}
                >
                  {g.name}
                </Link>
              ))}
            </div>
          )}
        </section>

        {novels.length === 0 ? (
          <div className="bg-white/40 border border-black/5 rounded-2xl p-12 text-center">
            <h3 className="text-xl font-semibold mb-2">Tidak ditemukan novel</h3>
            <p className="opacity-60 mb-8">Pencarian untuk "{q || genre || tag}" tidak membuahkan hasil.</p>
            <Link href="/" className="text-sm font-bold underline">Lihat Semua Koleksi</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {novels.map((novel: any) => (
              <Link
                key={novel.id}
                href={`/novel/${novel.id}`}
                className="group bg-white/60 hover:bg-white border border-black/5 p-6 rounded-2xl transition-all hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-wrap gap-1">
                    {novel.genres.slice(0, 2).map((g: any) => (
                      <span key={g.id} className="text-[10px] font-bold uppercase tracking-widest bg-[#3E2723]/5 text-[#3E2723]/60 px-2 py-0.5 rounded">
                        {g.name}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-black/5 rounded-full">
                    {novel._count.chapters} Bab
                  </span>
                </div>

                <h3 className="text-xl font-bold group-hover:text-black transition-colors mb-1">{novel.title}</h3>
                <p className="text-sm opacity-60 mb-4 italic">Oleh {novel.author}</p>

                <p className="text-sm opacity-80 line-clamp-2 leading-relaxed mb-6 flex-grow">
                  {novel.description || "Tidak ada deskripsi tersedia."}
                </p>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {novel.tags.slice(0, 3).map((t: any) => (
                      <span key={t.id} className="text-[10px] font-medium opacity-40">
                        #{t.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    Baca Sekarang →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-black/5 opacity-40 text-sm text-center">
        © 2026 Lentera Baca. Dibuat dengan cinta untuk para pembaca.
      </footer>
    </div>
  );
}
