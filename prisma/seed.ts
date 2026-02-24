import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Create a Novel
    const novel = await prisma.novel.upsert({
        where: { id: "test-novel" },
        update: {},
        create: {
            id: "test-novel",
            title: "Cahaya di Ujung Terowongan",
            author: "Eka Kurniawan",
            description: "Sebuah kisah tentang perjalanan seorang pemuda mencari jati diri di tengah hiruk pikuk kota tua Jakarta. Penuh dengan intrik, cinta, dan pengkhianatan.",
            coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000",
        },
    });

    console.log(`✅ Novel created: ${novel.title}`);

    // Create Chapters
    const chapters = [
        {
            id: "chapter-1",
            title: "Pertemuan Tak Sengaja",
            content: `Hujan turun dengan derasnya di kawasan Kota Tua. Raka berteduh di depan sebuah toko buku tua yang sudah hampir roboh. Di sanalah, untuk pertama kalinya, ia melihat gadis itu.

Gadis itu mengenakan payung merah menyala, kontras dengan langit yang kelabu. Ia berhenti tepat di depan Raka, tersenyum kecil, lalu masuk ke dalam toko buku. 

Tanpa berpikir panjang, Raka mengikutinya. Aroma kertas tua dan kopi langsung menyergap indra penciumannya. "Selamat datang," sapa sebuah suara serak dari balik meja kasir. Raka tak menghiraukan suara itu, matanya sibuk mencari sosok payung merah tadi.

Di rak paling belakang, ia menemukannya sedang menyentuh sampul buku kulit yang usang. "Buku itu bagus," kata Raka memberanikan diri. 

Gadis itu menoleh. Matanya berbinar. "Kamu tahu buku ini?"

"Hanya judulnya. Tapi aku suka aroma kertasnya," jawab Raka canggung.

Mereka mulai mengobrol. Tentang kota, tentang hujan, dan tentang mimpi-mimpi yang seringkali layu sebelum berkembang. Sore itu, di antara debu dan kata-kata, sebuah benih baru mulai tumbuh.`,
            order: 1,
            novelId: novel.id,
        },
        {
            id: "chapter-2",
            title: "Janji di Bawah Menara",
            content: `Satu minggu berlalu sejak pertemuan itu. Mereka sepakat bertemu di Lapangan Fatahillah saat mentari mulai tenggelam. Maya—suatu nama yang cantik—sudah menunggu di sana.

"Kamu terlambat," godanya saat Raka tiba dengan napas memburu.

"Maaf, keretanya sedikit bermasalah," Raka mencoba mengatur napas. 

Mereka berjalan menyusuri jalanan batu yang masih basah sisa hujan tadi siang. Bayangan Menara Syahbandar terlihat kokoh di kejauhan. 

"Raka, apa kamu pernah berpikir untuk pergi dari sini? Mencari sesuatu yang lebih... besar?" Maya bertanya tiba-tiba sambil menatap cakrawala yang mulai memerah.

Raka diam sejenak. "Jakarta memang menyesakkan, Maya. Tapi di sini aku punya akar. Pergi berarti meninggalkan segala yang membentukku."

"Tapi akar bisa membusuk jika tidak diberi ruang," balas Maya cepat. "Aku ingin mencari cahaya itu, Raka. Cahaya di ujung terowongan panjang ini."

Janji pun terucap. Tanpa banyak kata, mereka tahu bahwa perjalanan ini baru saja dimulai. Apapun rintangannya, mereka akan mencari cahaya itu bersama-sama.`,
            order: 2,
            novelId: novel.id,
        }
    ];

    for (const chapter of chapters) {
        await prisma.chapter.upsert({
            where: { id: chapter.id },
            update: {},
            create: chapter,
        });
    }

    console.log("✅ Chapters seeded.");
    console.log("✨ Seeding complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
