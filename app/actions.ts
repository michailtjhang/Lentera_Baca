"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateUserTheme(theme: "light" | "dark") {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const client = await clerkClient();

    await client.users.updateUserMetadata(userId, {
        publicMetadata: {
            theme,
        },
    });

    revalidatePath("/");
}
