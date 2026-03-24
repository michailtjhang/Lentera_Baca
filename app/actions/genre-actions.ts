"use server";

import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

export async function createGenre(name: string) {
    await checkAdmin();
    if (!name) throw new Error("Name is required");

    const genre = await prisma.genre.create({
        data: { name }
    });

    revalidatePath("/admin/genre");
    revalidatePath("/admin/novel/new");
    return genre;
}

export async function updateGenre(id: string, name: string) {
    await checkAdmin();
    if (!name) throw new Error("Name is required");

    const genre = await prisma.genre.update({
        where: { id },
        data: { name }
    });

    revalidatePath("/admin/genre");
    revalidatePath("/admin/novel/new");
    return genre;
}

export async function deleteGenre(id: string) {
    await checkAdmin();
    
    // Check if any novels are using this genre
    const novelsCount = await prisma.novel.count({
        where: {
            genres: {
                some: { id }
            }
        }
    });

    if (novelsCount > 0) {
        throw new Error(`Genre ini tidak bisa dihapus karena digunakan oleh ${novelsCount} novel.`);
    }

    await prisma.genre.delete({
        where: { id }
    });

    revalidatePath("/admin/genre");
    revalidatePath("/admin/novel/new");
    return { success: true };
}
