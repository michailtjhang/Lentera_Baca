import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReaderWrapper from "@/components/ReaderWrapper";

interface VolumePageProps {
    params: Promise<{
        slug: string;
        volumeId: string;
    }>;
}

export default async function VolumePage({ params }: VolumePageProps) {
    const { slug, volumeId } = await params;

    const volume = await prisma.volume.findUnique({
        where: { id: volumeId },
        include: { novel: true }
    });

    if (!volume || volume.novel.slug !== slug) {
        return notFound();
    }

    return (
        <main className="min-h-screen bg-black">
            <ReaderWrapper 
                fileUrl={volume.fileUrl} 
                fileType={volume.fileType} 
                title={`${volume.novel.title} - ${volume.title}`} 
                novelSlug={slug}
            />
        </main>
    );
}
