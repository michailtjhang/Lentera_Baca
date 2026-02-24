import { auth, currentUser } from "@clerk/nextjs/server";

export async function isAdmin() {
    const user = await currentUser();

    if (!user) return false;

    const adminEmail = process.env.ADMIN_EMAIL;
    const userEmail = user.emailAddresses[0]?.emailAddress;

    return userEmail === adminEmail;
}

export async function checkAdmin() {
    const isAllowed = await isAdmin();
    if (!isAllowed) {
        throw new Error("Unauthorized: Admin access only");
    }
}
