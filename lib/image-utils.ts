export interface ConvertToWebPOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
}

/**
 * Mengonversi dan mengompresi gambar apa pun (PNG, JPEG, HEIC, WebP mentah, dll) ke format WebP.
 * Menyesuaikan dimensi agar tidak melebihi maxWidth/maxHeight untuk menghemat bandwidth
 * dan mencegah kegagalan pemrosesan / timeout di Telegram Storage.
 */
export async function convertToWebP(
    file: File,
    options: ConvertToWebPOptions = {}
): Promise<File> {
    const {
        maxWidth = 1920,
        maxHeight = 1920,
        quality = 0.82
    } = options;

    // Jika bukan file gambar, kembalikan apa adanya (misal PDF)
    if (!file.type.startsWith("image/")) {
        return file;
    }

    // Jika sudah webp dan ukurannya sudah sangat kecil (< 300KB), tidak perlu re-compress
    if (file.type === "image/webp" && file.size < 300 * 1024) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);

            let width = img.naturalWidth || img.width;
            let height = img.naturalHeight || img.height;

            if (!width || !height) {
                return reject(new Error("Dimensi gambar tidak valid"));
            }

            // Hitung skala aspect ratio jika melebihi batas maksimum
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                return reject(new Error("Gagal menginisialisasi Canvas 2D"));
            }

            // Downscaling berkualitas tinggi
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        return reject(new Error("Konversi gambar ke WebP gagal"));
                    }

                    // Buat nama file unik berakhiran .webp
                    const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "_");
                    const uniqueId = Math.random().toString(36).substring(2, 8) + Date.now().toString(36);
                    const newFileName = `${cleanName}-${uniqueId}.webp`;

                    const webpFile = new File([blob], newFileName, {
                        type: "image/webp",
                        lastModified: Date.now(),
                    });

                    resolve(webpFile);
                },
                "image/webp",
                quality
            );
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Gagal memuat gambar untuk proses konversi WebP"));
        };

        img.src = objectUrl;
    });
}
