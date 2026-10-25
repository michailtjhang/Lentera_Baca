import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#F7F3EC] dark:bg-[#0f0f0f] text-[#3E2723] dark:text-[#e8e8e8] flex flex-col md:flex-row">
            {/* Admin Sidebar & Mobile Nav */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 flex flex-col min-h-screen">
                <main className="flex-1 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
