import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ReaderPage({ params }: PageProps) {
    const { id } = await params;
    const user = await currentUser();

    // Get user preference from Clerk metadata
    const theme = (user?.publicMetadata?.theme as string) || "light";

    // Try to find if 'id' is a Chapter
    let currentId = id;
    let chapter = await prisma.chapter.findUnique({
        where: { id: currentId },
        include: { novel: true },
    });

    // If not found, check if 'id' is a Novel ID and get its first chapter
    if (!chapter) {
        const novel = await prisma.novel.findUnique({
            where: { id: currentId },
            include: {
                chapters: {
                    orderBy: { order: 'asc' },
                    take: 1
                }
            }
        });

        if (novel && novel.chapters.length > 0) {
            chapter = {
                ...novel.chapters[0],
                novel: novel
            };
        }
    }

    if (!chapter) {
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

    return (
        <div className={`min-h-screen transition-colors duration-500 ${themeClasses}`}>
            <main className="max-w-2xl mx-auto px-6 py-12 md:px-8">
                {/* Header */}
                <header className="mb-10 text-center">
                    <Link href="/" className="text-sm font-medium opacity-60 hover:opacity-100 mb-2 inline-block transition-opacity">
                        ← Kembali ke Daftar
                    </Link>
                    <h1 className="text-3xl font-bold mb-2 tracking-tight">{chapter.novel.title}</h1>
                    <h2 className="text-lg font-medium opacity-70 italic">Bab {chapter.order}: {chapter.title}</h2>
                </header>

                {/* Content */}
                <article className="font-serif text-[1.2rem] leading-relaxed space-y-8 whitespace-pre-wrap selection:bg-black/10 selection:text-black dark:selection:bg-white/10 dark:selection:text-white">
                    {chapter.content}
                </article>

                {/* Navigation */}
                <nav className="mt-20 flex justify-between items-center border-t border-black/5 pt-10 dark:border-white/5">
                    {prevChapter ? (
                        <Link
                            href={`/novel/${prevChapter.id}`}
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
                            href={`/novel/${nextChapter.id}`}
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
