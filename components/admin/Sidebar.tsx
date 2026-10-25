"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  PlusSquare,
  ExternalLink,
  ChevronRight,
  Home,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { LogoIcon } from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { UserButton, SignOutButton } from "@clerk/nextjs";

interface MainNavItem {
  label: string;
  icon: any;
  href: string;
  description: string;
  matcher: (pathname: string) => boolean;
}

const MAIN_NAV_ITEMS: MainNavItem[] = [
  {
    label: "Katalog Novel",
    icon: LayoutDashboard,
    href: "/admin",
    description: "Kelola & pantau semua novel",
    matcher: (path) => path === "/admin" || (path.startsWith("/admin/novel/") && !path.startsWith("/admin/novel/new")),
  },
  {
    label: "Tambah Novel",
    icon: PlusSquare,
    href: "/admin/novel/new",
    description: "Terbitkan novel baru",
    matcher: (path) => path.startsWith("/admin/novel/new"),
  },
  {
    label: "Manajemen Genre",
    icon: Layers,
    href: "/admin/genre",
    description: "Atur genre, tag & metadata",
    matcher: (path) => path.startsWith("/admin/genre"),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const NavContent = () => (
    <div className="h-full flex flex-col justify-between select-none relative z-10">
      {/* Top Header: Brand */}
      <div className="p-5 pb-4 shrink-0 border-b border-white/[0.08] flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="relative">
            <LogoIcon size={38} />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#1a0e07]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-white leading-none group-hover:text-amber-400 transition-colors">
              Lentera Baca
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[0.58rem] font-black text-amber-400/90 uppercase tracking-[0.2em] leading-none">
                Admin Panel
              </span>
              <span className="text-[0.5rem] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PRO
              </span>
            </div>
          </div>
        </Link>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-2 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10"
        >
          <X size={18} />
        </button>
      </div>

      {/* Middle: Scrollable Navigation Container */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 scrollbar-track-transparent">
        {/* Primary Navigation Section */}
        <div className="space-y-1.5">
          <div className="px-2.5 mb-2">
            <p className="text-[0.6rem] font-black text-amber-300/40 uppercase tracking-[0.25em]">
              Menu Utama
            </p>
          </div>

          <nav className="space-y-1.5">
            {MAIN_NAV_ITEMS.map((item) => {
              const isActive = item.matcher(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all duration-200 relative ${
                    isActive
                      ? "bg-gradient-to-r from-amber-600/30 to-amber-700/10 text-white font-bold border border-amber-500/30 shadow-lg shadow-amber-950/20"
                      : "text-white/65 hover:text-white hover:bg-white/6"
                  }`}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-gradient-to-b from-amber-400 to-amber-600 rounded-r-full shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
                  )}

                  <div
                    className={`p-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md shadow-amber-900/40 scale-105"
                        : "bg-white/5 text-white/70 group-hover:bg-white/10 group-hover:text-white group-hover:scale-105"
                    }`}
                  >
                    <item.icon size={16} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold leading-tight">{item.label}</p>
                    <p className="text-[0.62rem] opacity-50 mt-0.5 leading-tight truncate">
                      {item.description}
                    </p>
                  </div>

                  {isActive && (
                    <ChevronRight size={14} className="text-amber-400 shrink-0 animate-in fade-in" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Shortcut Card / System Status */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/5">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={13} className="text-amber-400" />
            <span className="text-[0.65rem] font-bold text-white/90 uppercase tracking-wider">
              Lentera Storage
            </span>
          </div>
          <p className="text-[0.62rem] text-white/50 leading-relaxed">
            SwiftGram Engine aktif untuk penyimpanan cover & ilustrasi chapter berkecepatan tinggi.
          </p>
        </div>
      </div>

      {/* Bottom Footer Section: Website Link, ThemeToggle & User Profile */}
      <div className="p-4 shrink-0 border-t border-white/[0.08] space-y-2.5 bg-black/25 backdrop-blur-md">
        {/* Quick link to live public site */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/6 transition-all text-xs font-bold group"
        >
          <div className="flex items-center gap-2.5">
            <Home size={15} className="text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Lihat Website</span>
          </div>
          <ExternalLink size={13} className="opacity-40 group-hover:opacity-80 transition-opacity" />
        </Link>

        {/* Theme Toggle bar */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/5 text-xs text-white/70">
          <span className="font-semibold text-[0.68rem]">Tema Tampilan</span>
          <ThemeToggle currentTheme="dark" variant="minimal" />
        </div>

        {/* User Profile */}
        <div className="p-2.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center gap-3">
          <UserButton
            showName={false}
            appearance={{
              elements: {
                userButtonBox: "hover:opacity-85 transition-opacity",
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate leading-tight">Administrator</p>
            <SignOutButton>
              <button className="text-[0.6rem] font-bold uppercase tracking-wider text-amber-400/70 hover:text-amber-400 transition-colors mt-0.5 cursor-pointer">
                Keluar Akun
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#180e08]/95 backdrop-blur-md border-b border-white/10 text-white w-full">
        <Link href="/admin" className="flex items-center gap-2.5">
          <LogoIcon size={30} />
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight leading-none">Lentera Baca</span>
            <span className="text-[0.55rem] font-bold text-amber-400 uppercase tracking-widest mt-0.5">Admin</span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Buka Menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Backdrop & Slide-over Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Panel */}
          <aside className="relative w-72 max-w-[85vw] h-full bg-gradient-to-b from-[#24130a] via-[#1a0e07] to-[#120a05] shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
            <NavContent />
          </aside>
        </div>
      )}

      {/* Desktop Fixed Permanent Sidebar */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-72 md:h-screen z-40 bg-gradient-to-b from-[#201007] via-[#160b05] to-[#0d0603] border-r border-white/[0.08] flex-col overflow-hidden select-none">
        {/* Decorative ambient subtle glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/[0.08] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-16 left-0 w-40 h-40 bg-orange-600/[0.08] rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
        </div>

        <NavContent />
      </aside>
    </>
  );
}
