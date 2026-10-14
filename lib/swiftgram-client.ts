"use client";

import { useState } from "react";

export interface SwiftGramUploadedFile {
    url: string;
    key: string;
    name?: string;
    size?: number;
}

export interface UseSwiftGramUploadOptions {
    onClientUploadComplete?: (res: SwiftGramUploadedFile[]) => void;
    onUploadError?: (error: Error) => void;
}

/**
 * React hook to upload files through the local SwiftGram API route (/api/upload).
 * Supports both signatures:
 *   useSwiftGramUpload("coverUploader", options)
 *   useSwiftGramUpload(options)
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
            const results: SwiftGramUploadedFile[] = [];

            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file, file.name);

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
