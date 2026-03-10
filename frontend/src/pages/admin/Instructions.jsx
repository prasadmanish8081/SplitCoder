import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getInstruction, updateInstruction } from "../../services/instructionApi";

export default function Instructions(){
 const[content,setContent] = useState("");
 const[saving,setSaving] = useState(false);
 const[loading,setLoading] = useState(true);
 const[error,setError] = useState("");

 useEffect(()=>{
  load();
 },[]);

 const load = async()=>{
  try{
   setLoading(true);
   setError("");
   const res = await getInstruction();
   setContent(res.data?.content || "");
  }catch{
   setError("Unable to load instructions.");
  }finally{
   setLoading(false);
  }
 };

 const save = async()=>{
  try{
   setSaving(true);
   await updateInstruction(content);
  }finally{
   setSaving(false);
  }
 };

 return(
  <AdminLayout>
   <div className="page-wrap max-w-5xl">
    <div className="flex items-center justify-between flex-wrap gap-3">
     <div>
      <h2 className="text-3xl font-bold">Instructions</h2>
      <p className="text-sm text-slate-500 mt-1">Write the learner guidelines.</p>
     </div>
     <button className="btn btn-outline" onClick={load} disabled={loading}>Refresh</button>
    </div>

    {error && <div className="card-soft mt-6 p-4 text-sm text-red-600">{error}</div>}

    <div className="card mt-6 p-5">
     <textarea
      className="textarea h-64"
      placeholder="Write student instructions here..."
      value={content}
      onChange={e=>setContent(e.target.value)}
     />
     <button className="btn btn-primary mt-4" onClick={save} disabled={saving}>
      {saving ? "Saving..." : "Save Instructions"}
     </button>
    </div>
   </div>
  </AdminLayout>
 );
}
