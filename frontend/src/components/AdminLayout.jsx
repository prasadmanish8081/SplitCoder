import { useState } from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex flex-col md:flex-row md:h-screen min-h-screen bg-transparent">
            <div className="md:hidden sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur px-4 py-3 flex items-center justify-between">
                <div className="font-semibold">Admin Panel</div>
                <button
                    className="btn btn-outline px-3 py-1 text-sm"
                    onClick={() => setSidebarOpen((prev) => !prev)}
                >
                    {sidebarOpen ? "Close" : "Menu"}
                </button>
            </div>

            {sidebarOpen && (
                <div className="md:hidden border-b border-slate-200">
                    <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
                </div>
            )}

            <div className="hidden md:block md:sticky md:top-0 md:h-screen">
                <AdminSidebar />
            </div>
            <div className="flex-1 md:overflow-y-auto">
                <div className="p-3 sm:p-4 md:p-6 bg-transparent">{children}</div>
            </div>
        </div>
    )
}
