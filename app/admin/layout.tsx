import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#F7F3EC] dark:bg-[#0f0f0f] text-[#3E2723] dark:text-[#e8e8e8]">
            {/* Fixed Desktop Sidebar & Mobile Nav */}
            <Sidebar />

            {/* Main Content Area (Offset by sidebar width on desktop) */}
            <div className="md:pl-72 flex flex-col min-h-screen w-full">
                <main className="flex-1 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
