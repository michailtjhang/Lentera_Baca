"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useSwiftGramUpload } from "@/lib/swiftgram-client";
import { convertToWebP } from "@/lib/image-utils";
import { deleteFiles } from "@/app/actions/novel-actions";
import { 
    Bold, 
    Italic, 
    Underline as UnderlineIcon, 
    List, 
    ListOrdered, 
    Undo, 
    Redo,
    Heading1,
    Heading2,
    Quote,
    Image as ImageIcon,
    Loader2,
    Trash2,
    X,
    AlertTriangle,
    ShieldAlert
} from "lucide-react";

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

// Helper to extract all image URLs from TipTap document
const getImageUrlsFromDoc = (doc: any): string[] => {
    const urls: string[] = [];
    if (!doc) return urls;
    doc.descendants((node: any) => {
        if (node.type?.name === "image" && node.attrs?.src) {
            urls.push(node.attrs.src);
        }
    });
    return urls;
};

const MenuBar = ({ editor, onDeleteSelectedImage }: { editor: any; onDeleteSelectedImage: () => void }) => {
    const { startUpload, isUploading } = useSwiftGramUpload({
        onClientUploadComplete: (res) => {
            const file = res[0];
            if (file && editor) {
                editor.chain().focus().setImage({ src: file.url }).run();
            }
        },
        onUploadError: (error) => {
            alert(`Gagal mengunggah gambar: ${error.message}`);
        },
    });

    if (!editor) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const webpFile = await convertToWebP(file);
            await startUpload([webpFile]);
        } catch (error: any) {
            console.error("WebP conversion failed:", error);
            alert(`Gagal memproses gambar: ${error.message}`);
        }
    };

    const toggleButton = (action: string, options?: any) => (e: React.MouseEvent) => {
        e.preventDefault();
        (editor.chain().focus() as any)[action](options).run();
    };

    const Button = ({ onClick, isActive, icon: Icon, title, className = "" }: any) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-2 rounded-lg transition-all text-xs font-semibold ${
                isActive 
                    ? "bg-[#3E2723] text-[#F5F5DC] dark:bg-white dark:text-black shadow-sm" 
                    : "hover:bg-black/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100"
            } ${className}`}
        >
            <Icon size={15} />
        </button>
    );

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-black/40 backdrop-blur-sm rounded-t-2xl">
            <Button 
                onClick={toggleButton("toggleBold")} 
                isActive={editor.isActive("bold")} 
                icon={Bold} 
                title="Tebal (Ctrl+B)" 
            />
            <Button 
                onClick={toggleButton("toggleItalic")} 
                isActive={editor.isActive("italic")} 
                icon={Italic} 
                title="Miring (Ctrl+I)" 
            />
            <Button 
                onClick={toggleButton("toggleUnderline")} 
                isActive={editor.isActive("underline")} 
                icon={UnderlineIcon} 
                title="Garis Bawah (Ctrl+U)" 
            />
            <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1" />
            <Button 
                onClick={toggleButton("toggleHeading", { level: 1 })} 
                isActive={editor.isActive("heading", { level: 1 })} 
                icon={Heading1} 
                title="Heading 1" 
            />
            <Button 
                onClick={toggleButton("toggleHeading", { level: 2 })} 
                isActive={editor.isActive("heading", { level: 2 })} 
                icon={Heading2} 
                title="Heading 2" 
            />
            <Button 
                onClick={toggleButton("toggleBlockquote")} 
                isActive={editor.isActive("blockquote")} 
                icon={Quote} 
                title="Kutipan" 
            />
            <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1" />
            <Button 
                onClick={toggleButton("toggleBulletList")} 
                isActive={editor.isActive("bulletList")} 
                icon={List} 
                title="Bullet List" 
            />
            <Button 
                onClick={toggleButton("toggleOrderedList")} 
                isActive={editor.isActive("orderedList")} 
                icon={ListOrdered} 
                title="Numbered List" 
            />
            <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1" />
            <Button 
                onClick={() => editor.chain().focus().undo().run()} 
                icon={Undo} 
                title="Undo (Ctrl+Z)" 
            />
            <Button 
                onClick={() => editor.chain().focus().redo().run()} 
                icon={Redo} 
                title="Redo (Ctrl+Y)" 
            />
            <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1" />
            
            {/* Upload image */}
            <label className="cursor-pointer" title="Sisipkan Gambar (WebP Auto)">
                <div className={`p-2 rounded-lg transition-all ${isUploading ? "opacity-40 animate-pulse" : "hover:bg-black/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100"}`}>
                    {isUploading ? <Loader2 size={15} className="animate-spin text-amber-600" /> : <ImageIcon size={15} />}
                </div>
                <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    disabled={isUploading} 
                />
            </label>

            {/* Delete Image button active only when image is focused/selected */}
            {editor.isActive("image") && (
                <Button 
                    onClick={onDeleteSelectedImage} 
                    icon={Trash2} 
                    title="Hapus Gambar Terpilih dari Server"
                    className="text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500 hover:text-white"
                />
            )}
        </div>
    );
};

export default function Editor({ value, onChange, placeholder }: EditorProps) {
    const [toast, setToast] = useState<{ count: number; id: number } | null>(null);
    const knownImagesRef = useRef<string[]>([]);
    const isInitialMountRef = useRef(true);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Image.configure({
                HTMLAttributes: {
                    class: "w-full h-auto rounded-2xl shadow-xl mx-auto my-8 block max-w-full object-cover",
                },
            }),
            Link.configure({
                openOnClick: false,
            }),
        ],
        content: value,
        onCreate: ({ editor }) => {
            knownImagesRef.current = getImageUrlsFromDoc(editor.state.doc);
            isInitialMountRef.current = false;
        },
        onUpdate: ({ editor }) => {
            const currentUrls = getImageUrlsFromDoc(editor.state.doc);
            const prevUrls = knownImagesRef.current;

            // Detect any image URL that was removed
            const deletedUrls = prevUrls.filter((url) => !currentUrls.includes(url));

            if (deletedUrls.length > 0 && !isInitialMountRef.current) {
                // Delete files from storage API
                for (const url of deletedUrls) {
                    deleteFiles(url).catch((err) => {
                        console.error("Gagal menghapus file gambar dari server:", err);
                    });
                }

                // Show top-right alert
                setToast({
                    count: deletedUrls.length,
                    id: Date.now(),
                });
            }

            knownImagesRef.current = currentUrls;
            onChange(editor.getHTML());
        },
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[220px] p-5 text-sm font-medium leading-relaxed",
            },
        },
    });

    // Auto-dismiss top-right toast after 5 seconds
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => {
            setToast(null);
        }, 5000);
        return () => clearTimeout(timer);
    }, [toast]);

    const handleDeleteSelectedImage = useCallback(() => {
        if (editor) {
            editor.chain().focus().deleteSelection().run();
        }
    }, [editor]);

    return (
        <div className="relative w-full">
            {/* ─── TOAST ALERT AT TOP-RIGHT CORNER ("POJOK KANAN") ─────── */}
            {toast && (
                <div 
                    role="alert"
                    className="fixed top-6 right-6 z-[999] max-w-sm w-[90vw] sm:w-[380px] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto"
                >
                    <div className="bg-white dark:bg-[#18181b] border-2 border-rose-500/40 dark:border-rose-400/40 rounded-2xl p-4 shadow-2xl flex items-start gap-3 backdrop-blur-xl">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
                            <Trash2 size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <h4 className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">
                                    Gambar Dihapus dari Server
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => setToast(null)}
                                    className="p-1 rounded-lg text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                            <p className="text-xs opacity-75 mt-1 font-medium leading-relaxed text-neutral-800 dark:text-neutral-200">
                                {toast.count > 1 ? `${toast.count} gambar` : "Gambar"} telah dihapus permanen dari API storage dan <strong className="text-rose-600 dark:text-rose-400 font-bold">tidak dapat di-undo</strong>.
                            </p>
                            <div className="mt-2.5 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-rose-700 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                                    <AlertTriangle size={10} />
                                    <span>Permanently Deleted</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── EDITOR CONTAINER ───────────────────────────────────── */}
            <div className="w-full border border-black/10 dark:border-white/10 rounded-2xl bg-white dark:bg-[#141416] focus-within:border-amber-500/50 dark:focus-within:border-amber-400/50 focus-within:ring-4 focus-within:ring-amber-500/10 transition-all overflow-hidden shadow-sm">
                <MenuBar editor={editor} onDeleteSelectedImage={handleDeleteSelectedImage} />
                <EditorContent editor={editor} />
                <style jsx global>{`
                    .tiptap img {
                        width: 100%;
                        height: auto;
                        border-radius: 1rem;
                        display: block;
                        margin: 2rem auto;
                        cursor: pointer;
                        transition: outline 0.2s;
                    }
                    .tiptap img.ProseMirror-selectednode {
                        outline: 3px solid #d97706;
                        box-shadow: 0 0 0 6px rgba(217, 119, 6, 0.2);
                    }
                    .tiptap p.is-editor-empty:first-child::before {
                        content: attr(data-placeholder);
                        float: left;
                        color: #a1a1aa;
                        pointer-events: none;
                        height: 0;
                    }
                    .tiptap ul { list-style-type: disc; padding-left: 1.5rem; }
                    .tiptap ol { list-style-type: decimal; padding-left: 1.5rem; }
                    .tiptap blockquote { border-left: 4px solid #d97706; padding-left: 1rem; font-style: italic; }
                `}</style>
            </div>
        </div>
    );
}
