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
  X,
  BookOpen,
  Sparkles,
} from "lucide-react";
import Logo, { LogoIcon } from "@/components/Logo";
import { UserButton, SignOutButton } from "@clerk/nextjs";

const NAV_ITEMS = [
  { label: "Semua Novel", icon: LayoutDashboard, href: "/admin", description: "Katalog & manajemen" },
  { label: "Tambah Novel", icon: PlusSquare, href: "/admin/novel/new", description: "Unggah novel baru" },
  { label: "Manajemen Genre", icon: Layers, href: "/admin/genre", description: "Kelola tag & kategori" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const NavLink = ({ item }: { item: typeof NAV_ITEMS[0] }) => {
    const isActive =
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(item.href);

    return (
      <Link
        href={item.href}
        onClick={onClose}
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
    <>
      {/* Sidebar Aside */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#24130a] via-[#1a0e07] to-[#120a05] border-r border-white/8 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Subtle decorative glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-10 left-0 w-36 h-36 bg-orange-600/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="h-full flex flex-col p-5 relative z-10">
          {/* Brand Header */}
          <div className="flex items-center justify-between mb-8 px-1">
            <Link href="/admin" onClick={onClose} className="flex items-center gap-3 group">
              <LogoIcon size={34} />
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-white leading-none">
                  Lentera Baca
                </span>
                <span className="text-[0.6rem] font-bold text-amber-400/80 uppercase tracking-[0.25em] mt-1 leading-none">
                  Admin Panel
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Tutup Menu"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Section label */}
          <div className="px-2 mb-2.5">
            <p className="text-[0.6rem] font-black text-amber-300/40 uppercase tracking-[0.25em]">
              Menu Utama
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>

          {/* Bottom Divider */}
          <div className="h-px bg-white/10 my-4" />

          {/* Return to website */}
          <div className="space-y-1.5">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/6 transition-all text-xs font-bold"
            >
              <div className="p-1.5 rounded-lg bg-white/5 text-white/70">
                <Home size={14} />
              </div>
              <span className="flex-1">Lihat Website</span>
              <ExternalLink size={12} className="opacity-40" />
            </Link>
          </div>

          {/* User profile footer */}
          <div className="mt-3 p-3 rounded-2xl bg-white/5 border border-white/8 flex items-center gap-3">
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
      </aside>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        />
      )}
    </>
  );
}
