"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateUserTheme(theme: "light" | "dark") {
    try {
        const { userId } = await auth();

        if (!userId) {
            return { success: false, message: "Unauthorized" };
        }

        const client = await clerkClient();

        await client.users.updateUserMetadata(userId, {
            publicMetadata: {
                theme,
            },
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to update user theme:", error);
        return { success: false, message: "Internal Server Error" };
    }
}
