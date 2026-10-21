"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  PlusSquare,
  ExternalLink,
  ChevronRight,
  Home,
  Shield,
} from "lucide-react";
import { LogoIcon } from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { UserButton, SignOutButton } from "@clerk/nextjs";

const NAV_ITEMS = [
  { label: "Katalog Novel", icon: LayoutDashboard, href: "/admin", description: "Daftar & kelola koleksi" },
  { label: "Tambah Novel", icon: PlusSquare, href: "/admin/novel/new", description: "Terbitkan novel baru" },
  { label: "Manajemen Genre", icon: Layers, href: "/admin/genre", description: "Kelola tag & genre" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const NavLink = ({ item }: { item: typeof NAV_ITEMS[0] }) => {
    const isActive =
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(item.href);

    return (
      <Link
        href={item.href}
        className={`group flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-amber-600/25 to-amber-700/10 text-white font-bold border border-amber-500/30 shadow-md shadow-amber-900/20"
            : "text-white/60 hover:text-white hover:bg-white/6"
        }`}
      >
        <div
          className={`p-2 rounded-xl transition-colors ${
            isActive ? "bg-amber-600 text-white shadow-sm" : "bg-white/5 text-white/70 group-hover:bg-white/10 group-hover:text-white"
          }`}
        >
          <item.icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight">{item.label}</p>
          <p className="text-[0.62rem] opacity-45 mt-0.5 leading-tight truncate">{item.description}</p>
        </div>
        {isActive && <ChevronRight size={14} className="text-amber-400 shrink-0" />}
      </Link>
    );
  };

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 z-40 bg-gradient-to-b from-[#24130a] via-[#1a0e07] to-[#120a05] border-r border-white/8 select-none">
      {/* Decorative ambient subtle glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-10 left-0 w-36 h-36 bg-orange-600/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="h-full flex flex-col p-5 relative z-10 justify-between">
        {/* Top: Brand Header & Navigation */}
        <div className="space-y-6">
          {/* Brand Logo */}
          <Link href="/admin" className="flex items-center gap-3 group px-1">
            <LogoIcon size={36} />
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-white leading-none">
                Lentera Baca
              </span>
              <span className="text-[0.6rem] font-bold text-amber-400/80 uppercase tracking-[0.25em] mt-1 leading-none">
                Admin Panel
              </span>
            </div>
          </Link>

          {/* Section label */}
          <div className="px-2 pt-2">
            <p className="text-[0.6rem] font-black text-amber-300/40 uppercase tracking-[0.25em]">
              Menu Utama
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        </div>

        {/* Bottom Section: Website Link, ThemeToggle & User Profile */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          {/* Quick link to live public site */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/6 transition-all text-xs font-bold"
          >
            <div className="flex items-center gap-2.5">
              <Home size={15} className="text-amber-400" />
              <span>Lihat Website</span>
            </div>
            <ExternalLink size={13} className="opacity-40" />
          </Link>

          {/* Theme Toggle bar */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-white/70">
            <span className="font-semibold text-[0.7rem]">Tema Tampilan</span>
            <ThemeToggle currentTheme="dark" variant="minimal" />
          </div>

          {/* User Profile */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/8 flex items-center gap-3">
            <UserButton
              showName={false}
              appearance={{
                elements: {
                  userButtonBox: "hover:opacity-80 transition-opacity",
                },
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">Administrator</p>
              <SignOutButton>
                <button className="text-[0.6rem] font-bold uppercase tracking-wider text-amber-400/60 hover:text-amber-400 transition-colors mt-0.5 cursor-pointer">
                  Keluar Akun
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
