"use client";

import { useState } from "react";
import { Plus, Search, Layers } from "lucide-react";
import Link from "next/link";
import AdminNovelListCard from "./AdminNovelListCard";

interface AdminDashboardProps {
    initialNovels: any[];
}

export default function AdminDashboard({ initialNovels }: AdminDashboardProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");

    const filteredNovels = initialNovels.filter((novel) => {
        const matchesSearch = novel.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "ALL" || novel.type === typeFilter;
        return matchesSearch && matchesType;
    });

    return (
        <div className="p-6 lg:p-10 space-y-10 text-[#3E2723]">
            {/* Header section with Stats & Context */}
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-[#3E2723] mb-4">Control Center.</h1>
                    
                    <div className="flex items-center gap-2.5 text-[#3E2723]/50 font-black text-[0.65rem] uppercase tracking-[0.2em]">
                         <Layers size={14} className="opacity-70" />
                         Manage <span className="text-[#3E2723] font-black">{initialNovels.length}</span> Active Collections
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-8 items-center border-t border-[#3E2723]/10 pt-10 mt-4">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-[#3E2723]/50 group-focus-within:text-[#3E2723] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Cari Judul..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none text-[#3E2723] pl-8 pr-6 py-4 outline-none transition-all font-black placeholder:text-[#3E2723]/45 text-xl tracking-tight"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 bg-[#3E2723]/10 p-2 rounded-[1.5rem] w-full md:w-auto mt-4 md:mt-0">
                        {["ALL", "WEB", "LIGHTNOVEL_WEB", "LIGHTNOVEL_PDF", "EPUB"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`px-8 py-3.5 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest transition-all duration-300 ${
                                    typeFilter === type 
                                        ? "bg-black text-white shadow-[0_15px_30px_-5px_rgba(0,0,0,0.2)] scale-105" 
                                        : "text-[#3E2723]/40 hover:text-[#3E2723]"
                                }`}
                            >
                                {type === "ALL" ? "Semua" : 
                                 type === "WEB" ? "Web" :
                                 type === "LIGHTNOVEL_WEB" ? "Volume" :
                                 type === "LIGHTNOVEL_PDF" ? "PDF" : "EPUB"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List display */}
            <div className="flex flex-col gap-8 max-w-7xl">
                {filteredNovels.map((novel) => (
                    <AdminNovelListCard key={novel.id} novel={novel} />
                ))}

                {filteredNovels.length === 0 && (
                    <div className="py-40 flex flex-col items-center justify-center text-center space-y-6 opacity-10">
                        <Search size={80} strokeWidth={1} />
                        <p className="text-2xl font-black uppercase tracking-widest">Novel tidak ditemukan</p>
                    </div>
                )}
            </div>
        </div>
    );
}
