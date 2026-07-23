"use client";

import { useState } from "react";
import { Plus, Search, BookOpen, Globe, Layers, FileText, BarChart2, TrendingUp } from "lucide-react";
import Link from "next/link";
import AdminNovelListCard from "./AdminNovelListCard";

interface AdminDashboardProps {
    initialNovels: any[];
}

const TYPE_FILTERS = [
    { label: "Semua", value: "ALL" },
    { label: "Web Novel", value: "WEB" },
    { label: "Light Novel", value: "LIGHTNOVEL_WEB" },
];

export default function AdminDashboard({ initialNovels }: AdminDashboardProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");

    const filteredNovels = initialNovels.filter((novel) => {
        const matchesSearch = novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (novel.author || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "ALL" || novel.type === typeFilter;
        return matchesSearch && matchesType;
    });

    // Stats
    const stats = {
        total: initialNovels.length,
        web: initialNovels.filter(n => n.type === "WEB").length,
        lightnovel: initialNovels.filter(n => n.type === "LIGHTNOVEL_WEB").length,
        ongoing: initialNovels.filter(n => n.status === "ONGOING").length,
    };

    const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) => (
        <div className={`bg-white dark:bg-white/5 rounded-2xl p-5 border border-black/5 dark:border-white/5 hover:shadow-lg transition-all duration-300 group`}>
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${color}`}>
                    <Icon size={16} className="text-white" />
                </div>
                <TrendingUp size={12} className="opacity-20 group-hover:opacity-50 transition-opacity" />
            </div>
            <p className="text-3xl font-black tracking-tighter mb-1">{value}</p>
            <p className="text-[0.65rem] font-bold uppercase tracking-widest opacity-40">{label}</p>
        </div>
    );

    return (
        <div className="p-6 lg:p-10 space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black tracking-tighter mb-1">
                        Dashboard
                    </h1>
                    <p className="text-sm opacity-40 font-medium">Kelola seluruh koleksi novel platform</p>
                </div>
                <Link
                    href="/admin/novel/new"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg shadow-amber-700/25 w-fit"
                >
                    <Plus size={16} />
                    Tambah Novel
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={BookOpen} label="Total Novel" value={stats.total} color="bg-gradient-to-br from-amber-500 to-amber-700" />
                <StatCard icon={FileText} label="Web Novel" value={stats.web} color="bg-gradient-to-br from-blue-500 to-blue-700" />
                <StatCard icon={Layers} label="Light Novel" value={stats.lightnovel} color="bg-gradient-to-br from-purple-500 to-purple-700" />
                <StatCard icon={BarChart2} label="Ongoing" value={stats.ongoing} color="bg-gradient-to-br from-rose-500 to-rose-700" />
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 p-4 flex flex-col md:flex-row gap-4 items-center shadow-sm">
                {/* Search */}
                <div className="relative flex-1 w-full group">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-60 transition-opacity" />
                    <input
                        type="text"
                        placeholder="Cari judul atau penulis..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-black/10 dark:focus:border-white/10 outline-none transition-all font-medium text-sm text-[#3E2723] dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30"
                    />
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-black/10 dark:bg-white/10 hidden md:block" />

                {/* Type Filter Tabs */}
                <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 p-1.5 rounded-xl overflow-x-auto w-full md:w-auto">
                    {TYPE_FILTERS.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setTypeFilter(f.value)}
                            className={`px-4 py-2 rounded-lg text-[0.65rem] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                                typeFilter === f.value
                                    ? "bg-white dark:bg-white/15 shadow-md text-[#3E2723] dark:text-white scale-[1.02]"
                                    : "text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Novel List */}
            <div>
                {/* List header */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold opacity-40">
                        Menampilkan <span className="font-black opacity-100 text-[#3E2723] dark:text-white">{filteredNovels.length}</span> dari {initialNovels.length} novel
                    </p>
                </div>

                <div className="space-y-3">
                    {filteredNovels.map((novel) => (
                        <AdminNovelListCard key={novel.id} novel={novel} />
                    ))}
                </div>

                {filteredNovels.length === 0 && (
                    <div className="py-24 flex flex-col items-center justify-center text-center bg-white dark:bg-white/3 rounded-3xl border border-black/5 dark:border-white/5">
                        <Search size={48} strokeWidth={1} className="opacity-10 mb-4" />
                        <p className="text-lg font-black uppercase tracking-widest opacity-20">Tidak ditemukan</p>
                        <p className="text-sm opacity-20 mt-2">Coba kata kunci atau filter lain</p>
                    </div>
                )}
            </div>
        </div>
    );
}
