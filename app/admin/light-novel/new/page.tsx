import { checkAdmin } from "@/lib/admin";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import LightNovelForm from "@/components/admin/LightNovelForm";
import { ArrowLeft } from "lucide-react";

export default async function NewLightNovelPage() {
    await checkAdmin();

    return (
        <div className="min-h-screen bg-[#FDFCF0] text-[#1A1A1A]">
            <nav className="border-b border-black/[0.03] px-8 py-5 backdrop-blur-xl sticky top-0 bg-white/70 z-50">
                <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/light-novel" className="flex items-center gap-2 font-black text-sm hover:opacity-60 transition-opacity">
                            <ArrowLeft size={16} /> Kembali
                        </Link>
                        <span className="text-black/20">›</span>
                        <span className="font-black text-sm tracking-widest uppercase text-black/50">Tambah Light Novel</span>
                    </div>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-8 py-12">
                <h2 className="text-4xl font-black tracking-tighter mb-2">Tambah Light Novel</h2>
                <p className="text-black/40 font-bold mb-10 text-sm">Upload file PDF atau EPUB beserta informasi novel.</p>
                <div className="bg-white/60 border border-black/[0.03] rounded-[2.5rem] p-8">
                    <LightNovelForm mode="create" />
                </div>
            </main>
        </div>
    );
}
