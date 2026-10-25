import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin";
import { uploadToSwiftGram, getSwiftGramConfig } from "@/lib/swiftgram";

export async function GET(req: NextRequest) {
    try {
        await checkAdmin();
        const { baseUrl, apiKey } = getSwiftGramConfig();
        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: "SWIFTGRAM_API_KEY belum dikonfigurasi di Vercel/Environment" },
                { status: 500 }
            );
        }
        return NextResponse.json({ success: true, baseUrl, apiKey });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Unauthorized" },
            { status: 401 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        // Authenticate admin
        await checkAdmin();

        const formData = await req.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof Blob)) {
            return NextResponse.json(
                { success: false, error: "File tidak ditemukan dalam form-data (key 'file' dibutuhkan)" },
                { status: 400 }
            );
        }

        const filename = file instanceof File ? file.name : "uploaded_file";
        const result = await uploadToSwiftGram(file, filename);

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: result.data!.id,
                    url: result.data!.url,
                    key: result.data!.id,
                    original_name: result.data!.original_name,
                    mime_type: result.data!.mime_type,
                    size: result.data!.size,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("API /api/upload error:", error);

        const isAuthError = 
            error.message?.toLowerCase().includes("unauthorized") || 
            error.message?.toLowerCase().includes("admin");

        return NextResponse.json(
            {
                success: false,
                error: error.message || "Gagal mengunggah file ke SwiftGram Storage",
            },
            { status: isAuthError ? 401 : 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await checkAdmin();
        const url = new URL(req.url);
        let key = url.searchParams.get("key");

        if (!key) {
            const body = await req.json().catch(() => ({}));
            key = body.key || body.url || body.id;
        }

        if (!key) {
            return NextResponse.json(
                { success: false, error: "Parameter 'key' atau 'url' wajib disertakan" },
                { status: 400 }
            );
        }

        const { deleteFiles } = await import("@/app/actions/novel-actions");
        const result = await deleteFiles(key);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("API /api/upload DELETE error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Gagal menghapus file" },
            { status: 500 }
        );
    }
}
