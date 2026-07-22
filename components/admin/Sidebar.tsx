"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  PlusSquare,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  Home,
} from "lucide-react";
import { useState } from "react";
import { UserButton, SignOutButton } from "@clerk/nextjs";

const NAV_ITEMS = [
  { label: "Semua Novel", icon: LayoutDashboard, href: "/admin", description: "Kelola koleksi" },
  { label: "Tambah Novel", icon: PlusSquare, href: "/admin/novel/new", description: "Buat entri baru" },
  { label: "Manajemen Genre", icon: Layers, href: "/admin/genre", description: "Atur kategori" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const NavLink = ({ item }: { item: typeof NAV_ITEMS[0] }) => {
    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
    return (
      <Link
        href={item.href}
        onClick={() => setIsOpen(false)}
        className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
          isActive
            ? "bg-white/15 text-white shadow-lg shadow-black/20 border border-white/10"
            : "text-white/50 hover:text-white hover:bg-white/8"
        }`}
      >
        <div className={`p-1.5 rounded-xl transition-colors ${isActive ? "bg-white/20" : "group-hover:bg-white/10"}`}>
          <item.icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-none">{item.label}</p>
          <p className="text-[0.6rem] opacity-50 mt-0.5 leading-none">{item.description}</p>
        </div>
        {isActive && <ChevronRight size={14} className="opacity-40 shrink-0" />}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[100] bg-gradient-to-br from-amber-600 to-amber-800 p-4 rounded-2xl text-white shadow-2xl shadow-amber-900/40 hover:scale-110 active:scale-95 transition-all"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#2a1810] via-[#1e130c] to-[#150e08] border-r border-white/5 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-r-none">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="h-full flex flex-col p-5 relative z-10">
          {/* Branding */}
          <div className="mb-8 px-2">
            <Link href="/admin" className="block group">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/30">
                  <BookOpen size={15} className="text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-black tracking-tight text-white uppercase">
                    Lentera Baca
                  </h1>
                  <p className="text-[0.55rem] font-bold text-white/25 uppercase tracking-[0.25em]">
                    Admin Panel
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Section label */}
          <div className="px-4 mb-3">
            <p className="text-[0.55rem] font-black text-white/20 uppercase tracking-[0.3em]">
              Manajemen
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>

          {/* Divider */}
          <div className="h-px bg-white/5 my-4" />

          {/* Footer links */}
          <div className="space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-white/40 hover:text-white hover:bg-white/8 transition-all text-sm font-bold"
            >
              <div className="p-1.5 rounded-xl">
                <Home size={15} />
              </div>
              Lihat Website
            </Link>
          </div>

          {/* User section */}
          <div className="mt-3 p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
            <UserButton
              showName={false}
              appearance={{
                elements: {
                  userButtonBox: "hover:opacity-80 transition-opacity",
                },
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white/70 leading-tight">Admin</p>
              <SignOutButton>
                <button className="text-[0.6rem] font-bold uppercase tracking-widest text-white/30 hover:text-white/70 transition-colors mt-0.5">
                  Logout
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        />
      )}
    </>
  );
}
