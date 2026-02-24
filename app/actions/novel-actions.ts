"use server";

import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createNovel(formData: FormData) {
    await checkAdmin();

    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const description = formData.get("description") as string;
    const coverImage = formData.get("coverImage") as string;

    // Get genres and tags
    const genres = formData.getAll("genres") as string[];
    const tagsInput = formData.get("tags") as string;
    const tags = tagsInput ? tagsInput.split(",").map((tag: string) => tag.trim()).filter((tag: string) => tag !== "") : [];

    if (!title || !author) {
        throw new Error("Title and Author are required");
    }

    const novel = await (prisma as any).novel.create({
        data: {
            title,
            author,
            description,
            coverImage,
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
            }
        },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    redirect("/admin");
}

export async function createChapter(novelId: string, formData: FormData) {
    await checkAdmin();

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const order = parseInt(formData.get("order") as string);

    if (!title || !content || isNaN(order)) {
        throw new Error("Title, Content, and Order (number) are required");
    }

    await prisma.chapter.create({
        data: {
            title,
            content,
            order,
            novelId,
        },
    });

    revalidatePath(`/novel/${novelId}`);
    revalidatePath("/admin");
    redirect("/admin");
}
