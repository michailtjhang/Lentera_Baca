import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import ReaderWrapper from "@/components/ReaderWrapper";

export default async function LightNovelReaderPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ v?: string }>;
}) {
    const { slug } = await params;
    const { v: volumeId } = await searchParams;

    const ln = await prisma.lightNovel.findUnique({
        where: { slug },
        include: { volumes: { orderBy: { order: "asc" } } },
    });

    if (!ln || ln.volumes.length === 0) notFound();

    // Determine which volume to read
    const volume = volumeId 
        ? ln.volumes.find(v => v.id === volumeId)
        : ln.volumes[0];

    if (!volume) {
        // If volumeId provided but not found, redirect to first volume
        return redirect(`/light-novel/${slug}/read`);
    }

    return (
        <div className="min-h-screen bg-black overflow-hidden relative">
            {/* Background branding subtle */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
                <span className="text-[20vw] font-black tracking-tighter text-white">LENTERA</span>
            </div>

            <ReaderWrapper 
                fileUrl={volume.fileUrl} 
                fileType={volume.fileType} 
                title={`${ln.title} - ${volume.title}`} 
            />
        </div>
    );
}
