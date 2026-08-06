import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/admin";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
    await checkAdmin();

    const novels = await prisma.novel.findMany({
        include: {
            _count: {
                select: {
                    chapters: true,
                    volumes: true
                }
            },
            tags: {
                select: { name: true }
            }
        },
        orderBy: { updatedAt: 'desc' }
    });

    return <AdminDashboard initialNovels={novels} />;
}
