"use server";

import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { FileType, Status } from "@prisma/client";

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
    const fileUrl = formData.get("fileUrl") as string;
    const fileType = formData.get("fileType") as FileType;
    const status = formData.get("status") as Status;
    const genresRaw = formData.get("genres") as string;

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
            fileUrl,
            fileType: fileType || "PDF",
            status: status || "ONGOING",
            genres: {
                connectOrCreate: genres.map((name) => ({
                    where: { name },
                    create: { name },
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
    const fileUrl = formData.get("fileUrl") as string;
    const fileType = formData.get("fileType") as FileType;
    const status = formData.get("status") as Status;
    const genresRaw = formData.get("genres") as string;

    const slug = generateSlug(title);
    const genres = genresRaw
        ? genresRaw.split(",").map((g) => g.trim()).filter(Boolean)
        : [];

    await prisma.lightNovel.update({
        where: { id },
        data: {
            title,
            slug,
            author,
            description,
            coverImage,
            fileUrl,
            fileType: fileType || "PDF",
            status: status || "ONGOING",
            genres: {
                set: [],
                connectOrCreate: genres.map((name) => ({
                    where: { name },
                    create: { name },
                })),
            },
        },
    });

    revalidatePath("/light-novel");
    revalidatePath("/admin/light-novel");
}

export async function deleteLightNovel(id: string) {
    await checkAdmin();

    await prisma.lightNovel.delete({ where: { id } });

    revalidatePath("/light-novel");
    revalidatePath("/admin/light-novel");
}

export async function getLightNovels() {
    return prisma.lightNovel.findMany({
        include: { genres: true },
        orderBy: { createdAt: "desc" },
    });
}

export async function getLightNovelBySlug(slug: string) {
    return prisma.lightNovel.findUnique({
        where: { slug },
        include: { genres: true },
    });
}
