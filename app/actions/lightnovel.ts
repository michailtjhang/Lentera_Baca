"use server";

import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { FileType, Status } from "@prisma/client";
import { utapi } from "@/lib/uploadthing";

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

export async function createLightNovel(formData: FormData) {
    await checkAdmin();

    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const description = formData.get("description") as string;
    const coverImage = formData.get("coverImage") as string;
    const coverImageKey = formData.get("coverImageKey") as string;
    const status = formData.get("status") as Status;
    const genresRaw = formData.get("genres") as string;
    
    // Volume data passed as JSON string from form
    const volumesRaw = formData.get("volumes") as string;
    const volumesData = volumesRaw ? JSON.parse(volumesRaw) : [];

    const slug = generateSlug(title);
    const genres = genresRaw
        ? genresRaw.split(",").map((g) => g.trim()).filter(Boolean)
        : [];

    await prisma.lightNovel.create({
        data: {
            title,
            slug,
            author,
            description,
            coverImage,
            coverImageKey,
            status: status || "ONGOING",
            genres: {
                connectOrCreate: genres.map((name) => ({
                    where: { name },
                    create: { name },
                })),
            },
            volumes: {
                create: volumesData.map((v: any, index: number) => ({
                    title: v.title,
                    order: v.order || index + 1,
                    fileUrl: v.fileUrl,
                    fileKey: v.fileKey,
                    fileType: v.fileType || "PDF",
                })),
            },
        },
    });

    revalidatePath("/light-novel");
    revalidatePath("/admin/light-novel");
}

export async function updateLightNovel(id: string, formData: FormData) {
    await checkAdmin();

    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const description = formData.get("description") as string;
    const coverImage = formData.get("coverImage") as string;
    const coverImageKey = formData.get("coverImageKey") as string;
    const status = formData.get("status") as Status;
    const genresRaw = formData.get("genres") as string;
    const volumesRaw = formData.get("volumes") as string;
    const volumesData = volumesRaw ? JSON.parse(volumesRaw) : [];

    const slug = generateSlug(title);
    const genres = genresRaw
        ? genresRaw.split(",").map((g) => g.trim()).filter(Boolean)
        : [];

    // Get current novel to check for file deletion
    const currentLN = await prisma.lightNovel.findUnique({
        where: { id },
        include: { volumes: true },
    });

    if (!currentLN) throw new Error("Light Novel not found");

    // Handle Cover Deletion if changed
    if (currentLN.coverImageKey && coverImageKey && currentLN.coverImageKey !== coverImageKey) {
        await utapi.deleteFiles(currentLN.coverImageKey);
    }

    // Identify volumes to delete from UploadThing
    const currentVolumeKeys = currentLN.volumes.map(v => v.fileKey);
    const nextVolumeKeys = volumesData.map((v: any) => v.fileKey).filter(Boolean);
    const keysToDelete = currentVolumeKeys.filter(key => !nextVolumeKeys.includes(key));

    if (keysToDelete.length > 0) {
        await utapi.deleteFiles(keysToDelete);
    }

    await prisma.lightNovel.update({
        where: { id },
        data: {
            title,
            slug,
            author,
            description,
            coverImage,
            coverImageKey,
            status: status || "ONGOING",
            genres: {
                set: [],
                connectOrCreate: genres.map((name) => ({
                    where: { name },
                    create: { name },
                })),
            },
            volumes: {
                deleteMany: {}, // Simple way: recreate all. In production, better to sync by ID.
                create: volumesData.map((v: any, index: number) => ({
                    title: v.title,
                    order: v.order || index + 1,
                    fileUrl: v.fileUrl,
                    fileKey: v.fileKey,
                    fileType: v.fileType || "PDF",
                })),
            },
        },
    });

    revalidatePath("/light-novel");
    revalidatePath("/admin/light-novel");
}

export async function deleteLightNovel(id: string) {
    await checkAdmin();

    const ln = await prisma.lightNovel.findUnique({
        where: { id },
        include: { volumes: true }
    });

    if (!ln) return;

    // Collect all keys to delete from UploadThing
    const keys: string[] = [];
    if (ln.coverImageKey) keys.push(ln.coverImageKey);
    ln.volumes.forEach(v => {
        if (v.fileKey) keys.push(v.fileKey);
    });

    // Delete from UT first
    if (keys.length > 0) {
        await utapi.deleteFiles(keys);
    }

    // Delete from DB (volumes deleted by Cascade)
    await prisma.lightNovel.delete({ where: { id } });

    revalidatePath("/light-novel");
    revalidatePath("/admin/light-novel");
}

export async function deleteVolumeFile(fileKey: string) {
    await checkAdmin();
    await utapi.deleteFiles(fileKey);
}

export async function getLightNovels() {
    return prisma.lightNovel.findMany({
        include: { genres: true, volumes: true },
        orderBy: { createdAt: "desc" },
    });
}

export async function getLightNovelBySlug(slug: string) {
    return prisma.lightNovel.findUnique({
        where: { slug },
        include: { genres: true, volumes: { orderBy: { order: "asc" } } },
    });
}
