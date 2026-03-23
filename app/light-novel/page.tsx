import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookMarked, User, Tag } from "lucide-react";

export default async function LightNovelListPage() {
    const lightNovels = await prisma.lightNovel.findMany({
        include: { genres: true },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen bg-[#FDFCF0] text-[#1A1A1A] pb-20">
            {/* Header Section */}
            <div className="bg-black text-white px-8 py-24 text-center">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">Archive.</h1>
                <p className="max-w-xl mx-auto text-white/40 font-bold uppercase tracking-[0.3em] text-sm leading-relaxed">
                    Koleksi Lengkap Light Novel Premium dalam Format PDF & EPUB.
                </p>
            </div>

            <main className="max-w-7xl mx-auto px-8 -mt-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {lightNovels.map((ln: any) => (
                        <Link 
                            key={ln.id} 
                            href={`/light-novel/${ln.slug}`}
                            className="group flex flex-col"
                        >
                            {/* Card Image */}
                            <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-black/5 mb-6 shadow-xl shadow-black/5 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-black/10">
                                {ln.coverImage ? (
                                    <img 
                                        src={ln.coverImage} 
                                        alt={ln.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-20">
                                        <BookMarked size={48} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                                    <span className="text-white text-[0.6rem] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                                        Baca Segera
                                    </span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="px-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[0.6rem] font-black uppercase tracking-widest text-black/30 flex items-center gap-1">
                                        <Tag size={10} />
                                        {ln.genres[0]?.name || "Uncategorized"}
                                    </span>
                                </div>
                                <h3 className="font-black text-xl tracking-tight leading-tight mb-2 group-hover:text-black transition-colors line-clamp-2">
                                    {ln.title}
                                </h3>
                                <p className="text-[0.7rem] font-bold text-black/30 uppercase tracking-widest flex items-center gap-1.5">
                                    <User size={10} />
                                    {ln.author}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {lightNovels.length === 0 && (
                    <div className="bg-white border-2 border-dashed border-black/5 rounded-[4rem] p-32 text-center mt-20">
                        <BookMarked className="mx-auto mb-8 text-black/5" size={80} />
                        <h3 className="text-2xl font-black tracking-tight mb-2">Belum ada koleksi.</h3>
                        <p className="text-black/30 font-bold uppercase tracking-widest text-xs">Admin belum menambahkan Light Novel.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
