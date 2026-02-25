import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
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
        ? "bg-black text-gray-300"
        : "bg-[#F5F5DC] text-[#3E2723]";

    const basePath = `/novel/${slug}`;

    return (
        <div className={`min-h-screen transition-colors duration-500 ${themeClasses}`}>
            {/* Reading History Tracker */}
            <ReadingHistory
                novelId={chapter.novelId}
                chapterId={chapterId}
                chapterOrder={chapter.order}
                chapterTitle={chapter.title}
            />

            <main className="max-w-2xl mx-auto px-6 py-12 md:px-8">
                {/* Header */}
                <header className="mb-10 text-center">
                    <Link href={basePath} className="text-sm font-medium opacity-60 hover:opacity-100 mb-6 inline-block transition-opacity">
                        ← Kembali ke Novel
                    </Link>

                    {/* Top Navigation */}
                    <nav className="flex justify-between items-center mb-10 pb-6 border-b border-black/5 dark:border-white/5">
                        {prevChapter ? (
                            <Link
                                href={`${basePath}/chapter/${prevChapter.id}`}
                                className={`text-sm font-bold px-4 py-2 rounded-lg border transition-all active:scale-95 ${isDark ? "border-white/10 hover:bg-white/5" : "border-black/5 hover:bg-black/5"
                                    }`}
                            >
                                ← Seb
                            </Link>
                        ) : (
                            <div />
                        )}

                        <div className="text-xs font-bold uppercase tracking-widest opacity-40">
                            Bab {chapter.order}
                        </div>

                        {nextChapter ? (
                            <Link
                                href={`${basePath}/chapter/${nextChapter.id}`}
                                className={`text-sm font-bold px-4 py-2 rounded-lg border transition-all active:scale-95 ${isDark ? "border-white/10 hover:bg-white/5" : "border-black/5 hover:bg-black/5"
                                    }`}
                            >
                                Sel →
                            </Link>
                        ) : (
                            <div />
                        )}
                    </nav>

                    <h1 className="text-3xl font-bold mb-2 tracking-tight">{chapter.novel.title}</h1>
                    <h2 className="text-lg font-medium opacity-70 italic">Bab {chapter.order}: {chapter.title}</h2>
                </header>

                {/* Content */}
                <article className="font-serif text-[1.2rem] leading-relaxed space-y-8 whitespace-pre-wrap selection:bg-black/10 selection:text-black dark:selection:bg-white/10 dark:selection:text-white">
                    {chapter.content}
                </article>

                {/* Bottom Navigation */}
                <nav className="mt-20 flex justify-between items-center border-t border-black/5 pt-10 dark:border-white/5">
                    {prevChapter ? (
                        <Link
                            href={`${basePath}/chapter/${prevChapter.id}`}
                            className={`px-8 py-3 rounded-xl border transition-all active:scale-95 ${isDark ? "border-white/10 hover:bg-white/5" : "border-black/5 hover:bg-black/5"
                                }`}
                        >
                            Sebelumnya
                        </Link>
                    ) : (
                        <div />
                    )}

                    {nextChapter ? (
                        <Link
                            href={`${basePath}/chapter/${nextChapter.id}`}
                            className={`px-8 py-3 rounded-xl border transition-all active:scale-95 ${isDark ? "border-white/10 hover:bg-white/5" : "border-black/5 hover:bg-black/5"
                                }`}
                        >
                            Selanjutnya
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
