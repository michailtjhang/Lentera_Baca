"use client";

import { useState, useId } from "react";
import { 
    Trash2, 
    AlertTriangle, 
    X, 
    Loader2, 
    ShieldAlert, 
    Check, 
    ArrowRight, 
    ChevronLeft,
    Copy,
    CheckCheck
} from "lucide-react";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
    id: string;
    novelTitle?: string;
    itemName?: string;
    deleteAction: (id: string) => Promise<any>;
    variant?: "default" | "icon" | "list";
    onSuccess?: () => void;
}

export default function DeleteButton({ 
    id, 
    novelTitle, 
    itemName,
    deleteAction, 
    variant = "default",
    onSuccess 
}: DeleteButtonProps) {
    // modalStep: 0 = closed, 1 = initial confirmation, 2 = 2-field strict verification (for novels)
    const [modalStep, setModalStep] = useState<0 | 1 | 2>(0);
    const [fieldNovel, setFieldNovel] = useState("");
    const [fieldTitle, setFieldTitle] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const router = useRouter();
    const effectiveTitle = novelTitle || itemName || "";
    const isNovelMode = !!novelTitle;

    const targetFieldNovel = "delete-novel";
    const targetFieldTitle = `delete-${effectiveTitle.trim()}`;

    const isField1Valid = fieldNovel.trim().toLowerCase() === targetFieldNovel.toLowerCase();
    const isField2Valid = fieldTitle.trim().toLowerCase() === targetFieldTitle.toLowerCase();
    const canSubmitStep2 = isField1Valid && isField2Valid;

    const resetState = () => {
        setModalStep(0);
        setFieldNovel("");
        setFieldTitle("");
        setErrorMessage(null);
        setCopiedField(null);
    };

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(key);
        setTimeout(() => setCopiedField(null), 1500);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setErrorMessage(null);
        try {
            const result = await deleteAction(id);
            if (result && (result.success || !result.error)) {
                resetState();
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.refresh();
                }
            } else {
                setErrorMessage(result?.error || "Gagal menghapus item.");
            }
        } catch (error: any) {
            console.error("Delete error:", error);
            setErrorMessage(error?.message || "Terjadi kesalahan sistem saat menghapus.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            {/* ─── TRIGGER BUTTONS ────────────────────────────────────────── */}
            {variant === "list" && (
                <button
                    type="button"
                    onClick={() => setModalStep(1)}
                    className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-500/20 hover:border-rose-500 transition-all active:scale-95 shadow-sm"
                    title="Hapus Novel"
                >
                    <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                    <span>Hapus</span>
                </button>
            )}

            {variant === "icon" && (
                <button
                    type="button"
                    onClick={() => setModalStep(1)}
                    className="p-2 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 hover:border-rose-500 transition-all active:scale-95 shadow-sm"
                    title="Hapus"
                >
                    <Trash2 size={14} />
                </button>
            )}

            {variant === "default" && (
                <button
                    type="button"
                    onClick={() => setModalStep(1)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-rose-600/20 active:scale-95"
                >
                    <Trash2 size={14} />
                    <span>Hapus</span>
                </button>
            )}

            {/* ─── MODAL DIALOGS ──────────────────────────────────────────── */}
            {modalStep > 0 && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
                        onClick={() => !isDeleting && resetState()}
                    />

                    {/* Modal Window */}
                    <div className="relative w-full max-w-lg bg-white dark:bg-[#18181b] border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 transition-all">
                        {/* Header Stripe */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-red-500 to-amber-500" />

                        {/* Close button */}
                        <button
                            type="button"
                            onClick={resetState}
                            disabled={isDeleting}
                            className="absolute top-4 right-4 p-2 rounded-full text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-40"
                        >
                            <X size={18} />
                        </button>

                        <div className="p-6 sm:p-8">
                            {/* ─── STEP 1: INITIAL CONFIRMATION ──────────────── */}
                            {modalStep === 1 && (
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                                            <AlertTriangle size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[0.65rem] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">
                                                Konfirmasi Penghapusan
                                            </span>
                                            <h3 className="text-xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
                                                {isNovelMode ? "Hapus Novel Ini?" : "Hapus Item Ini?"}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Item highlight card */}
                                    <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1.5">
                                        <p className="text-xs font-semibold opacity-60">Target yang akan dihapus:</p>
                                        <p className="text-sm font-black text-rose-700 dark:text-rose-300 break-words">
                                            {effectiveTitle || "Item terpilih"}
                                        </p>
                                        {isNovelMode && (
                                            <p className="text-[0.7rem] opacity-60 leading-relaxed pt-1 border-t border-black/5 dark:border-white/5">
                                                ⚠️ Seluruh bab cerita (chapters), volume, riwayat baca, serta berkas file terkait akan terhapus secara permanen.
                                            </p>
                                        )}
                                    </div>

                                    <p className="text-xs opacity-70 leading-relaxed">
                                        Tindakan ini bersifat destruktif dan <strong>tidak dapat dibatalkan</strong> setelah dieksekusi.
                                    </p>

                                    {errorMessage && (
                                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
                                            {errorMessage}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={resetState}
                                            disabled={isDeleting}
                                            className="flex-1 py-3 px-4 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                                        >
                                            Batal
                                        </button>

                                        {isNovelMode ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setErrorMessage(null);
                                                    setModalStep(2);
                                                }}
                                                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 active:scale-98"
                                            >
                                                <span>Lanjut Verifikasi</span>
                                                <ArrowRight size={14} />
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleDelete}
                                                disabled={isDeleting}
                                                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 disabled:opacity-50"
                                            >
                                                {isDeleting ? (
                                                    <>
                                                        <Loader2 size={14} className="animate-spin" />
                                                        <span>Menghapus...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Trash2 size={14} />
                                                        <span>Ya, Hapus</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ─── STEP 2: 2-FIELD STRICT CONFIRMATION (FOR NOVELS) ──── */}
                            {modalStep === 2 && (
                                <div className="space-y-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                                            <ShieldAlert size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[0.65rem] font-black uppercase tracking-widest text-red-600 dark:text-red-400">
                                                Langkah Keamanan Terakhir
                                            </span>
                                            <h3 className="text-xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
                                                Verifikasi Input Penghapusan
                                            </h3>
                                        </div>
                                    </div>

                                    <p className="text-xs opacity-70 leading-relaxed">
                                        Untuk mencegah kesalahan penghapusan tidak sengaja, mohon isi <strong>2 field</strong> di bawah dengan teks yang sesuai:
                                    </p>

                                    {/* FIELD 1 */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <label className="font-bold opacity-80 flex items-center gap-1.5">
                                                <span>1. Ketik persis:</span>
                                                <code className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-rose-600 dark:text-rose-400 font-mono text-[0.7rem] font-bold">
                                                    {targetFieldNovel}
                                                </code>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFieldNovel(targetFieldNovel);
                                                    handleCopy(targetFieldNovel, "field1");
                                                }}
                                                className="text-[0.65rem] font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                                                title="Isi otomatis field 1"
                                            >
                                                {copiedField === "field1" ? (
                                                    <CheckCheck size={11} className="text-emerald-500" />
                                                ) : (
                                                    <Copy size={11} />
                                                )}
                                                <span>Isi otomatis</span>
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={fieldNovel}
                                                onChange={(e) => setFieldNovel(e.target.value)}
                                                placeholder={targetFieldNovel}
                                                disabled={isDeleting}
                                                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono transition-all outline-none border ${
                                                    isField1Valid
                                                        ? "border-emerald-500 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300 focus:ring-2 focus:ring-emerald-500/20"
                                                        : "border-black/15 dark:border-white/15 bg-white dark:bg-white/5 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                                                }`}
                                            />
                                            {isField1Valid && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                                                    <Check size={14} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* FIELD 2 */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <label className="font-bold opacity-80 flex items-center gap-1.5 truncate max-w-[80%]">
                                                <span>2. Ketik persis:</span>
                                                <code className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-rose-600 dark:text-rose-400 font-mono text-[0.7rem] font-bold truncate">
                                                    {targetFieldTitle}
                                                </code>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFieldTitle(targetFieldTitle);
                                                    handleCopy(targetFieldTitle, "field2");
                                                }}
                                                className="text-[0.65rem] font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 shrink-0"
                                                title="Isi otomatis field 2"
                                            >
                                                {copiedField === "field2" ? (
                                                    <CheckCheck size={11} className="text-emerald-500" />
                                                ) : (
                                                    <Copy size={11} />
                                                )}
                                                <span>Isi otomatis</span>
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={fieldTitle}
                                                onChange={(e) => setFieldTitle(e.target.value)}
                                                placeholder={targetFieldTitle}
                                                disabled={isDeleting}
                                                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono transition-all outline-none border ${
                                                    isField2Valid
                                                        ? "border-emerald-500 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300 focus:ring-2 focus:ring-emerald-500/20"
                                                        : "border-black/15 dark:border-white/15 bg-white dark:bg-white/5 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                                                }`}
                                            />
                                            {isField2Valid && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                                                    <Check size={14} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {errorMessage && (
                                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
                                            {errorMessage}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setModalStep(1)}
                                            disabled={isDeleting}
                                            className="py-3 px-4 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                        >
                                            <ChevronLeft size={14} />
                                            <span>Kembali</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            disabled={!canSubmitStep2 || isDeleting}
                                            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                                                canSubmitStep2 && !isDeleting
                                                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30 active:scale-98 cursor-pointer"
                                                    : "bg-black/10 dark:bg-white/10 text-black/30 dark:text-white/30 cursor-not-allowed shadow-none"
                                            }`}
                                        >
                                            {isDeleting ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" />
                                                    <span>Menghapus Novel...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 size={14} />
                                                    <span>Hapus Novel Permanen</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
