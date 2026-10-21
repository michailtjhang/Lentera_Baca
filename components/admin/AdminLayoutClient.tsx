"use client";

import React, { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F3EC] dark:bg-[#0f0f0f] text-[#3E2723] dark:text-[#e8e8e8] flex">
      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full min-w-0">
        {/* Sticky Admin Header */}
        <AdminHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Page Children */}
        <main className="flex-1 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
