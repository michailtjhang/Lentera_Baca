import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReaderWrapper from "@/components/ReaderWrapper";

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
                <span className="text-[20vw] font-black tracking-tighter text-white">LENTERA</span>
            </div>

            <ReaderWrapper 
                fileUrl={ln.fileUrl} 
                fileType={ln.fileType} 
                title={ln.title} 
            />
        </div>
    );
}
