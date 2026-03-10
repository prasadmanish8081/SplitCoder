import AdminLayout from "../../components/AdminLayout"

function Dashboard() {
  return (
    <AdminLayout>
        <div className="page-wrap max-w-5xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Welcome Admin</h1>
                <p className="text-sm text-slate-500 mt-1">Manage topics, problems, and students.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <div className="card p-5">
                    <div className="text-xs uppercase tracking-widest text-emerald-700">Topics</div>
                    <div className="text-lg font-semibold mt-2">Build the roadmap</div>
                    <p className="text-sm text-slate-600 mt-2">Add concepts and explanations to guide learners.</p>
                </div>
                <div className="card p-5">
                    <div className="text-xs uppercase tracking-widest text-emerald-700">Problems</div>
                    <div className="text-lg font-semibold mt-2">Assign practice</div>
                    <p className="text-sm text-slate-600 mt-2">Create challenges, hints, and testcases.</p>
                </div>
                <div className="card p-5">
                    <div className="text-xs uppercase tracking-widest text-emerald-700">Students</div>
                    <div className="text-lg font-semibold mt-2">Track progress</div>
                    <p className="text-sm text-slate-600 mt-2">Monitor solved topics and problems.</p>
                </div>
            </div>
        </div>
    </AdminLayout>
  )
}

export default Dashboard
