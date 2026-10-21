"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { 
  Search, 
  Menu, 
  X, 
  Compass, 
  Home, 
  Flame, 
  Clock, 
  Shield, 
  BookOpen, 
  Sparkles 
} from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

interface NavbarProps {
  currentTheme?: string;
  isAdmin?: boolean;
}

export default function Navbar({ currentTheme = "light", isAdmin = false }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on page change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "Beranda", href: "/", icon: Home },
    { label: "Jelajah", href: "/browse", icon: Compass },
    { label: "Populer", href: "/browse?sort=popular", icon: Flame },
    { label: "Update", href: "/browse?sort=updated", icon: Clock },
    { label: "Light Novel", href: "/browse?type=LIGHTNOVEL_WEB", icon: BookOpen },
    { label: "Web Novel", href: "/browse?type=NOVEL", icon: Sparkles },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#FDFBF7]/90 dark:bg-[#121212]/90 backdrop-blur-xl border-b border-black/8 dark:border-white/10 shadow-sm shadow-black/5"
            : "bg-[#FDFBF7]/75 dark:bg-[#121212]/75 backdrop-blur-md border-b border-black/5 dark:border-white/5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-3 sm:gap-6">
            {/* Brand Logo */}
            <div className="shrink-0">
              <Logo variant="full" size="md" />
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-2 lg:mx-6">
              <form action="/browse" method="GET" className="relative w-full group">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3E2723]/40 dark:text-white/40 group-focus-within:text-amber-600 dark:group-focus-within:text-amber-400 transition-colors pointer-events-none"
                />
                <input
                  type="text"
                  name="q"
                  placeholder="Cari judul, genre, penulis..."
                  className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-full bg-black/4 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:border-amber-500/50 focus:bg-white dark:focus:bg-[#18181b] focus:ring-2 focus:ring-amber-500/20 text-[#2B1810] dark:text-white outline-none transition-all placeholder:text-[#3E2723]/35 dark:placeholder:text-white/35"
                />
              </form>
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.slice(0, 4).map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "text-amber-800 dark:text-amber-300 bg-amber-500/10 font-black"
                        : "text-[#3E2723]/70 dark:text-white/70 hover:text-[#3E2723] dark:hover:text-white hover:bg-black/4 dark:hover:bg-white/5"
                    }`}
                  >
                    <Icon size={14} className="opacity-70" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/15 border border-amber-500/20 hover:bg-amber-500/25 transition-all ml-1"
                >
                  <Shield size={13} />
                  <span>Admin</span>
                </Link>
              )}
            </nav>

            {/* Right Actions: Theme Toggle, User, Mobile Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Mobile Search Trigger Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 rounded-xl text-[#3E2723]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Cari novel"
              >
                <Search size={19} />
              </button>

              {/* Theme Toggle */}
              <div className="shrink-0">
                <ThemeToggle currentTheme={currentTheme} variant="minimal" />
              </div>

              <div className="h-4 w-px bg-black/10 dark:bg-white/10 hidden sm:block" />

              {/* Auth Buttons */}
              <div className="flex items-center gap-2">
                <SignedIn>
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  <Link
                    href="/sign-in"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-amber-600/20 active:scale-95 transition-all"
                  >
                    Masuk
                  </Link>
                </SignedOut>
              </div>

              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-[#3E2723] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ml-1"
                aria-label="Buka menu navigasi"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>

          {/* Mobile Search Bar Dropdown */}
          {searchOpen && (
            <div className="md:hidden py-3 border-t border-black/5 dark:border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
              <form action="/browse" method="GET" className="relative w-full">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none"
                />
                <input
                  type="text"
                  name="q"
                  autoFocus
                  placeholder="Cari novel, penulis, genre..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-2xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-[#2B1810] dark:text-white outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </form>
            </div>
          )}
        </div>

        {/* Mobile Horizontal Scrollable Quick Nav Strip (Swipe / Geser ke kanan) */}
        <div className="lg:hidden w-full border-t border-black/5 dark:border-white/5 bg-[#FDFBF7]/90 dark:bg-[#121212]/90 backdrop-blur-md overflow-x-auto scrollbar-none touch-pan-x">
          <div className="flex items-center gap-1.5 px-4 py-2 min-w-max">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-amber-600 text-white shadow-sm shadow-amber-600/30"
                      : "bg-black/5 dark:bg-white/5 text-[#3E2723]/80 dark:text-white/80 hover:bg-black/10 dark:hover:bg-white/10"
                  }`}
                >
                  <Icon size={12} className={isActive ? "text-white" : "text-amber-600 dark:text-amber-400"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 whitespace-nowrap"
              >
                <Shield size={12} />
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer from Right (Geser ke Kanan / Sidebar Kanan) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-[85%] max-w-[320px] bg-[#FDFBF7] dark:bg-[#141414] border-l border-black/10 dark:border-white/10 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        aria-label="Menu navigasi mobile"
      >
        <div className="p-5 flex flex-col h-full overflow-y-auto">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10">
            <Logo variant="full" size="sm" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl text-[#3E2723]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Tutup menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Search */}
          <div className="mt-4">
            <form action="/browse" method="GET" className="relative w-full">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none"
              />
              <input
                type="text"
                name="q"
                placeholder="Cari novel..."
                className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-[#2B1810] dark:text-white outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </form>
          </div>

          {/* Nav List */}
          <div className="mt-5 space-y-1.5 flex-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-amber-600/10 text-amber-800 dark:text-amber-300 font-black"
                      : "text-[#3E2723]/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon size={17} className="text-amber-600 dark:text-amber-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <div className="pt-2">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-black text-amber-800 dark:text-amber-300 bg-amber-500/15 border border-amber-500/20"
                >
                  <Shield size={17} className="text-amber-600 dark:text-amber-400" />
                  <span>Panel Admin</span>
                </Link>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="pt-4 border-t border-black/5 dark:border-white/10 mt-auto text-xs text-[#3E2723]/50 dark:text-white/50 flex items-center justify-between">
            <span>Lentera Baca</span>
            <span>Versi 1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
