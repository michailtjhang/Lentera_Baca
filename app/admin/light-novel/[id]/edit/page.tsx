import { checkAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import LightNovelForm from "@/components/admin/LightNovelForm";
import { ArrowLeft } from "lucide-react";

export default async function EditLightNovelPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    await checkAdmin();
    const { id } = await params;

    const ln = await prisma.lightNovel.findUnique({
        where: { id },
        include: { genres: true, volumes: { orderBy: { order: "asc" } } },
    });

    if (!ln) notFound();

    const defaultValues = {
        title: ln.title,
        author: ln.author,
        description: ln.description || "",
        coverImage: ln.coverImage || "",
        coverImageKey: ln.coverImageKey || "",
        status: ln.status,
        genres: ln.genres.map((g: any) => g.name).join(", "),
        volumes: ln.volumes,
    };

    return (
        <div className="min-h-screen bg-[#FDFCF0] text-[#1A1A1A]">
            <nav className="border-b border-black/[0.03] px-8 py-5 backdrop-blur-xl sticky top-0 bg-white/70 z-50">
                <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/light-novel" className="flex items-center gap-2 font-black text-sm hover:opacity-60 transition-opacity">
                            <ArrowLeft size={16} /> Kembali
                        </Link>
                        <span className="text-black/20">›</span>
                        <span className="font-black text-sm tracking-widest uppercase text-black/50">Edit Light Novel</span>
                    </div>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-8 py-12">
                <h2 className="text-4xl font-black tracking-tighter mb-2">Edit {ln.title}</h2>
                <p className="text-black/40 font-bold mb-10 text-sm">Update informasi atau ganti file light novel.</p>
                
                <LightNovelForm mode="edit" id={ln.id} defaultValues={defaultValues} />
            </main>
        </div>
    );
}
