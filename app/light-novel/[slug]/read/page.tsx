import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

// Dynamic imports for readers to avoid SSR issues with PDF/EPUB libs
const PDFReader = dynamic(() => import("@/components/PDFReader"), { ssr: false });
const EPUBReader = dynamic(() => import("@/components/EPUBReader"), { ssr: false });

export default async function LightNovelReaderPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const ln = await prisma.lightNovel.findUnique({
        where: { slug },
    });

    if (!ln) notFound();

    return (
        <div className="min-h-screen bg-black overflow-hidden relative">
            {/* Background branding subtle */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
                <span className="text-[20vw] font-black tracking-tighter">LENTERA</span>
            </div>

            {ln.fileType === "PDF" ? (
                <PDFReader fileUrl={ln.fileUrl} title={ln.title} />
            ) : (
                <EPUBReader fileUrl={ln.fileUrl} title={ln.title} />
            )}
        </div>
    );
}
