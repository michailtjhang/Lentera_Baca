
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
// WebSocket setup not needed if using connection string directly or HTTP driver

// Connection setup based on environment variables

async function main() {
    console.log("🌱 Starting seed script with WebSocket support...");

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("❌ DATABASE_URL is not defined in environment!");
        process.exit(1);
    }

    const adapter = new PrismaNeon({ connectionString });
    const prisma = new PrismaClient({ adapter });

    try {
        console.log("📡 Attempting to connect to database...");
        await prisma.$connect();
        console.log("✅ Database connected!");

        console.log("📝 Seeding Novel...");
        const novel = await prisma.novel.upsert({
            where: { id: "test-novel" },
            update: {},
            create: {
                id: "test-novel",
                title: "Cahaya di Ujung Terowongan",
                slug: "cahaya-di-ujung-terowongan",
                author: "Eka Kurniawan",
                description: "Sebuah kisah tentang perjalanan seorang pemuda mencari jati diri di tengah hiruk pikuk kota tua Jakarta. Penuh dengan intrik, cinta, dan pengkhianatan.",
                coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000",
                status: "ONGOING",
            },
        });

        const chapters = [
            { id: "chapter-1", title: "Pertemuan Tak Sengaja", order: 1, novelId: novel.id, content: "Konten bab 1..." },
            { id: "chapter-2", title: "Janji di Bawah Menara", order: 2, novelId: novel.id, content: "Konten bab 2..." }
        ];

        for (const chapter of chapters) {
            await prisma.chapter.upsert({
                where: { id: chapter.id },
                update: {},
                create: chapter,
            });
        }

        console.log("✨ Seeding complete.");
    } catch (error) {
        console.error("❌ Seed failed:");
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
