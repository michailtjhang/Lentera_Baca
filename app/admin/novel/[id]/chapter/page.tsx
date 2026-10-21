import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/admin";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminChapterList from "@/components/admin/AdminChapterList";
import { ChevronLeft, List, Plus, Settings } from "lucide-react";

export default async function ChapterManagementPage({ params }: { params: Promise<{ id: string }> }) {
    await checkAdmin();
    const { id } = await params;

    const novel = await prisma.novel.findUnique({
        where: { id },
        include: {
            volumes: { orderBy: { order: 'asc' } },
            chapters: {
                orderBy: { order: 'asc' },
                include: { volume: true }
            }
        }
    });

    if (!novel) notFound();

    return (
        <div className="min-h-screen">
            {/* Desktop Page Sticky Header */}
            <div className="sticky top-0 z-20 bg-[#F7F3EC]/90 dark:bg-[#0f0f0f]/90 backdrop-blur-xl border-b border-black/8 dark:border-white/8 px-6 lg:px-10 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-3.5">
                        <Link 
                            href="/admin" 
                            className="group flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-50 hover:opacity-100 transition-opacity"
                        >
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Dashboard
                        </Link>
                        <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
                        <Link 
                            href={`/admin/novel/${novel.id}/edit`} 
                            className="text-xs font-bold opacity-60 hover:opacity-100 transition-opacity truncate max-w-xs flex items-center gap-1"
                        >
                            <Settings size={13} />
                            <span>{novel.title}</span>
                        </Link>
                        <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
                        <div className="flex items-center gap-1.5">
                            <List size={15} className="text-amber-600 dark:text-amber-400" />
                            <h1 className="text-sm font-black tracking-tight">Manajemen Bab</h1>
                        </div>
                    </div>

                    <Link
                        href={`/admin/novel/${novel.id}/chapter/new`}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all shadow-md shadow-amber-700/20"
                    >
                        <Plus size={15} />
                        <span>Tambah Chapter</span>
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 lg:p-10 max-w-7xl mx-auto">
                <div className="mb-8">
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.25em] opacity-40 mb-1">Koleksi Bab Novel</p>
                    <h2 className="text-3xl font-black tracking-tight text-[#2B1810] dark:text-white mb-2">{novel.title}</h2>
                    <p className="text-sm opacity-50 font-medium">
                        Kelola urutan bab, edit isi cerita, atau tambahkan bab baru untuk pembaca.
                    </p>
                </div>

                <AdminChapterList
                    novel={novel}
                    chapters={novel.chapters}
                    volumes={novel.volumes}
                />
            </div>
        </div>
    );
}
