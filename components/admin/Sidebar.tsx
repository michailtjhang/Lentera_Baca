"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    BookOpen, 
    Layers, 
    PlusSquare, 
    ExternalLink, 
    LogOut,
    Menu,
    X,
    Settings
} from "lucide-react";
import { useState } from "react";
import { UserButton, SignOutButton } from "@clerk/nextjs";

const NAV_ITEMS = [
    { label: "Semua Novel", icon: LayoutDashboard, href: "/admin" },
    { label: "Tambah Novel", icon: PlusSquare, href: "/admin/novel/new" },
    { label: "Genres", icon: Layers, href: "/admin/genre" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const NavLink = ({ item }: { item: typeof NAV_ITEMS[0] }) => {
        const isActive = pathname === item.href;
        return (
            <Link
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                    isActive 
                        ? "bg-[#3E2723] text-white shadow-xl shadow-[#3E2723]/20" 
                        : "text-[#3E2723]/60 hover:text-[#3E2723] hover:bg-black/5"
                }`}
            >
                <item.icon size={20} />
                {item.label}
            </Link>
        );
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed bottom-6 right-6 z-[100] bg-[#3E2723] p-4 rounded-full text-white shadow-2xl hover:scale-110 active:scale-95 transition-all"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Desktop/Mobile */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/60 backdrop-blur-xl border-r border-black/5 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="h-full flex flex-col p-6">
                    {/* Branding */}
                    <div className="mb-10 px-4">
                        <Link href="/admin" className="block">
                            <h1 className="text-xl font-black tracking-tighter text-[#3E2723] uppercase">
                                LENTERA BACA
                            </h1>
                            <p className="text-[0.6rem] font-black text-[#3E2723]/30 uppercase tracking-[0.3em] mt-0.5">
                                Admin Platform
                            </p>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        <div className="px-4 mb-4 text-[0.65rem] font-black text-[#3E2723]/20 uppercase tracking-widest">
                            Management
                        </div>
                        {NAV_ITEMS.map((item) => (
                            <NavLink key={item.href} item={item} />
                        ))}
                    </nav>

                    {/* Footer Actions */}
                    <div className="pt-6 border-t border-black/5 space-y-2">
                        <Link
                            href="/"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#3E2723]/60 hover:text-[#3E2723] hover:bg-black/5 transition-all font-bold text-sm"
                        >
                            <ExternalLink size={20} />
                            View Site
                        </Link>
                        
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#3E2723]/40">
                             <UserButton showName={false} appearance={{
                                elements: {
                                    userButtonBox: "hover:bg-black/5 p-1 rounded-lg transition-all"
                                }
                             }} />
                             <div className="flex-1 flex flex-col">
                                <span className="text-xs font-bold text-[#3E2723]">Admin Account</span>
                                <SignOutButton>
                                    <button className="text-[0.6rem] font-bold uppercase tracking-widest text-[#3E2723]/30 hover:text-[#3E2723] transition-colors text-left">
                                        Logout
                                    </button>
                                </SignOutButton>
                             </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div 
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden fixed inset-0 z-40 bg-white/40 backdrop-blur-sm animate-in fade-in"
                />
            )}
        </>
    );
}
