/**
 * SwiftGram Custom Storage API Service
 * 
 * Base URL: https://swiftgram.michail.my.id
 * Endpoint Upload: POST /api/upload
 * Endpoint Delete: DELETE /api/files/{id}
 * Public Access:   GET /api/gateway/{id}
 */

export interface SwiftGramUploadResult {
    id: string;
    original_name: string;
    mime_type: string;
    size: number;
    url: string;
}

export interface SwiftGramUploadResponse {
    success: boolean;
    data?: SwiftGramUploadResult;
    error?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const SWIFTGRAM_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * Get SwiftGram configuration from environment variables
 */
export function getSwiftGramConfig() {
    const baseUrl = (process.env.SWIFTGRAM_BASE_URL || "https://swiftgram.michail.my.id").replace(/\/+$/, "");
    const apiKey = process.env.SWIFTGRAM_API_KEY || "";
    return { baseUrl, apiKey };
}

/**
 * Check if a string is a SwiftGram UUID
 */
export function isSwiftGramId(val: string): boolean {
    return UUID_REGEX.test(val.trim());
}

/**
 * Extract file identifier and storage type from URL or key string
 */
export function extractFileIdentifier(urlOrKey: string): { type: "swiftgram" | "uploadthing" | "unknown"; idOrKey: string } {
    if (!urlOrKey) return { type: "unknown", idOrKey: "" };

    const trimmed = urlOrKey.trim();

    // Check SwiftGram Gateway URL (e.g. https://swiftgram.michail.my.id/api/gateway/{id}?format=webp)
    if (trimmed.includes("/api/gateway/")) {
        const after = trimmed.split("/api/gateway/").pop() || "";
        const id = after.split("?")[0].split("/")[0].trim();
        if (id) {
            return { type: "swiftgram", idOrKey: id };
        }
    }

    // Check UploadThing URL (e.g. https://utfs.io/f/{key})
    if (trimmed.includes("utfs.io/f/")) {
        const key = trimmed.split("/f/").pop()?.split("?")[0].trim() || "";
        if (key) {
            return { type: "uploadthing", idOrKey: key };
        }
    }

    // Direct UUID or any URL containing a SwiftGram UUID pattern
    const uuidMatch = trimmed.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    if (uuidMatch) {
        return { type: "swiftgram", idOrKey: uuidMatch[0] };
    }

    // Otherwise, assume it's UploadThing key or other legacy identifier
    return { type: "uploadthing", idOrKey: trimmed };
}

/**
 * Generate public gateway URL for a SwiftGram file ID
 */
export function getSwiftGramUrl(id: string, options?: { webp?: boolean }): string {
    const { baseUrl } = getSwiftGramConfig();
    const query = options?.webp ? "?format=webp" : "";
    return `${baseUrl}/api/gateway/${id}${query}`;
}

/**
 * Upload a file to SwiftGram Storage API
 */
export async function uploadToSwiftGram(
    file: File | Blob,
    filename?: string
): Promise<SwiftGramUploadResponse> {
    const { baseUrl, apiKey } = getSwiftGramConfig();

    if (!apiKey) {
        throw new Error("SWIFTGRAM_API_KEY belum dikonfigurasi di environment (.env)");
    }

    const formData = new FormData();
    if (filename) {
        formData.append("file", file, filename);
    } else if (file instanceof File) {
        formData.append("file", file, file.name);
    } else {
        formData.append("file", file);
    }

    try {
        const response = await fetch(`${baseUrl}/api/upload`, {
            method: "POST",
            headers: {
                "X-API-KEY": apiKey,
                "User-Agent": SWIFTGRAM_USER_AGENT,
                "Accept": "application/json",
            },
            body: formData,
        });

        const rawText = await response.text();

        if (!response.ok) {
            let errorMsg = `SwiftGram upload error: HTTP ${response.status} ${response.statusText}`;
            try {
                const errJson = JSON.parse(rawText);
                if (errJson.message || errJson.error) {
                    errorMsg = errJson.message || errJson.error;
                }
            } catch {
                if (rawText && rawText.length < 150) {
                    errorMsg = rawText;
                } else if (rawText.includes("Cloudflare") || rawText.includes("Attention Required") || rawText.includes("403 Forbidden")) {
                    errorMsg = "Akses diblokir oleh Cloudflare WAF/Bot Protection di domain SwiftGram (HTTP 403 Forbidden)";
                }
            }

            if (response.status === 403 && errorMsg.toLowerCase().includes("invalid api key")) {
                errorMsg = "SWIFTGRAM_API_KEY tidak valid atau belum disetel dengan benar di Vercel/Environment.";
            }

            throw new Error(errorMsg);
        }

        let json: any;
        try {
            json = JSON.parse(rawText);
        } catch {
            throw new Error(`Format response SwiftGram tidak valid (bukan JSON): ${rawText.slice(0, 100)}`);
        }

        if (!json.success || !json.data?.id) {
            throw new Error(json.message || json.error || "Format response SwiftGram upload tidak valid");
        }

        const id: string = json.data.id;
        const publicUrl = `${baseUrl}/api/gateway/${id}`;

        return {
            success: true,
            data: {
                id,
                original_name: json.data.original_name || filename || (file instanceof File ? file.name : "uploaded_file"),
                mime_type: json.data.mime_type || file.type || "application/octet-stream",
                size: json.data.size || (file.size ?? 0),
                url: publicUrl,
            },
        };
    } catch (error: any) {
        console.error("SwiftGram uploadToSwiftGram error:", error);
        throw error;
    }
}

/**
 * Delete a file from SwiftGram Storage API
 */
export async function deleteFromSwiftGram(id: string): Promise<{ success: boolean; error?: string }> {
    const { baseUrl, apiKey } = getSwiftGramConfig();

    if (!apiKey) {
        console.warn("SWIFTGRAM_API_KEY belum dikonfigurasi. Lewati penghapusan ID:", id);
        return { success: false, error: "SWIFTGRAM_API_KEY tidak ada" };
    }

    try {
        const response = await fetch(`${baseUrl}/api/files/${id}`, {
            method: "DELETE",
            headers: {
                "X-API-KEY": apiKey,
                "User-Agent": SWIFTGRAM_USER_AGENT,
                "Accept": "application/json",
            },
        });

        const result = await response.json().catch(() => null);
        if (result?.message) {
            console.log(`SwiftGram delete [${id}]:`, result.message);
        }

        // 404 means the file was already deleted or doesn't exist; treat as resolved
        if (!response.ok && response.status !== 404) {
            if (response.status === 403) {
                console.warn(`SwiftGram delete blocked by Cloudflare Bot Protection for ID ${id} [HTTP 403]. Pastikan subdomain swiftgram.michail.my.id disetel DNS Only (Grey Cloud) di Cloudflare.`);
                return { success: false, error: "Cloudflare WAF memblokir akses server Vercel ke SwiftGram (HTTP 403)" };
            }
            return { success: false, error: result?.error || `Gagal menghapus file di SwiftGram: ${response.statusText}` };
        }

        return { success: true };
    } catch (error: any) {
        console.warn(`SwiftGram delete error for ID ${id}:`, error);
        return { success: false, error: error.message };
    }
}
