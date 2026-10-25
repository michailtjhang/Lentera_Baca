"use client";

import { useState } from "react";
import { convertToWebP } from "@/lib/image-utils";

export interface SwiftGramUploadedFile {
    url: string;
    key: string;
    name?: string;
    size?: number;
}

export interface UseSwiftGramUploadOptions {
    onClientUploadComplete?: (res: SwiftGramUploadedFile[]) => void;
    onUploadError?: (error: Error) => void;
    autoConvertToWebP?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
}

/**
 * React hook to upload files through the local SwiftGram API route (/api/upload).
 * Secara otomatis mengonversi & mengompresi gambar ke format WebP sebelum diupload
 * untuk memastikan payload ringan, cepat, dan kompatibel dengan Telegram storage.
 */
export function useSwiftGramUpload(
    endpointOrOptions?: string | UseSwiftGramUploadOptions,
    maybeOptions?: UseSwiftGramUploadOptions
) {
    const options = typeof endpointOrOptions === "object" ? endpointOrOptions : (maybeOptions || {});
    const [isUploading, setIsUploading] = useState(false);

    const startUpload = async (files: File[]): Promise<SwiftGramUploadedFile[]> => {
        if (!files || files.length === 0) return [];
        setIsUploading(true);

        try {
            // Dapatkan konfigurasi upload resmi dari server (untuk admin terotorisasi)
            let directConfig: { baseUrl: string; apiKey: string } | null = null;
            try {
                const authRes = await fetch("/api/upload", { method: "GET" });
                if (authRes.ok) {
                    const authData = await authRes.json();
                    if (authData.success && authData.baseUrl && authData.apiKey) {
                        directConfig = { baseUrl: authData.baseUrl.replace(/\/+$/, ""), apiKey: authData.apiKey };
                    }
                } else {
                    const errData = await authRes.json().catch(() => ({}));
                    if (errData.error && errData.error.includes("SWIFTGRAM_API_KEY")) {
                        throw new Error(errData.error);
                    }
                }
            } catch (authErr: any) {
                if (authErr.message?.includes("SWIFTGRAM_API_KEY")) {
                    throw authErr;
                }
                console.warn("Direct upload config fetch failed, will use server proxy:", authErr);
            }

            const results: SwiftGramUploadedFile[] = [];

            for (let file of files) {
                // Konversi gambar apa pun secara otomatis ke WebP sebelum di-upload
                if (options.autoConvertToWebP !== false && file.type.startsWith("image/")) {
                    try {
                        file = await convertToWebP(file, {
                            maxWidth: options.maxWidth || 1920,
                            maxHeight: options.maxHeight || 1920,
                            quality: options.quality || 0.82,
                        });
                    } catch (convErr: any) {
                        console.error("Gagal mengonversi gambar ke WebP:", convErr);
                        throw new Error(`Gagal mengonversi gambar ke WebP: ${convErr.message}`);
                    }
                }

                const formData = new FormData();
                formData.append("file", file, file.name);

                let uploaded = false;

                // 1. Prioritaskan Direct Upload dari browser (menghindari blokir IP Datacenter Vercel oleh hosting)
                if (directConfig) {
                    try {
                        const directRes = await fetch(`${directConfig.baseUrl}/api/upload`, {
                            method: "POST",
                            headers: {
                                "X-API-KEY": directConfig.apiKey,
                                "Accept": "application/json",
                            },
                            body: formData,
                        });

                        const directData = await directRes.json().catch(() => ({}));

                        if (directRes.ok && directData.success && directData.data?.id) {
                            results.push({
                                url: `${directConfig.baseUrl}/api/gateway/${directData.data.id}`,
                                key: directData.data.id,
                                name: directData.data.original_name || file.name,
                                size: directData.data.size || file.size,
                            });
                            uploaded = true;
                        } else {
                            console.warn("Direct upload error, mencoba fallback server proxy:", directData);
                        }
                    } catch (directErr) {
                        console.warn("Direct upload failed, mencoba fallback server proxy:", directErr);
                    }
                }

                // 2. Fallback melalui Server Proxy (/api/upload) jika direct upload tidak berhasil
                if (!uploaded) {
                    const res = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                    });

                    const data = await res.json().catch(() => ({}));

                    if (!res.ok || !data.success || !data.data?.id) {
                        const errMsg = data.error || data.message || `Upload gagal dengan status ${res.status}`;
                        throw new Error(errMsg);
                    }

                    results.push({
                        url: data.data.url,
                        key: data.data.id,
                        name: data.data.original_name,
                        size: data.data.size,
                    });
                }
            }

            options.onClientUploadComplete?.(results);
            return results;
        } catch (err: any) {
            console.error("SwiftGram client upload error:", err);
            const errorObj = err instanceof Error ? err : new Error(String(err));
            options.onUploadError?.(errorObj);
            throw errorObj;
        } finally {
            setIsUploading(false);
        }
    };

    return {
        startUpload,
        isUploading,
    };
}

/**
 * Robust client-side helper to delete files from SwiftGram (or legacy storage).
 * Tries the Server Action first, then the /api/upload endpoint, then direct client DELETE.
 */
export async function deleteUploadedFile(keyOrUrl: string): Promise<{ success: boolean; error?: string }> {
    if (!keyOrUrl) return { success: true };

    const trimmed = keyOrUrl.trim();

    // 1. Try Next.js Server Action
    try {
        const { deleteFiles } = await import("@/app/actions/novel-actions");
        const res = await deleteFiles(trimmed);
        if (res && res.success) {
            return { success: true };
        }
    } catch (err: any) {
        console.warn("Server action deleteFiles attempt failed, trying API route fallback:", err);
    }

    // 2. Try Next.js API route DELETE /api/upload
    try {
        const apiRes = await fetch(`/api/upload?key=${encodeURIComponent(trimmed)}`, {
            method: "DELETE",
        });
        if (apiRes.ok) {
            const data = await apiRes.json().catch(() => ({}));
            if (data.success) {
                return { success: true };
            }
        }
    } catch (apiErr) {
        console.warn("API route DELETE fallback failed:", apiErr);
    }

    // 3. Try direct browser DELETE to SwiftGram if direct credentials are available
    try {
        const authRes = await fetch("/api/upload", { method: "GET" });
        if (authRes.ok) {
            const { baseUrl, apiKey } = await authRes.json();
            const uuidMatch = trimmed.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
            const id = uuidMatch ? uuidMatch[0] : trimmed;
            if (id && baseUrl && apiKey) {
                const directRes = await fetch(`${baseUrl.replace(/\/+$/, "")}/api/files/${id}`, {
                    method: "DELETE",
                    headers: {
                        "X-API-KEY": apiKey,
                        "Accept": "application/json",
                    },
                });
                if (directRes.ok || directRes.status === 404) {
                    return { success: true };
                }
            }
        }
    } catch (directErr) {
        console.warn("Direct client DELETE failed:", directErr);
    }

    // If it reaches here, return error message but do not throw
    return { success: false, error: "Gagal menghapus file dari storage server" };
}
