import { Link } from "react-router-dom";

export default function AdminSidebar({ onNavigate }){
    return (
        <div className="w-full md:w-64 bg-slate-900 text-white h-full p-5 flex flex-col">
            <div className="mb-6">
                <div className="text-xs uppercase tracking-widest text-emerald-300">Dashboard</div>
                <h2 className="text-2xl font-bold mt-1">Admin</h2>
            </div>

            <nav className="flex flex-col gap-2 text-sm">
                <Link className="px-3 py-2 rounded-lg hover:bg-slate-800" to="/admin/dashboard" onClick={onNavigate}>Dashboard</Link>
                <Link className="px-3 py-2 rounded-lg hover:bg-slate-800" to="/admin/topics" onClick={onNavigate}>Topics</Link>
                <Link className="px-3 py-2 rounded-lg hover:bg-slate-800" to="/admin/problems" onClick={onNavigate}>Problems</Link>
                <Link className="px-3 py-2 rounded-lg hover:bg-slate-800" to="/admin/tutorials" onClick={onNavigate}>Tutorials</Link>
                <Link className="px-3 py-2 rounded-lg hover:bg-slate-800" to="/admin/instructions" onClick={onNavigate}>Instructions</Link>
                <Link className="px-3 py-2 rounded-lg hover:bg-slate-800" to="/admin/students" onClick={onNavigate}>Students</Link>
            </nav>
            <div className="mt-auto text-xs text-slate-400">
                Manage roadmap content and track learners.
            </div>
        </div>
    )
}
