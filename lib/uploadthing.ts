import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UTApi } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  // Upload cover image (Hanya image, disarankan WebP via UI)
  coverUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl, key: file.key };
  }),

  // Upload light novel file (PDF utama, EPUB bonus, max 100MB)
  lightNovelUploader: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    blob: { maxFileSize: "16MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl, key: file.key };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// Server Side API for deletion
export const utapi = new UTApi();
