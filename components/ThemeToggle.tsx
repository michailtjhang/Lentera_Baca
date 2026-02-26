"use client";

import { useState, useTransition, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { updateUserTheme } from "@/app/actions";
import { Sun, Moon, Coffee } from "lucide-react";

interface ThemeToggleProps {
    currentTheme: string;
}

export default function ThemeToggle({ currentTheme }: ThemeToggleProps) {
    const { isSignedIn } = useUser();
    const [isPending, startTransition] = useTransition();
    const [activeTheme, setActiveTheme] = useState(currentTheme || "light");

    // Sync theme with DOM class list
    useEffect(() => {
        if (activeTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [activeTheme]);

    const handleToggle = (theme: "light" | "dark") => {
        if (theme === activeTheme) return;

        setActiveTheme(theme);

        // Only update server if user is signed in
        if (isSignedIn) {
            startTransition(async () => {
                try {
                    const result = await updateUserTheme(theme);
                    if (!result.success) {
                        console.error("Theme sync failed:", result.message);
                    }
                } catch (e) {
                    console.error("Theme toggle error:", e);
                }
            });
        }
    };

    return (
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 p-1.5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl z-50 ring-1 ring-black/5">
            <button
                onClick={() => handleToggle("light")}
                disabled={isPending}
                className={`p-3 rounded-2xl transition-all duration-300 ${activeTheme === "light"
                    ? "bg-[#F5F5DC] text-[#3E2723] scale-105 shadow-md"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                title="Sepia Mode"
            >
                <Coffee size={20} />
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
