import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, User, Tag, Clock, ChevronRight } from "lucide-react";

export default async function LightNovelDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const ln = await prisma.lightNovel.findUnique({
        where: { slug },
        include: { genres: true },
    });

    if (!ln) notFound();

    return (
        <div className="min-h-screen bg-[#FDFCF0] text-[#1A1A1A] pb-32">
            {/* Minimal Nav */}
            <nav className="px-8 py-8">
                <div className="max-w-7xl mx-auto flex items-center gap-4 text-[0.7rem] font-black uppercase tracking-widest text-black/30">
                    <Link href="/" className="hover:text-black transition-colors">Home</Link>
                    <ChevronRight size={12} />
                    <Link href="/light-novel" className="hover:text-black transition-colors">Light Novel</Link>
                    <ChevronRight size={12} />
                    <span className="text-black/60">{ln.title}</span>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-8 mt-12">
                <div className="flex flex-col lg:flex-row gap-16 items-start">
                    {/* Left: Cover */}
                    <div className="w-full lg:w-96 flex-shrink-0">
                        <div className="aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl shadow-black/10 border-8 border-white">
                            {ln.coverImage ? (
                                <img src={ln.coverImage} alt={ln.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-black/5 flex items-center justify-center">
                                    <BookOpen size={64} className="opacity-10" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="flex-1">
                        <div className="flex flex-wrap gap-4 mb-8">
                            {ln.genres.map((g: any) => (
                                <span key={g.id} className="bg-black text-white px-5 py-2 rounded-full text-[0.6rem] font-black uppercase tracking-[0.2em]">
                                    {g.name}
                                </span>
                            ))}
                            <span className="bg-white border border-black/10 px-5 py-2 rounded-full text-[0.6rem] font-black uppercase tracking-[0.2em] text-black/40">
                                {ln.status}
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8">
                            {ln.title}
                        </h1>

                        <div className="grid grid-cols-2 gap-8 mb-12 border-y border-black/5 py-10">
                            <div>
                                <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-black/20 mb-2">Author</p>
                                <p className="font-black text-xl flex items-center gap-3">
                                    <User size={20} className="text-black/20" />
                                    {ln.author}
                                </p>
                            </div>
                            <div>
                                <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-black/20 mb-2">File Type</p>
                                <p className="font-black text-xl flex items-center gap-3">
                                    <BookOpen size={20} className="text-black/20" />
                                    {ln.fileType}
                                </p>
                            </div>
                        </div>

                        <div className="mb-16">
                            <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-black/20 mb-6">Synopsis</p>
                            <p className="text-xl font-medium leading-relaxed opacity-60 italic">
                                {ln.description || "Belum ada deskripsi untuk novel ini."}
                            </p>
                        </div>

                        <Link 
                            href={`/light-novel/${ln.slug}/read`}
                            className="inline-flex items-center gap-4 bg-black text-white px-12 py-6 rounded-[2rem] font-black text-lg hover:scale-[1.03] active:scale-[0.97] transition-all shadow-2xl shadow-black/20"
                        >
                            Baca Sekarang
                            <ChevronRight size={24} />
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
