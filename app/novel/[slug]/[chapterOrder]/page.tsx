import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserButton, SignedIn } from "@clerk/nextjs";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ReadingHistory from "@/components/ReadingHistory";

interface PageProps {
    params: Promise<{ slug: string; chapterOrder: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { slug, chapterOrder } = await params;
    const orderNumber = parseInt(chapterOrder.replace("chapter-", ""));
    const chapter = await prisma.chapter.findFirst({
        where: { order: orderNumber, novel: { slug: slug } },
        include: { novel: true },
    });

    if (!chapter) return { title: "Bab Tidak Ditemukan" };

    return {
        title: `Bab ${chapter.order}: ${chapter.title} - ${chapter.novel.title}`,
        description: `Baca ${chapter.novel.title} Bab ${chapter.order}: ${chapter.title} di Lentera Baca.`,
    };
}

export default async function ReaderPage({ params }: PageProps) {

    const { slug, chapterOrder } = await params;
    const user = await currentUser();
    const theme = (user?.publicMetadata?.theme as string) || "light";

    // Parse order from "chapter-1", "chapter-2", etc.
    const orderNumber = parseInt(chapterOrder.replace("chapter-", ""));
    if (isNaN(orderNumber)) return notFound();

    const chapter = await prisma.chapter.findFirst({
        where: { order: orderNumber, novel: { slug: slug } },
        include: { novel: true },
    });

    if (!chapter) return notFound();

    const [prevChapter, nextChapter] = await Promise.all([
        prisma.chapter.findFirst({
            where: { novelId: chapter.novelId, order: chapter.order - 1 },
        }),
        prisma.chapter.findFirst({
            where: { novelId: chapter.novelId, order: chapter.order + 1 },
        })
    ]);

    const basePath = `/novel/${slug}`;

    return (
        <div className="min-h-screen transition-colors duration-500 ease-in-out bg-[#F5F5DC] text-[#3E2723] dark:bg-[#121212] dark:text-[#e0e0e0]">
            <ReadingHistory
                novelId={chapter.novelId}
                chapterId={chapter.id}
                chapterOrder={chapter.order}
                chapterTitle={chapter.title}
            />

            <nav className="border-b border-black/5 dark:border-white/5 px-6 py-4 backdrop-blur-xl sticky top-0 bg-white/70 dark:bg-black/70 z-50">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-2xl font-black tracking-tighter">Lentera Baca</Link>
                        <div className="hidden md:flex h-4 w-px bg-black/10 dark:bg-white/10" />
                        <Link href={basePath} className="hidden md:flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity">
                            <BookOpen size={14} /> Kembali ke Novel
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle currentTheme={theme} variant="minimal" />
                        <SignedIn><UserButton /></SignedIn>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-6 py-12 md:px-12">
                <header className="mb-16 text-center">
                    <nav className="flex justify-between items-center mb-12 py-4 border-y border-black/5 dark:border-white/5">
                        {prevChapter ? (
                            <Link
                                href={`${basePath}/chapter-${prevChapter.order}`}
                                className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl border transition-all active:scale-95 border-black/5 hover:bg-black/5 text-[#3E2723] dark:border-white/10 dark:hover:bg-white/5 dark:text-white shadow-sm"
                            >
                                <ChevronLeft size={16} /> Prev
                            </Link>
                        ) : (<div className="w-[85px]" />)}

                        <div className="flex flex-col items-center gap-1">
                            <div className="text-[0.6rem] font-black uppercase tracking-[0.3em] opacity-30 dark:text-gray-500">
                                Bab {chapter.order}
                            </div>
                            <Link href={basePath} className="text-[0.6rem] font-black uppercase tracking-[0.1em] opacity-60 hover:opacity-100 transition-opacity border-b border-current dark:text-gray-400">
                                Daftar Isi
                            </Link>
                        </div>

                        {nextChapter ? (
                            <Link
                                href={`${basePath}/chapter-${nextChapter.order}`}
                                className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl border transition-all active:scale-95 border-black/5 hover:bg-black/5 text-[#3E2723] dark:border-white/10 dark:hover:bg-white/5 dark:text-white shadow-sm"
                            >
                                Next <ChevronRight size={16} />
                            </Link>
                        ) : (<div className="w-[85px]" />)}
                    </nav>

                    <h1 className="text-4xl font-black mb-4 tracking-tight leading-tight dark:text-white">{chapter.novel.title}</h1>
                    <h2 className="text-xl font-bold opacity-60 italic dark:text-gray-400">Bab {chapter.order}: {chapter.title}</h2>
                </header>

                <article className="font-serif text-[1.25rem] leading-[2] space-y-10 whitespace-pre-wrap selection:bg-[#3E2723]/10 dark:selection:bg-white/10 text-[#3E2723] dark:text-gray-200">
                    {chapter.content}
                </article>

                <nav className="mt-24 flex justify-between items-center border-t border-black/5 pt-12 dark:border-white/5">
                    {prevChapter ? (
                        <Link
                            href={`${basePath}/chapter-${prevChapter.order}`}
                            className="flex items-center justify-center w-14 h-14 rounded-2xl border transition-all active:scale-95 border-black/5 hover:bg-black/5 text-[#3E2723] dark:border-white/10 dark:hover:bg-white/5 dark:text-white shadow-sm"
                            title="Sebelumnya"
                        >
                            <ChevronLeft size={24} />
                        </Link>
                    ) : (<div className="w-14" />)}

                    <Link href={basePath} className="flex items-center gap-2 px-8 h-14 rounded-2xl border font-bold transition-all active:scale-95 border-black/5 hover:bg-black/5 text-[#3E2723] dark:border-white/10 dark:hover:bg-white/5 dark:text-white shadow-sm">
                        Daftar Isi
                    </Link>

                    {nextChapter ? (
                        <Link
                            href={`${basePath}/chapter-${nextChapter.order}`}
                            className="flex items-center justify-center w-14 h-14 rounded-2xl border transition-all active:scale-95 border-black/5 hover:bg-black/5 text-[#3E2723] dark:border-white/10 dark:hover:bg-white/5 dark:text-white shadow-sm"
                            title="Selanjutnya"
                        >
                            <ChevronRight size={24} />
                        </Link>
                    ) : (<div className="w-14" />)}

                </nav>
            </main>
        </div>


    );
}
