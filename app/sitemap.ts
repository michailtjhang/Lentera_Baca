import { prisma } from "@/lib/prisma";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://lentera-baca.vercel.app";

    // Fetch all novels to include in sitemap
    const novels = await prisma.novel.findMany({
        select: { slug: true, updatedAt: true }
    });

    const novelUrls = novels.map((novel) => ({
        url: `${baseUrl}/novel/${novel.slug}`,
        lastModified: novel.updatedAt,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${baseUrl}/browse`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        ...novelUrls,
    ];
}
