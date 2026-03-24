"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
    id: string;
    novelTitle?: string;
    deleteAction: (id: string) => Promise<any>;
    variant?: "default" | "icon" | "list";
}

export default function DeleteButton({ id, novelTitle, deleteAction, variant = "default" }: DeleteButtonProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteAction(id);
            if (result && (result.success || !result.error)) {
                router.refresh();
                setShowConfirm(false);
            } else {
                alert("Gagal menghapus.");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Terjadi kesalahan.");
        } finally {
            setIsDeleting(false);
        }
    };

    const ConfirmDialog = () => (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-white/40 backdrop-blur-sm" 
                onClick={() => !isDeleting && setShowConfirm(false)}
            />
            <div className="relative bg-white p-10 rounded-[3rem] border border-black/5 shadow-2xl max-w-lg w-full transform animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-8">
                    <Trash2 size={32} />
                </div>
                <h3 className="text-3xl font-black text-[#3E2723] mb-3 tracking-tighter">Konfirmasi Hapus</h3>
                <p className="text-[#3E2723]/30 font-bold mb-10 leading-relaxed">
                    Apakah Anda yakin ingin menghapus <span className="text-[#3E2723] font-black italic">{novelTitle ? `"${novelTitle}"` : "ini"}</span>? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowConfirm(false)}
                        disabled={isDeleting}
                        className="flex-1 px-8 py-4 bg-black/5 text-[#3E2723] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black/10 transition-all disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex-1 px-8 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-80 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-rose-500/20"
                    >
                        {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                    </button>
                </div>
            </div>
        </div>
    );

    if (variant === "list") {
        return (
            <>
                <button
                    onClick={() => setShowConfirm(true)}
                    className="flex items-center gap-2 bg-white border border-rose-500/10 text-rose-500 px-8 py-3.5 rounded-[1.5rem] text-[0.7rem] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-sm active:scale-95"
                >
                    <Trash2 size={16} />
                    Hapus
                </button>
                {showConfirm && <ConfirmDialog />}
            </>
        );
    }

    if (variant === "icon") {
        return (
            <>
                <button
                    onClick={() => setShowConfirm(true)}
                    className="p-2.5 bg-rose-500 text-white rounded-xl transition-all shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95"
                    title="Hapus"
                >
                    <Trash2 size={16} />
                </button>
                {showConfirm && <ConfirmDialog />}
            </>
        );
    }

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                disabled={isDeleting}
                className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
            >
                <Trash2 size={16} />
                Hapus
            </button>
            {showConfirm && <ConfirmDialog />}
        </>
    );
}
