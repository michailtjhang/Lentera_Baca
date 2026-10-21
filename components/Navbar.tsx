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

  const navLinks = [
    { label: "Beranda", href: "/", icon: Home },
    { label: "Jelajah", href: "/browse", icon: Compass },
    { label: "Populer", href: "/browse?sort=popular", icon: Flame },
    { label: "Update", href: "/browse?sort=updated", icon: Clock },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
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
            {navLinks.map((item) => {
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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#3E2723] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ml-1"
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
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

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-black/5 dark:border-white/10 bg-[#FDFBF7] dark:bg-[#121212] px-6 py-5 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="space-y-1.5">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-amber-600/10 text-amber-800 dark:text-amber-300 font-black"
                      : "text-[#3E2723]/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon size={18} className="text-amber-600 dark:text-amber-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black text-amber-800 dark:text-amber-300 bg-amber-500/15 border border-amber-500/20"
              >
                <Shield size={18} className="text-amber-600 dark:text-amber-400" />
                <span>Panel Admin</span>
              </Link>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs opacity-50">
            <span>© 2026 Lentera Baca</span>
            <span>Versi 1.0</span>
          </div>
        </div>
      )}
    </header>
  );
}
