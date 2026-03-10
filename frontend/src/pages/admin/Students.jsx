import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getStudentsSummary } from "../../services/adminStudentApi";

export default function Students(){
 const[students,setStudents] = useState([]);
 const[loading,setLoading] = useState(true);
 const[error,setError] = useState("");

 useEffect(()=>{
  load();
 },[]);

 const load = async()=>{
  try{
   setLoading(true);
   setError("");
   const res = await getStudentsSummary();
   setStudents(res.data || []);
  }catch{
   setError("Unable to load students.");
  }finally{
   setLoading(false);
  }
 };

 return(
  <AdminLayout>
   <div className="page-wrap max-w-6xl">
    <div className="flex items-center justify-between flex-wrap gap-3">
     <div>
      <h2 className="text-3xl font-bold">Students</h2>
      <p className="text-sm text-slate-500 mt-1">Track progress at a glance.</p>
     </div>
     <button className="btn btn-outline" onClick={load} disabled={loading}>Refresh</button>
    </div>

    {error && <div className="card-soft mt-6 p-4 text-sm text-red-600">{error}</div>}

    <div className="card mt-6 overflow-hidden">
     <div className="hidden md:grid grid-cols-4 gap-2 p-4 border-b border-slate-200 font-semibold text-sm bg-slate-50">
      <div>Name</div>
      <div>Email</div>
      <div>Problems</div>
      <div>Topics</div>
     </div>
     {loading && (
      <div className="p-4 text-sm text-slate-500">Loading students...</div>
     )}
     {!loading && students.map(s=>(
      <div key={s._id} className="p-4 border-b border-slate-100 text-sm md:grid md:grid-cols-4 md:gap-2">
       <div className="md:hidden text-xs uppercase tracking-widest text-slate-500 mb-1">Name</div>
       <div className="mb-3 md:mb-0">{s.name || "-"}</div>
       <div className="md:hidden text-xs uppercase tracking-widest text-slate-500 mb-1">Email</div>
       <div className="mb-3 md:mb-0 break-all">{s.email || "-"}</div>
       <div className="md:hidden text-xs uppercase tracking-widest text-slate-500 mb-1">Problems</div>
       <div className="mb-3 md:mb-0">{s.solvedProblems}/{s.totalProblems}</div>
       <div className="md:hidden text-xs uppercase tracking-widest text-slate-500 mb-1">Topics</div>
       <div>{s.solvedTopics}/{s.totalTopics}</div>
      </div>
     ))}
     {!loading && !students.length && !error && (
      <div className="p-4 text-sm text-slate-500">No students yet.</div>
     )}
    </div>
   </div>
  </AdminLayout>
 );
}
