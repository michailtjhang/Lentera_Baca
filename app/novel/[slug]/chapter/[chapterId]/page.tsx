import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ReadingHistory from "@/components/ReadingHistory";

interface PageProps {
    params: Promise<{ slug: string; chapterId: string }>;
}

export default async function ReaderPage({ params }: PageProps) {
    const { slug, chapterId } = await params;
    const user = await currentUser();

    // Get user preference from Clerk metadata
    const theme = (user?.publicMetadata?.theme as string) || "light";

    // Find the chapter
    const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: { novel: true },
    });

    if (!chapter || chapter.novel.slug !== slug) {
        return notFound();
    }

    // Fetch previous and next chapters based on 'order'
    const [prevChapter, nextChapter] = await Promise.all([
        prisma.chapter.findFirst({
            where: {
                novelId: chapter.novelId,
                order: chapter.order - 1,
            },
        }),
        prisma.chapter.findFirst({
            where: {
                novelId: chapter.novelId,
                order: chapter.order + 1,
            },
        })
    ]);

    // Theme-based classes
    const isDark = theme === "dark";
    const themeClasses = isDark
        ? "bg-black text-gray-400"
        : "bg-[#F5F5DC] text-[#3E2723]";

    const basePath = `/novel/${slug}`;

    return (
        <div className={`min-h-screen transition-colors duration-500 ease-in-out ${themeClasses}`}>
            {/* Reading History Tracker */}
            <ReadingHistory
                novelId={chapter.novelId}
                chapterId={chapterId}
                chapterOrder={chapter.order}
                chapterTitle={chapter.title}
            />

            <main className="max-w-3xl mx-auto px-6 py-12 md:px-12">
                {/* Header */}
                <header className="mb-16 text-center">
                    <Link href={basePath} className="group flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 mb-10 transition-all">
                        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                        Kembali ke Novel
                    </Link>

                    {/* Top Navigation */}
                    <nav className="flex justify-between items-center mb-12 py-4 border-y border-black/5 dark:border-white/5">
                        {prevChapter ? (
                            <Link
                                href={`${basePath}/chapter/${prevChapter.id}`}
                                className={`flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl border transition-all active:scale-95 ${isDark ? "border-white/10 hover:bg-white/5 text-white" : "border-black/5 hover:bg-black/5 text-[#3E2723]"
                                    } shadow-sm`}
                            >
                                <ChevronLeft size={16} />
                                Prev
                            </Link>
                        ) : (
                            <div className="w-[85px]" />
                        )}

                        <div className="text-[0.6rem] font-black uppercase tracking-[0.3em] opacity-30">
                            Bab {chapter.order}
                        </div>

                        {nextChapter ? (
                            <Link
                                href={`${basePath}/chapter/${nextChapter.id}`}
                                className={`flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl border transition-all active:scale-95 ${isDark ? "border-white/10 hover:bg-white/5 text-white" : "border-black/5 hover:bg-black/5 text-[#3E2723]"
                                    } shadow-sm`}
                            >
                                Next
                                <ChevronRight size={16} />
                            </Link>
                        ) : (
                            <div className="w-[85px]" />
                        )}
                    </nav>

                    <h1 className="text-4xl font-black mb-4 tracking-tight leading-tight dark:text-white">{chapter.novel.title}</h1>
                    <h2 className="text-xl font-bold opacity-60 italic">Bab {chapter.order}: {chapter.title}</h2>
                </header>

                {/* Content */}
                <article className="font-serif text-[1.25rem] leading-[2] space-y-10 whitespace-pre-wrap selection:bg-[#3E2723]/10 dark:selection:bg-white/10 dark:text-gray-200">
                    {chapter.content}
                </article>

                {/* Bottom Navigation */}
                <nav className="mt-24 flex justify-between items-center border-t border-black/5 pt-12 dark:border-white/5">
                    {prevChapter ? (
                        <Link
                            href={`${basePath}/chapter/${prevChapter.id}`}
                            className={`flex items-center gap-3 px-8 py-4 rounded-2xl border font-bold transition-all active:scale-95 ${isDark ? "border-white/10 hover:bg-white/5 text-white" : "border-black/5 hover:bg-black/5 text-[#3E2723]"
                                } shadow-sm`}
                        >
                            <ChevronLeft size={20} />
                            Sebelumnya
                        </Link>
                    ) : (
                        <div />
                    )}

                    {nextChapter ? (
                        <Link
                            href={`${basePath}/chapter/${nextChapter.id}`}
                            className={`flex items-center gap-3 px-8 py-4 rounded-2xl border font-bold transition-all active:scale-95 ${isDark ? "border-white/10 hover:bg-white/5 text-white" : "border-black/5 hover:bg-black/5 text-[#3E2723]"
                                } shadow-sm`}
                        >
                            Selanjutnya
                            <ChevronRight size={20} />
                        </Link>
                    ) : (
                        <div />
                    )}
                </nav>

                {/* Theme Toggler */}
                <ThemeToggle currentTheme={theme} />
            </main>
        </div>
    );
}
