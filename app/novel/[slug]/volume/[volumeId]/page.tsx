import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReaderWrapper from "@/components/ReaderWrapper";
import { incrementView } from "@/app/actions/novel-actions";

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

    if (!volume || volume.novel.slug !== slug || !volume.fileUrl) {
        return notFound();
    }

    // Increment view count for the volume (and novel)
    await incrementView(volume.id, 'VOLUME');

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
