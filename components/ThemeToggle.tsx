"use client";

import { useState, useTransition } from "react";
import { updateUserTheme } from "@/app/actions";
import { Sun, Moon, Coffee } from "lucide-react";

interface ThemeToggleProps {
    currentTheme: string;
}

export default function ThemeToggle({ currentTheme }: ThemeToggleProps) {
    const [isPending, startTransition] = useTransition();
    const [activeTheme, setActiveTheme] = useState(currentTheme);

    const handleToggle = (theme: "light" | "dark") => {
        setActiveTheme(theme);
        startTransition(async () => {
            await updateUserTheme(theme);
        });
    };

    return (
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl z-50">
            <button
                onClick={() => handleToggle("light")}
                disabled={isPending}
                className={`p-3 rounded-full transition-all ${activeTheme === "light"
                        ? "bg-[#F5F5DC] text-[#3E2723] scale-110 shadow-lg"
                        : "text-gray-400 hover:text-white"
                    }`}
                title="Light/Sepia Mode"
            >
                <Coffee size={24} />
            </button>
            <button
                onClick={() => handleToggle("dark")}
                disabled={isPending}
                className={`p-3 rounded-full transition-all ${activeTheme === "dark"
                        ? "bg-gray-800 text-gray-100 scale-110 shadow-lg"
                        : "text-gray-400 hover:text-white"
                    }`}
                title="Dark Mode"
            >
                <Moon size={24} />
            </button>
        </div>
    );
}
