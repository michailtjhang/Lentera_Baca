export async function convertToWebP(file: File): Promise<File> {
    // If it's already webp, just return it
    if (file.type === "image/webp") return file;

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(img.src);
                return reject(new Error('Canvas context not available'));
            }
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                URL.revokeObjectURL(img.src);
                if (!blob) return reject(new Error('Conversion failed'));
                
                // Create new filename with .webp extension
                const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                const newFile = new File([blob], newName, {
                    type: "image/webp",
                });
                resolve(newFile);
            }, 'image/webp', 0.85); // 0.85 quality is a good balance
        };
        img.onerror = (err) => {
            URL.revokeObjectURL(img.src);
            reject(err);
        };
        img.src = URL.createObjectURL(file);
    });
}
