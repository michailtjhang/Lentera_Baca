import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ChevronLeft, ChevronRight, BookOpen, Lock, ShieldAlert, Sparkles, LogIn } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ReadingHistory from "@/components/ReadingHistory";
import { getChapterBySlug, getChapterSlug, formatChapterTitle } from "@/lib/slug-utils";
import { ChapterType } from "@prisma/client";
import { incrementView } from "@/app/actions/novel-actions";

interface PageProps {
    params: Promise<{ slug: string; chapterOrder: string }>;
}

export const revalidate = 300;

const ADULT_TAGS = ["18+", "adult", "mature", "r18", "smut", "ecchi"];

function isAdultContent(tags?: any[]): boolean {
    if (!tags || tags.length === 0) return false;
    return tags.some((tag: any) =>
        ADULT_TAGS.some(adult => tag.name.toLowerCase().includes(adult.toLowerCase()))
    );
}

export async function generateMetadata({ params }: PageProps) {
    const { slug, chapterOrder } = await params;
    
    const novel = await prisma.novel.findUnique({
        where: { slug: slug },
        include: { chapters: { orderBy: { order: 'asc' } }, tags: true }
    });
    
    if (!novel) return { title: "Novel Tidak Ditemukan" };
    
    const chapter = getChapterBySlug(chapterOrder, novel.chapters) as any;
    if (!chapter) return { title: "Chapter Tidak Ditemukan" };
    chapter.novel = novel;

    const chapterName = formatChapterTitle(chapter, novel.chapters);

    return {
        title: `${chapterName} - ${chapter.novel.title}`,
        description: `Baca ${chapter.novel.title} ${chapterName} di Lentera Baca.`,
    };
}

export default async function ReaderPage({ params }: PageProps) {

    const { slug, chapterOrder } = await params;
    const user = await currentUser();
    const theme = (user?.publicMetadata?.theme as string) || "light";

    const novel = await prisma.novel.findUnique({
        where: { slug },
        include: { chapters: { orderBy: { order: 'asc' } }, tags: true }
    });

    if (!novel) return notFound();

    const chapter = getChapterBySlug(chapterOrder, novel.chapters) as any;
    if (!chapter) return notFound();
    chapter.novel = novel;

    const currentIndex = novel.chapters.findIndex(c => c.id === chapter.id);
    const prevChapter = novel.chapters[currentIndex - 1];
    const nextChapter = novel.chapters[currentIndex + 1];

    const isAdult = isAdultContent(novel.tags);
    const isLoggedIn = !!user;
    const basePath = `/novel/${slug}`;

    // 🛑 18+ Access Gate for Unauthenticated Users
    if (isAdult && !isLoggedIn) {
        return (
            <div className="min-h-screen bg-[#FDFCF0] text-[#3E2723] dark:bg-[#121212] dark:text-[#e0e0e0] flex flex-col">
                <nav className="border-b border-black/5 dark:border-white/5 px-6 py-4 backdrop-blur-xl sticky top-0 bg-white/70 dark:bg-black/70 z-50">
                    <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <Link href="/" className="text-2xl font-black tracking-tighter">Lentera Baca</Link>
                        <div className="flex items-center gap-4">
                            <ThemeToggle currentTheme={theme} variant="minimal" />
                            <Link href="/sign-in" className="text-[0.65rem] font-black uppercase tracking-[0.15em] px-4 py-2 bg-[#3E2723] text-[#F5F5DC] dark:bg-white dark:text-black rounded-xl hover:shadow-lg transition-all">
                                Masuk
                            </Link>
                        </div>
                    </div>
                </nav>

                <main className="flex-1 flex items-center justify-center p-6">
                    <div className="max-w-md w-full p-8 md:p-10 bg-white dark:bg-white/5 border border-red-500/20 dark:border-red-500/30 rounded-[2.5rem] shadow-2xl text-center space-y-6">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                            <ShieldAlert size={32} />
                        </div>
                        <div>
                            <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                                Konten Dewasa (18+)
                            </span>
                            <h2 className="text-2xl font-black tracking-tight mt-4 mb-2">{novel.title}</h2>
                            <p className="text-xs opacity-60 font-medium leading-relaxed">
                                Novel ini dikategorikan khusus untuk pengguna 18 tahun ke atas. Silakan masuk atau buat akun terlebih dahulu untuk melanjutkan membaca.
                            </p>
                        </div>

                        <div className="space-y-3 pt-2">
                            <Link
                                href={`/sign-in?redirect_url=/novel/${slug}/${chapterOrder}`}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl transition-all active:scale-95 shadow-md shadow-red-700/20"
                            >
                                <LogIn size={16} />
                                Masuk Untuk Membaca
                            </Link>
                            <Link
                                href={basePath}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl font-bold text-xs transition-all opacity-60 hover:opacity-100"
                            >
                                <ChevronLeft size={14} />
                                Kembali ke Novel
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // 🛑 3-Chapter Limit Gate for Guest Users
    if (!isLoggedIn && currentIndex >= 3) {
        return (
            <div className="min-h-screen bg-[#FDFCF0] text-[#3E2723] dark:bg-[#121212] dark:text-[#e0e0e0] flex flex-col">
                <nav className="border-b border-black/5 dark:border-white/5 px-6 py-4 backdrop-blur-xl sticky top-0 bg-white/70 dark:bg-black/70 z-50">
                    <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <Link href="/" className="text-2xl font-black tracking-tighter">Lentera Baca</Link>
                        <div className="flex items-center gap-4">
                            <ThemeToggle currentTheme={theme} variant="minimal" />
                            <Link href="/sign-in" className="text-[0.65rem] font-black uppercase tracking-[0.15em] px-4 py-2 bg-[#3E2723] text-[#F5F5DC] dark:bg-white dark:text-black rounded-xl hover:shadow-lg transition-all">
                                Masuk
                            </Link>
                        </div>
                    </div>
                </nav>

                <main className="flex-1 flex items-center justify-center p-6">
                    <div className="max-w-md w-full p-8 md:p-10 bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-[2.5rem] shadow-2xl text-center space-y-6">
                        <div className="w-16 h-16 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                            <Lock size={32} />
                        </div>
                        <div>
                            <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
                                Batas Membaca Tamu
                            </span>
                            <h2 className="text-2xl font-black tracking-tight mt-4 mb-2">Batas 3 Chapter Gratis</h2>
                            <p className="text-xs opacity-60 font-medium leading-relaxed">
                                Sebagai tamu, Anda dapat membaca 3 chapter pertama secara gratis. Silakan masuk atau mendaftar akun gratis untuk membuka akses membaca tanpa batas!
                            </p>
                        </div>

                        <div className="space-y-3 pt-2">
                            <Link
                                href={`/sign-in?redirect_url=/novel/${slug}/${chapterOrder}`}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#3E2723] dark:bg-white text-[#F5F5DC] dark:text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl transition-all active:scale-95 shadow-md"
                            >
                                <LogIn size={16} />
                                Masuk Ke Akun
                            </Link>
                            <Link
                                href={`/sign-up?redirect_url=/novel/${slug}/${chapterOrder}`}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 rounded-2xl font-bold text-xs transition-all"
                            >
                                <Sparkles size={14} />
                                Buat Akun Gratis
                            </Link>
                            <Link
                                href={basePath}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl font-bold text-xs transition-all opacity-60 hover:opacity-100"
                            >
                                <ChevronLeft size={14} />
                                Kembali ke Novel
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Increment view count for the chapter (and novel)
    await incrementView(chapter.id, 'CHAPTER');

    const getLink = (c: any) => `${basePath}/${getChapterSlug(c, novel.chapters)}`;

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
                                href={getLink(prevChapter)}
                                className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl border transition-all active:scale-95 border-black/5 hover:bg-black/5 text-[#3E2723] dark:border-white/10 dark:hover:bg-white/5 dark:text-white shadow-sm"
                            >
                                <ChevronLeft size={16} /> Prev
                            </Link>
                        ) : (<div className="w-[85px]" />)}

                        <div className="flex flex-col items-center gap-1">
                            <div className="text-[0.6rem] font-black uppercase tracking-[0.3em] opacity-30 dark:text-gray-500">
                                {formatChapterTitle(chapter, novel.chapters)}
                            </div>
                            <Link href={basePath} className="text-[0.6rem] font-black uppercase tracking-[0.1em] opacity-60 hover:opacity-100 transition-opacity border-b border-current dark:text-gray-400">
                                Daftar Isi
                            </Link>
                        </div>

                        {nextChapter ? (
                            <Link
                                href={getLink(nextChapter)}
                                className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl border transition-all active:scale-95 border-black/5 hover:bg-black/5 text-[#3E2723] dark:border-white/10 dark:hover:bg-white/5 dark:text-white shadow-sm"
                            >
                                Next <ChevronRight size={16} />
                            </Link>
                        ) : (<div className="w-[85px]" />)}
                    </nav>

                    <h1 className="text-4xl font-black mb-4 tracking-tight leading-tight dark:text-white">{chapter.novel.title}</h1>
                    <h2 className="text-xl font-bold opacity-60 italic dark:text-gray-400">
                        {formatChapterTitle(chapter, novel.chapters)}
                    </h2>
                </header>

                <div
                    className={`text-lg sm:text-xl leading-[1.8] sm:leading-[2] space-y-6 opacity-90 prose prose-lg dark:prose-invert max-w-none prose-p:mb-6 prose-img:w-full prose-img:h-auto prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-8 prose-img:mx-auto prose-img:block ${
                        chapter.type === "ILLUSTRATION" 
                        ? "prose-img:max-h-[90vh] prose-img:object-contain" 
                        : ""
                    }`}
                    dangerouslySetInnerHTML={{ __html: chapter.content }}
                />

                <nav className="mt-24 flex justify-between items-center border-t border-black/5 pt-12 dark:border-white/5">
                    {prevChapter ? (
                        <Link
                            href={getLink(prevChapter)}
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
                            href={getLink(nextChapter)}
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
