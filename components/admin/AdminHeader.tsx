"use client";

import React from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Menu, ExternalLink, Shield, Compass } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import Logo, { LogoIcon } from "@/components/Logo";

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  currentTheme?: string;
}

export default function AdminHeader({ onToggleSidebar, currentTheme = "light" }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#F7F3EC]/90 dark:bg-[#111]/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-4 sm:px-6 lg:px-8 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Sidebar Toggle + Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-[#3E2723] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Toggle Admin Menu"
          >
            <Menu size={20} />
          </button>

          <div className="lg:hidden flex items-center gap-2">
            <LogoIcon size={26} />
            <span className="text-sm font-black tracking-tight text-[#3E2723] dark:text-white">
              Admin
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-40">
            <Shield size={14} />
            <span>Lentera Baca Management</span>
          </div>
        </div>

        {/* Right: Quick Website Link, ThemeToggle & User Profile */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-black/4 dark:bg-white/5 hover:bg-black/8 dark:hover:bg-white/10 text-[#3E2723] dark:text-white transition-all"
            title="Lihat Website Publik"
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">Lihat Website</span>
          </Link>

          <div className="h-4 w-px bg-black/10 dark:bg-white/10" />

          <ThemeToggle currentTheme={currentTheme} variant="minimal" />

          <div className="shrink-0 flex items-center">
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
}
