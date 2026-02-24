import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  // Fetch novels from database
  const novels = await prisma.novel.findMany({
    include: {
      _count: {
        select: { chapters: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-[#F5F5DC] text-[#3E2723] transition-colors duration-500 selection:bg-black/10">
      <nav className="border-b border-black/5 px-6 py-4 backdrop-blur-sm sticky top-0 bg-white/50 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Lentera Baca</h1>
          <div className="flex items-center gap-4">
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
            Terangi imajinasimu dengan ribuan kisah menarik. Selamat datang di Lentera Baca,
            e-reader yang dioptimalkan untuk kenyamanan mata Anda.
          </p>
        </header>

        {novels.length === 0 ? (
          <div className="bg-white/40 border border-black/5 rounded-2xl p-12 text-center">
            <h3 className="text-xl font-semibold mb-2">Belum ada novel tersedia</h3>
            <p className="opacity-60 mb-8">Oops! Koleksi kami masih kosong saat ini.</p>
            <div className="inline-flex gap-4">
              {/* Optional: Add a 'Seed Database' button or instruction */}
              <p className="text-sm italic">Silakan jalankan script seed untuk menambahkan data simulasi.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {novels.map((novel: any) => (
              <Link
                key={novel.id}
                href={`/novel/${novel.id}`} // This link should logically point to the list of chapters or first chapter
                className="group bg-white/60 hover:bg-white border border-black/5 p-6 rounded-2xl transition-all hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-40">Novel</span>
                  <span className="text-xs font-semibold px-2 py-1 bg-black/5 rounded-full">
                    {novel._count.chapters} Bab
                  </span>
                </div>
                <h3 className="text-xl font-bold group-hover:text-black transition-colors mb-2">{novel.title}</h3>
                <p className="text-sm opacity-60 mb-4 italic">Oleh {novel.author}</p>
                <p className="text-sm opacity-80 line-clamp-2 leading-relaxed mb-4">
                  {novel.description || "Tidak ada deskripsi tersedia."}
                </p>
                <div className="flex items-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Baca Sekarang →
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
