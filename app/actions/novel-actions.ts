"use server";

import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NovelType, Region, Status, FileType, ChapterType } from "@prisma/client";
import { utapi } from "@/lib/uploadthing";
import { generateSlug, getChapterSlug } from "@/lib/slug-utils";

export async function createNovel(_: any, formData: FormData) {
    let novelSlug = "";
    
    try {
        await checkAdmin();

        const title = formData.get("title") as string;
        const author = formData.get("author") as string;
        
        let typeValue = formData.get("type") as any;
        // Map old types if they somehow leak in
        if (typeValue === "LIGHTNOVEL") typeValue = "LIGHTNOVEL_WEB";
        if (typeValue === "PDF") typeValue = "LIGHTNOVEL_PDF";
        // Ensure it's a valid enum or fallback to WEB
        if (!["WEB", "LIGHTNOVEL_WEB", "LIGHTNOVEL_PDF", "EPUB"].includes(typeValue)) {
            typeValue = "WEB";
        }
        const type = typeValue as NovelType;
        const illustrator = formData.get("illustrator") as string;
        const description = formData.get("description") as string;
        const coverImage = formData.get("coverImage") as string;
        const coverImageKey = formData.get("coverImageKey") as string;
        const region = (formData.get("region") as Region) || Region.OTHER;
        const status = (formData.get("status") as Status) || Status.ONGOING;

        if (!title || !author) {
            return { success: false, error: "Judul dan Penulis wajib diisi" };
        }

        // Get genres and tags
        const genres = formData.getAll("genres") as string[];
        const tagsInput = formData.get("tags") as string;
        const tags = tagsInput ? tagsInput.split(",").map((tag: string) => tag.trim()).filter(Boolean) : [];

        // Volumes for PDF/EPUB
        const volumesRaw = formData.get("volumes") as string;
        const volumesData = volumesRaw ? JSON.parse(volumesRaw) : [];

        // simple slug generator
        let slug = generateSlug(title);

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
                        fileUrl: v.fileUrl || null,
                        fileKey: v.fileKey || null,
                        fileType: v.fileType || (type === NovelType.EPUB ? FileType.EPUB : FileType.PDF),
                    })),
                },
            },
        });

        novelSlug = novel.slug;
        revalidatePath("/");
        revalidatePath(`/novel/${novelSlug}`);
        revalidatePath("/admin");
    } catch (error: any) {
        console.error("Create Novel Error:", error);
        return { success: false, error: error.message || "Gagal menerbitkan novel" };
    }

    redirect("/admin");
}

export async function updateNovel(novelId: string, prevState: any, formData: FormData) {
    let novelSlug = "";

    try {
        await checkAdmin();

        const title = formData.get("title") as string;
        const author = formData.get("author") as string;

        const illustrator = formData.get("illustrator") as string;
        const description = formData.get("description") as string;
        const coverImage = formData.get("coverImage") as string;
        const coverImageKey = formData.get("coverImageKey") as string;

        let typeValue = formData.get("type") as any;
        if (typeValue === "LIGHTNOVEL") typeValue = "LIGHTNOVEL_WEB";
        if (typeValue === "PDF") typeValue = "LIGHTNOVEL_PDF";
        if (!["WEB", "LIGHTNOVEL_WEB", "LIGHTNOVEL_PDF", "EPUB"].includes(typeValue)) {
            typeValue = "WEB";
        }
        const type = typeValue as NovelType;
        const region = (formData.get("region") as Region) || Region.OTHER;
        const status = (formData.get("status") as Status) || Status.ONGOING;

        if (!title || !author) {
            return { success: false, error: "Judul dan Penulis wajib diisi" };
        }

        const genres = formData.getAll("genres") as string[];
        const tagsInput = formData.get("tags") as string;
        const tags = tagsInput ? tagsInput.split(",").map((tag: string) => tag.trim()).filter(Boolean) : [];

        const volumesRaw = formData.get("volumes") as string;
        const incomingVolumes = volumesRaw ? JSON.parse(volumesRaw) : [];

        const currentNovel = await prisma.novel.findUnique({
            where: { id: novelId },
            include: { genres: true, tags: true, volumes: true }
        });

        if (!currentNovel) throw new Error("Novel tidak ditemukan");

        // Handle File Deletion from UploadThing if changed or removed
        if (currentNovel.coverImageKey && currentNovel.coverImageKey !== coverImageKey) {
            await utapi.deleteFiles(currentNovel.coverImageKey);
        }

        // Volume matching and cleanup
        const currentVolumes = currentNovel.volumes;
        const incomingIds = incomingVolumes.filter((v: any) => v.id).map((v: any) => v.id);
        const volumesToDelete = currentVolumes.filter(v => !incomingIds.includes(v.id));
        const keysToDelete = volumesToDelete.map(v => v.fileKey).filter((key): key is string => !!key);

        if (keysToDelete.length > 0) {
            await utapi.deleteFiles(keysToDelete);
        }

        const isBadSlug = currentNovel.slug.length > 50 || currentNovel.slug.includes("bti0sbt");
        let newSlug = currentNovel.slug;
        if (currentNovel.title !== title || isBadSlug) {
            newSlug = generateSlug(title);
            const slugExists = await prisma.novel.findFirst({
                where: { slug: newSlug, id: { not: novelId } }
            });
            if (slugExists) {
                newSlug = `${newSlug}-${Math.random().toString(36).substring(2, 7)}`;
            }
        }

        const volumesToUpdate = incomingVolumes.filter((v: any) => v.id);
        const volumesToCreate = incomingVolumes.filter((v: any) => !v.id);

        const updated = await prisma.novel.update({
            where: { id: novelId },
            data: {
                title,
                slug: newSlug,
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
                    deleteMany: { id: { in: volumesToDelete.map(v => v.id) } },
                    update: volumesToUpdate.map((v: any) => ({
                        where: { id: v.id },
                        data: {
                            title: v.title,
                            order: v.order,
                            fileUrl: v.fileUrl || null,
                            fileKey: v.fileKey || null,
                            fileType: v.fileType || (type === NovelType.EPUB ? FileType.EPUB : FileType.PDF),
                        }
                    })),
                    create: volumesToCreate.map((v: any, index: number) => ({
                        title: v.title,
                        order: v.order || (currentVolumes.length + index + 1),
                        fileUrl: v.fileUrl || null,
                        fileKey: v.fileKey || null,
                        fileType: v.fileType || (type === NovelType.EPUB ? FileType.EPUB : FileType.PDF),
                    })),
                },
            },
        });

        novelSlug = updated.slug;
        revalidatePath("/");
        revalidatePath(`/novel/${novelSlug}`);
        revalidatePath("/admin");
    } catch (error: any) {
        if (error.digest?.includes("NEXT_REDIRECT")) throw error;
        console.error("Update Novel Error:", error);
        return { success: false, error: error.message || "Gagal memperbarui novel" };
    }

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

    // Also cleanup illustrations from chapters
    const chapters = await prisma.chapter.findMany({
        where: { novelId: novelId, type: ("ILLUSTRATION" as any) }
    });
    
    chapters.forEach(chapter => {
        const regex = /src="([^"]+)"/g;
        let match;
        while ((match = regex.exec(chapter.content || "")) !== null) {
            const url = match[1];
            if (url.includes("utfs.io/f/")) {
                keys.push(url.split("/f/").pop() || "");
            }
        }
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
export async function createChapter(novelId: string, prevState: any, formData: FormData) {
    let chapterSlug = "";
    let novelSlug = "";
    
    try {
        await checkAdmin();

        const title = (formData.get("title") as string) || null;
        const content = formData.get("content") as string;
        let order = parseInt(formData.get("order") as string);
        const type = (formData.get("type") as ChapterType) || ChapterType.STORY;
        const volumeId = formData.get("volumeId") as string || null;

        if (!content) {
            return { success: false, error: "Konten chapter tidak boleh kosong" };
        }

        if (isNaN(order)) {
            // Find max order
            const lastChapter = await prisma.chapter.findFirst({
                where: { novelId },
                orderBy: { order: "desc" }
            });
            order = (lastChapter?.order || 0) + 1;
        }

        const chapter = await prisma.chapter.create({
            data: { title, content, order, type, novelId, volumeId } as any,
            include: { novel: true }
        }) as any;

        novelSlug = chapter.novel.slug;
        revalidatePath(`/novel/${novelSlug}`);
        revalidatePath("/admin");
        
        const allChapters = await prisma.chapter.findMany({ where: { novelId }, orderBy: { order: "asc" } });
        chapterSlug = getChapterSlug(chapter, allChapters);
    } catch (error: any) {
        console.error("Create Chapter Error:", error);
        return { success: false, error: error.message || "Gagal membuat chapter" };
    }

    redirect(`/novel/${novelSlug}/${chapterSlug}`);
}

export async function updateChapter(chapterId: string, prevState: any, formData: FormData) {
    let chapterSlug = "";
    let novelSlug = "";

    try {
        await checkAdmin();

        const title = (formData.get("title") as string) || null;
        const content = formData.get("content") as string;
        const orderRaw = formData.get("order");
        const order = orderRaw ? parseInt(orderRaw as string) : undefined;
        const type = (formData.get("type") as ChapterType) || ChapterType.STORY;
        const volumeId = formData.get("volumeId") as string || null;

        if (!content) {
            return { success: false, error: "Konten chapter tidak boleh kosong" };
        }

        const chapter = await prisma.chapter.update({
            where: { id: chapterId },
            data: { title, content, order, type, volumeId } as any,
            include: { novel: true }
        }) as any;

        novelSlug = chapter.novel.slug;
        revalidatePath(`/novel/${novelSlug}`);
        revalidatePath("/admin");
        revalidatePath(`/admin/novel/${chapter.novelId}/chapter`);
        
        const allChapters = await prisma.chapter.findMany({ where: { novelId: chapter.novelId }, orderBy: { order: "asc" } });
        chapterSlug = getChapterSlug(chapter, allChapters);
    } catch (error: any) {
        if (error.digest?.includes("NEXT_REDIRECT")) throw error;
        console.error("Update Chapter Error:", error);
        return { success: false, error: error.message || "Gagal memperbarui chapter" };
    }

    redirect(`/novel/${novelSlug}/${chapterSlug}`);
}

export async function deleteChapter(chapterId: string) {
    await checkAdmin();

    const chapter = await prisma.chapter.delete({
        where: { id: chapterId },
        include: { novel: true }
    });

    // Cleanup illustrations if type is ILLUSTRATION
    if (chapter.type === ("ILLUSTRATION" as any)) {
        const regex = /src="([^"]+)"/g;
        const keys: string[] = [];
        let match;
        while ((match = regex.exec(chapter.content || "")) !== null) {
            const url = match[1];
            if (url.includes("utfs.io/f/")) {
                keys.push(url.split("/f/").pop() || "");
            }
        }
        if (keys.length > 0) {
            await utapi.deleteFiles(keys);
        }
    }

    revalidatePath(`/novel/${chapter.novel.slug}`);
    revalidatePath("/admin");
    revalidatePath(`/admin/novel/${chapter.novelId}/chapter`);
    return { success: true };
}

export async function deleteFiles(keys: string | string[]) {
    await checkAdmin();
    try {
        const keyArray = Array.isArray(keys) ? keys : [keys];
        if (keyArray.length === 0) return { success: true };
        await utapi.deleteFiles(keyArray);
        return { success: true };
    } catch (error) {
        console.error("UT Delete Error:", error);
        return { success: false, error: (error as any).message };
    }
}

export async function swapVolumeOrders(volId1: string, volId2: string) {
    await checkAdmin();
    const vol1 = await prisma.volume.findUnique({ where: { id: volId1 } });
    const vol2 = await prisma.volume.findUnique({ where: { id: volId2 } });

    if (!vol1 || !vol2) throw new Error("Volume not found");

    await prisma.$transaction([
        prisma.volume.update({ where: { id: volId1 }, data: { order: vol2.order } }),
        prisma.volume.update({ where: { id: volId2 }, data: { order: vol1.order } }),
    ]);

    revalidatePath("/admin");
    revalidatePath(`/novel/${vol1.novelId}`); // Assuming we might need this
    return { success: true };
}

export async function updateVolumeTitle(volumeId: string, title: string) {
    await checkAdmin();
    const vol = await prisma.volume.update({
        where: { id: volumeId },
        data: { title }
    });

    revalidatePath("/admin");
    return { success: true };
}

export async function swapChapterOrders(id1: string, id2: string) {
    await checkAdmin();
    const ch1 = await prisma.chapter.findUnique({ where: { id: id1 }, include: { novel: true } });
    const ch2 = await prisma.chapter.findUnique({ where: { id: id2 } });

    if (!ch1 || !ch2) throw new Error("Chapter not found");

    await prisma.$transaction([
        prisma.chapter.update({ where: { id: id1 }, data: { order: ch2.order } }),
        prisma.chapter.update({ where: { id: id2 }, data: { order: ch1.order } }),
    ]);

    revalidatePath(`/novel/${ch1.novel.slug}`);
    revalidatePath("/admin");
    revalidatePath(`/admin/novel/${ch1.novelId}/chapter`);
    return { success: true };
}

export async function incrementView(id: string, type: 'NOVEL' | 'CHAPTER' | 'VOLUME') {
    try {
        if (type === 'NOVEL') {
            await prisma.novel.update({
                where: { id },
                data: { views: { increment: 1 } }
            });
        } else if (type === 'CHAPTER') {
            const chapter = await prisma.chapter.update({
                where: { id },
                data: { views: { increment: 1 } },
                include: { novel: true }
            });
            // Also increment total novel views when a chapter is read
            if (chapter.novelId) {
                await prisma.novel.update({
                    where: { id: chapter.novelId },
                    data: { views: { increment: 1 } }
                });
            }
        } else if (type === 'VOLUME') {
            const volume = await prisma.volume.update({
                where: { id },
                data: { views: { increment: 1 } },
                include: { novel: true }
            });
            if (volume.novelId) {
                await prisma.novel.update({
                    where: { id: volume.novelId },
                    data: { views: { increment: 1 } }
                });
            }
        }
        return { success: true };
    } catch (error) {
        console.error("Increment View Error:", error);
        return { success: false };
    }
}

export async function getPopularNovels(limit = 10) {
    return await prisma.novel.findMany({
        orderBy: { views: 'desc' },
        take: limit,
        include: {
            chapters: { select: { id: true } },
            volumes: { select: { id: true } }
        }
    });
}
