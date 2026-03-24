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
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return <AdminDashboard initialNovels={novels} />;
}
