"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteButtonProps {
    id: string;
    deleteAction: (id: string) => Promise<void>;
}

export default function DeleteButton({ id, deleteAction }: DeleteButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = () => {
        startTransition(async () => {
            try {
                await deleteAction(id);
                setShowConfirm(false);
            } catch (err) {
                console.error("Delete failed:", err);
                alert("Gagal menghapus data.");
            }
        });
    };

    if (showConfirm) {
        return (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                <span className="text-[0.6rem] font-black uppercase text-red-500">Yakin?</span>
                <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="p-3 bg-red-500 text-white rounded-xl hover:bg-black transition-all shadow-lg"
                >
                    {isPending ? <Loader2 size={14} className="animate-spin" /> : "Ya"}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    disabled={isPending}
                    className="p-3 bg-black/5 text-black/40 rounded-xl hover:bg-black/10 transition-all"
                >
                    Batal
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="p-4 text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white rounded-2xl transition-all"
            title="Hapus Novel"
        >
            <Trash2 size={18} />
        </button>
    );
}
