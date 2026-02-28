"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
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
    Quote
} from "lucide-react";

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const toggleButton = (action: string, options?: any) => (e: React.MouseEvent) => {
        e.preventDefault();
        (editor.chain().focus() as any)[action](options).run();
    };

    const Button = ({ onClick, isActive, icon: Icon, title }: any) => (
        <button
            onClick={onClick}
            title={title}
            className={`p-2 rounded-lg transition-all ${
                isActive ? "bg-[#3E2723] text-[#F5F5DC] dark:bg-white dark:text-black" : "hover:bg-black/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100"
            }`}
        >
            <Icon size={16} />
        </button>
    );

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-t-2xl">
            <Button 
                onClick={toggleButton("toggleBold")} 
                isActive={editor.isActive("bold")} 
                icon={Bold} 
                title="Bold" 
            />
            <Button 
                onClick={toggleButton("toggleItalic")} 
                isActive={editor.isActive("italic")} 
                icon={Italic} 
                title="Italic" 
            />
            <Button 
                onClick={toggleButton("toggleUnderline")} 
                isActive={editor.isActive("underline")} 
                icon={UnderlineIcon} 
                title="Underline" 
            />
            <div className="w-px h-4 bg-black/10 dark:bg-white/20 mx-1" />
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
                title="Quote" 
            />
            <div className="w-px h-4 bg-black/10 dark:bg-white/20 mx-1" />
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
                title="Ordered List" 
            />
            <div className="w-px h-4 bg-black/10 dark:bg-white/20 mx-1" />
            <Button 
                onClick={() => editor.chain().focus().undo().run()} 
                icon={Undo} 
                title="Undo" 
            />
            <Button 
                onClick={() => editor.chain().focus().redo().run()} 
                icon={Redo} 
                title="Redo" 
            />
        </div>
    );
};

export default function Editor({ value, onChange, placeholder }: EditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4 text-sm font-medium leading-relaxed",
            },
        },
    });

    return (
        <div className="w-full border border-black/5 dark:border-white/10 rounded-2xl bg-white/30 dark:bg-white/5 focus-within:border-black/20 dark:focus-within:border-white/30 transition-all overflow-hidden">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
            <style jsx global>{`
                .tiptap p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #adb5bd;
                    pointer-events: none;
                    height: 0;
                }
                .tiptap ul { list-style-type: disc; padding-left: 1.5rem; }
                .tiptap ol { list-style-type: decimal; padding-left: 1.5rem; }
                .tiptap blockquote { border-left: 4px solid #ccc; padding-left: 1rem; font-style: italic; }
            `}</style>
        </div>
    );
}
