"use client";

import { useState, useTransition, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { updateUserTheme } from "@/app/actions";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
    currentTheme: string;
    variant?: "fixed" | "minimal";
}

export default function ThemeToggle({ currentTheme, variant = "fixed" }: ThemeToggleProps) {
    const { isSignedIn } = useUser();
    const [isPending, startTransition] = useTransition();
    const [activeTheme, setActiveTheme] = useState(currentTheme || "light");

    // Initialize from localStorage for guests
    useEffect(() => {
        const storedTheme = localStorage.getItem("lentera_baca_theme");
        if (storedTheme && (storedTheme === "light" || storedTheme === "dark")) {
            setActiveTheme(storedTheme);
        }
    }, []);

    // Sync theme with DOM class list and localStorage
    useEffect(() => {
        if (activeTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("lentera_baca_theme", activeTheme);
    }, [activeTheme]);

    const handleToggle = (theme: "light" | "dark") => {
        if (theme === activeTheme) return;
        setActiveTheme(theme);

        if (isSignedIn) {
            startTransition(async () => {
                try {
                    await updateUserTheme(theme);
                } catch (e) {
                    console.error("Theme toggle error:", e);
                }
            });
        }
    };


    if (variant === "minimal") {
        return (
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/5">
                <button
                    onClick={() => handleToggle("light")}
                    className={`p-1.5 rounded-lg transition-all ${activeTheme === "light" ? "bg-white dark:bg-zinc-800 shadow-sm text-[#3E2723] dark:text-white" : "opacity-40 hover:opacity-100"}`}
                    title="Light Mode"
                >
                    <Sun size={14} />
                </button>
                <button
                    onClick={() => handleToggle("dark")}
                    className={`p-1.5 rounded-lg transition-all ${activeTheme === "dark" ? "bg-white dark:bg-zinc-800 shadow-sm text-[#3E2723] dark:text-white" : "opacity-40 hover:opacity-100"}`}
                    title="Dark Mode"
                >
                    <Moon size={14} />
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 p-1.5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl z-50 ring-1 ring-black/5">
            <button
                onClick={() => handleToggle("light")}
                disabled={isPending}
                className={`p-3 rounded-2xl transition-all duration-300 ${activeTheme === "light"
                    ? "bg-[#F5F5DC] text-[#3E2723] scale-105 shadow-md"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                title="Mode Terang"
            >
                <Sun size={20} />
            </button>
            <button
                onClick={() => handleToggle("dark")}
                disabled={isPending}
                className={`p-3 rounded-2xl transition-all duration-300 ${activeTheme === "dark"
                    ? "bg-gray-800 text-gray-100 scale-105 shadow-md"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                title="Dark Mode"
            >
                <Moon size={20} />
            </button>
        </div>
    );
}

