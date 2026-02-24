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
    const status = (formData.get("status") as string) || "ONGOING";

    // Get genres and tags
    const genres = formData.getAll("genres") as string[];
    const tagsInput = formData.get("tags") as string;
    const tags = tagsInput ? tagsInput.split(",").map((tag: string) => tag.trim()).filter((tag: string) => tag !== "") : [];

    if (!title || !author) {
        throw new Error("Title and Author are required");
    }

    // simple slug generator, ensure lowercase and replace spaces
    const providedSlug = (formData.get("slug") as string) || "";
    let slug = providedSlug
        ? providedSlug
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, "")
              .trim()
              .replace(/\s+/g, "-")
        : title
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, "")
              .trim()
              .replace(/\s+/g, "-");

    // if slug collides we append a short random string
    const existing = await prisma.novel.findUnique({ where: { slug } });
    if (existing) {
        slug = `${slug}-${Math.random().toString(36).substr(2, 5)}`;
    }

    const novel = await (prisma as any).novel.create({
        data: {
            title,
            slug,
            author,
            description,
            coverImage,
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
            }
        },
    });

    revalidatePath("/");
    revalidatePath(`/novel/${novel.slug}`);
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

    const chapter = await prisma.chapter.create({
        data: {
            title,
            content,
            order,
            novelId,
        },
        include: {
            novel: true
        }
    });

    revalidatePath(`/novel/${chapter.novel.slug}`);
    revalidatePath("/admin");
    redirect("/admin");
}

export async function updateNovel(novelId: string, formData: FormData) {
    await checkAdmin();

    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const description = formData.get("description") as string;
    const coverImage = formData.get("coverImage") as string;
    const status = (formData.get("status") as string) || "ONGOING";

    // Get genres and tags
    const genres = formData.getAll("genres") as string[];
    const tagsInput = formData.get("tags") as string;
    const tags = tagsInput ? tagsInput.split(",").map((tag: string) => tag.trim()).filter((tag: string) => tag !== "") : [];

    if (!title || !author) {
        throw new Error("Title and Author are required");
    }

    const novel = await prisma.novel.findUnique({
        where: { id: novelId },
        include: { genres: true, tags: true }
    });

    if (!novel) {
        throw new Error("Novel not found");
    }

    // Remove old genres and tags
    await (prisma as any).novel.update({
        where: { id: novelId },
        data: {
            genres: { disconnect: novel.genres.map((g: any) => ({ id: g.id })) },
            tags: { disconnect: novel.tags.map((t: any) => ({ id: t.id })) }
        }
    });

    // Update with new data
    const updated = await (prisma as any).novel.update({
        where: { id: novelId },
        data: {
            title,
            author,
            description,
            coverImage,
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
            }
        },
        include: { genres: true, tags: true }
    });

    revalidatePath("/");
    revalidatePath(`/novel/${novel.slug}`);
    revalidatePath("/admin");
    redirect("/admin");
}
