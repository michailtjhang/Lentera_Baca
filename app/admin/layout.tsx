import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#F5F5DC] text-[#3E2723] flex">
            {/* Sidebar Component */}
            <Sidebar />

            {/* Main Content Container */}
            <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
                {/* Background Decor */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#3E2723]/5 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#3E2723]/5 blur-[100px] rounded-full" />
                </div>
                
                <main className="flex-1 relative z-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
