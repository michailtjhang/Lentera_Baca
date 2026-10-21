"use client";

import { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  BookOpen, 
  Globe, 
  Layers, 
  FileText, 
  BarChart2, 
  TrendingUp, 
  X, 
  ArrowUpDown, 
  Filter, 
  RotateCcw 
} from "lucide-react";
import Link from "next/link";
import AdminNovelListCard from "./AdminNovelListCard";

interface AdminDashboardProps {
  initialNovels: any[];
}

const TYPE_FILTERS = [
  { label: "Semua Tipe", value: "ALL" },
  { label: "Web Novel", value: "WEB" },
  { label: "Light Novel", value: "LIGHTNOVEL_WEB" },
];

const STATUS_FILTERS = [
  { label: "Semua Status", value: "ALL" },
  { label: "Ongoing", value: "ONGOING" },
  { label: "Selesai", value: "COMPLETE" },
  { label: "Hiatus", value: "HIATUS" },
  { label: "Drop", value: "DROP" },
];

const SORT_OPTIONS = [
  { label: "Update Terkini", value: "updated" },
  { label: "Terbaru Dibuat", value: "newest" },
  { label: "Views Terbanyak", value: "popular" },
  { label: "Judul (A-Z)", value: "alpha" },
];

export default function AdminDashboard({ initialNovels }: AdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("updated");

  // Calculate live statistics
  const stats = useMemo(() => {
    return {
      total: initialNovels.length,
      web: initialNovels.filter((n) => n.type === "WEB").length,
      lightnovel: initialNovels.filter((n) => n.type === "LIGHTNOVEL_WEB").length,
      ongoing: initialNovels.filter((n) => n.status === "ONGOING").length,
      complete: initialNovels.filter((n) => n.status === "COMPLETE").length,
    };
  }, [initialNovels]);

  // Filter and sort novels
  const filteredNovels = useMemo(() => {
    let result = initialNovels.filter((novel) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        novel.title.toLowerCase().includes(q) ||
        (novel.author || "").toLowerCase().includes(q) ||
        (novel.tags || []).some((t: any) => t.name.toLowerCase().includes(q));

      const matchesType = typeFilter === "ALL" || novel.type === typeFilter;
      const matchesStatus = statusFilter === "ALL" || novel.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === "updated") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "popular") {
        return (b.views || 0) - (a.views || 0);
      }
      if (sortBy === "alpha") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [initialNovels, searchQuery, typeFilter, statusFilter, sortBy]);

  const hasActiveFilters = searchQuery !== "" || typeFilter !== "ALL" || statusFilter !== "ALL";

  const resetFilters = () => {
    setSearchQuery("");
    setTypeFilter("ALL");
    setStatusFilter("ALL");
    setSortBy("updated");
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    sub,
    color,
    filterValue,
    isActive,
    onClick,
  }: {
    icon: any;
    label: string;
    value: number;
    sub?: string;
    color: string;
    filterValue?: string;
    isActive?: boolean;
    onClick?: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer w-full group ${
        isActive
          ? "bg-amber-500/10 border-amber-500/50 shadow-md ring-2 ring-amber-500/20"
          : "bg-white dark:bg-white/5 border-black/8 dark:border-white/8 hover:border-black/15 dark:hover:border-white/15 hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl ${color}`}>
          <Icon size={16} className="text-white" />
        </div>
        <span className="text-[0.65rem] font-bold opacity-40 group-hover:opacity-80 transition-opacity">
          {sub || "Klik filter"}
        </span>
      </div>
      <p className="text-2xl sm:text-3xl font-black tracking-tight mb-0.5 text-[#2B1810] dark:text-white">
        {value}
      </p>
      <p className="text-[0.65rem] font-bold uppercase tracking-wider opacity-50 truncate">
        {label}
      </p>
    </button>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Main Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-black/5 dark:border-white/5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#2B1810] dark:text-white">
            Dashboard Manajemen Novel
          </h1>
          <p className="text-xs sm:text-sm opacity-50 font-medium mt-0.5">
            Kelola katalog novel, chapter, status rilis, dan volume cerita.
          </p>
        </div>

        <Link
          href="/admin/novel/new"
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:shadow-xl hover:shadow-amber-600/20 active:scale-95 transition-all w-full sm:w-auto shrink-0 shadow-md shadow-amber-600/20"
        >
          <Plus size={16} />
          <span>Tambah Novel Baru</span>
        </Link>
      </div>

      {/* Stats Cards Grid (Interactive click to filter) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={BookOpen}
          label="Total Koleksi"
          value={stats.total}
          sub="Semua"
          color="bg-gradient-to-br from-amber-500 to-amber-700"
          isActive={typeFilter === "ALL" && statusFilter === "ALL"}
          onClick={() => {
            setTypeFilter("ALL");
            setStatusFilter("ALL");
          }}
        />

        <StatCard
          icon={FileText}
          label="Web Novel"
          value={stats.web}
          sub={`${stats.total > 0 ? Math.round((stats.web / stats.total) * 100) : 0}%`}
          color="bg-gradient-to-br from-blue-500 to-blue-700"
          isActive={typeFilter === "WEB"}
          onClick={() => setTypeFilter(typeFilter === "WEB" ? "ALL" : "WEB")}
        />

        <StatCard
          icon={Layers}
          label="Light Novel"
          value={stats.lightnovel}
          sub={`${stats.total > 0 ? Math.round((stats.lightnovel / stats.total) * 100) : 0}%`}
          color="bg-gradient-to-br from-purple-500 to-purple-700"
          isActive={typeFilter === "LIGHTNOVEL_WEB"}
          onClick={() => setTypeFilter(typeFilter === "LIGHTNOVEL_WEB" ? "ALL" : "LIGHTNOVEL_WEB")}
        />

        <StatCard
          icon={BarChart2}
          label="Status Ongoing"
          value={stats.ongoing}
          sub={`${stats.total > 0 ? Math.round((stats.ongoing / stats.total) * 100) : 0}%`}
          color="bg-gradient-to-br from-emerald-500 to-emerald-700"
          isActive={statusFilter === "ONGOING"}
          onClick={() => setStatusFilter(statusFilter === "ONGOING" ? "ALL" : "ONGOING")}
        />
      </div>

      {/* Filter and Search Control Bar */}
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-black/8 dark:border-white/8 p-3.5 sm:p-4 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Cari judul novel, nama penulis, atau tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-black/4 dark:bg-white/5 border border-transparent focus:border-amber-500/50 focus:bg-white dark:focus:bg-[#18181b] outline-none transition-all text-xs font-medium text-[#2B1810] dark:text-white placeholder:opacity-40"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider opacity-40 shrink-0 hidden sm:inline">
              Urutkan:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-black/4 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[#2B1810] dark:text-white outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#1a1a1a] text-black dark:text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Pills: Type and Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/5 dark:border-white/5">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Type buttons */}
            <div className="flex items-center bg-black/4 dark:bg-white/5 p-1 rounded-xl">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setTypeFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    typeFilter === f.value
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Status buttons */}
            <div className="flex items-center bg-black/4 dark:bg-white/5 p-1 rounded-xl overflow-x-auto max-w-full">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatusFilter(s.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    statusFilter === s.value
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline px-2 py-1"
            >
              <RotateCcw size={12} />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Novel List Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold opacity-50">
            Menampilkan <strong className="opacity-100 text-[#2B1810] dark:text-white">{filteredNovels.length}</strong> dari {initialNovels.length} novel
          </p>
        </div>

        {filteredNovels.length > 0 ? (
          <div className="space-y-3">
            {filteredNovels.map((novel) => (
              <AdminNovelListCard key={novel.id} novel={novel} />
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-white/3 rounded-3xl border border-black/8 dark:border-white/8 p-6">
            <Search size={40} className="opacity-20 mb-3 text-amber-600" />
            <h3 className="text-base font-black tracking-tight text-[#2B1810] dark:text-white">
              Tidak Ada Novel yang Cocok
            </h3>
            <p className="text-xs opacity-50 max-w-sm mt-1 mb-4">
              {searchQuery ? `Tidak ditemukan novel dengan kata kunci "${searchQuery}".` : "Tidak ada novel dengan kombinasi filter yang dipilih."}
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 transition-all"
            >
              Bersihkan Filter & Pencarian
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
