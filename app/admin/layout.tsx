import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#F7F3EC] dark:bg-[#111] text-[#3E2723] dark:text-[#e8e8e8] flex">
            {/* Sidebar Component */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
