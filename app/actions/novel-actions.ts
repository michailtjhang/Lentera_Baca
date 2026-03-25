"use server";

import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NovelType, Region, Status, FileType, ChapterType } from "@prisma/client";
import { utapi } from "@/lib/uploadthing";

export async function createNovel(_: any, formData: FormData) {
    await checkAdmin();

    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const illustrator = formData.get("illustrator") as string;
    const description = formData.get("description") as string;
    const coverImage = formData.get("coverImage") as string;
    const coverImageKey = formData.get("coverImageKey") as string;
    const type = (formData.get("type") as NovelType) || NovelType.WEB;
    const region = (formData.get("region") as Region) || Region.OTHER;
    const status = (formData.get("status") as Status) || Status.ONGOING;

    // Get genres and tags
    const genres = formData.getAll("genres") as string[];
    const tagsInput = formData.get("tags") as string;
    const tags = tagsInput ? tagsInput.split(",").map((tag: string) => tag.trim()).filter(Boolean) : [];

    // Volumes for PDF/EPUB
    const volumesRaw = formData.get("volumes") as string;
    const volumesData = volumesRaw ? JSON.parse(volumesRaw) : [];

    if (!title || !author) {
        throw new Error("Title and Author are required");
    }

    // simple slug generator
    let slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");

    const existing = await prisma.novel.findUnique({ where: { slug } });
    if (existing) {
        slug = `${slug}-${Math.random().toString(36).substr(2, 5)}`;
    }

    const novel = await prisma.novel.create({
        data: {
            title,
            slug,
            author,
            illustrator,
            description,
            coverImage,
            coverImageKey,
            type,
            region,
            status,
            genres: {
                connectOrCreate: genres.map((name: string) => ({
                    where: { name },
                    create: { name }
                }))
            },
            tags: {
                connectOrCreate: tags.map((name: string) => ({
                    where: { name },
                    create: { name }
                }))
            },
            volumes: {
                create: volumesData.map((v: any, index: number) => ({
                    title: v.title,
                    order: v.order || index + 1,
                    fileUrl: v.fileUrl,
                    fileKey: v.fileKey,
                    fileType: v.fileType || (type === NovelType.EPUB ? FileType.EPUB : FileType.PDF),
                })),
            },
        },
    });

    revalidatePath("/");
    revalidatePath(`/novel/${novel.slug}`);
    revalidatePath("/admin");
    redirect("/admin");
}

export async function updateNovel(novelId: string, formData: FormData) {
    await checkAdmin();

    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const illustrator = formData.get("illustrator") as string;
    const description = formData.get("description") as string;
    const coverImage = formData.get("coverImage") as string;
    const coverImageKey = formData.get("coverImageKey") as string;
    const type = (formData.get("type") as NovelType) || NovelType.WEB;
    const region = (formData.get("region") as Region) || Region.OTHER;
    const status = (formData.get("status") as Status) || Status.ONGOING;

    const genres = formData.getAll("genres") as string[];
    const tagsInput = formData.get("tags") as string;
    const tags = tagsInput ? tagsInput.split(",").map((tag: string) => tag.trim()).filter(Boolean) : [];

    const volumesRaw = formData.get("volumes") as string;
    const volumesData = volumesRaw ? JSON.parse(volumesRaw) : [];

    if (!title || !author) {
        throw new Error("Title and Author are required");
    }

    const currentNovel = await prisma.novel.findUnique({
        where: { id: novelId },
        include: { genres: true, tags: true, volumes: true }
    });

    if (!currentNovel) throw new Error("Novel not found");

    // Handle File Deletion from UploadThing if changed or removed
    if (currentNovel.coverImageKey && coverImageKey && currentNovel.coverImageKey !== coverImageKey) {
        await utapi.deleteFiles(currentNovel.coverImageKey);
    }

    // Volume cleanup for PDF/EPUB
    const currentVolumeKeys = currentNovel.volumes.map(v => v.fileKey).filter((key): key is string => !!key);
    const nextVolumeKeys = volumesData.map((v: any) => v.fileKey).filter(Boolean);
    const keysToDelete = currentVolumeKeys.filter(key => !nextVolumeKeys.includes(key));

    if (keysToDelete.length > 0) {
        await utapi.deleteFiles(keysToDelete);
    }

    const updated = await prisma.novel.update({
        where: { id: novelId },
        data: {
            title,
            author,
            illustrator,
            description,
            coverImage,
            coverImageKey,
            type,
            region,
            status,
            genres: {
                set: [],
                connectOrCreate: genres.map((name: string) => ({
                    where: { name },
                    create: { name }
                }))
            },
            tags: {
                set: [],
                connectOrCreate: tags.map((name: string) => ({
                    where: { name },
                    create: { name }
                }))
            },
            volumes: {
                deleteMany: {},
                create: volumesData.map((v: any, index: number) => ({
                    title: v.title,
                    order: v.order || index + 1,
                    fileUrl: v.fileUrl,
                    fileKey: v.fileKey,
                    fileType: v.fileType || (type === NovelType.EPUB ? FileType.EPUB : FileType.PDF),
                })),
            },
        },
    });

    revalidatePath("/");
    revalidatePath(`/novel/${updated.slug}`);
    revalidatePath("/admin");
    redirect("/admin");
}

export async function deleteNovel(novelId: string) {
    await checkAdmin();

    const novel = await prisma.novel.findUnique({
        where: { id: novelId },
        include: { volumes: true }
    });

    if (!novel) return;

    // Cleanup UploadThing files
    const keys: string[] = [];
    if (novel.coverImageKey) keys.push(novel.coverImageKey);
    novel.volumes.forEach(v => {
        if (v.fileKey) keys.push(v.fileKey);
    });

    if (keys.length > 0) {
        await utapi.deleteFiles(keys);
    }

    await prisma.novel.delete({ where: { id: novelId } });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
}

// Chapter Actions (Unchanged mostly, but ensure novelId works)
export async function createChapter(novelId: string, formData: FormData) {
    await checkAdmin();

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const order = parseInt(formData.get("order") as string);
    const type = (formData.get("type") as ChapterType) || ChapterType.STORY;
    const volumeId = formData.get("volumeId") as string || null;

    if (!title || !content || isNaN(order)) {
        throw new Error("Title, Content, and Order (number) are required");
    }

    const chapter = await prisma.chapter.create({
        data: { title, content, order, type, novelId, volumeId },
        include: { novel: true }
    });

    revalidatePath(`/novel/${chapter.novel.slug}`);
    revalidatePath("/admin");
    redirect(`/admin/novel/${novelId}/chapter`);
}

export async function updateChapter(chapterId: string, formData: FormData) {
    await checkAdmin();

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const order = parseInt(formData.get("order") as string);
    const type = (formData.get("type") as ChapterType) || ChapterType.STORY;
    const volumeId = formData.get("volumeId") as string || null;

    if (!title || !content || isNaN(order)) {
        throw new Error("Title, Content, and Order (number) are required");
    }

    const chapter = await prisma.chapter.update({
        where: { id: chapterId },
        data: { title, content, order, type, volumeId },
        include: { novel: true }
    });

    revalidatePath(`/novel/${chapter.novel.slug}`);
    revalidatePath("/admin");
    revalidatePath(`/admin/novel/${chapter.novelId}/chapter`);
    redirect(`/admin/novel/${chapter.novelId}/chapter`);
}

export async function deleteChapter(chapterId: string) {
    await checkAdmin();

    const chapter = await prisma.chapter.delete({
        where: { id: chapterId },
        include: { novel: true }
    });

    revalidatePath(`/novel/${chapter.novel.slug}`);
    revalidatePath("/admin");
    revalidatePath(`/admin/novel/${chapter.novelId}/chapter`);
    return { success: true };
}
