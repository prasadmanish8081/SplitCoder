import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getInstruction } from "../../services/instructionApi";
import StudentHeader from "../../components/StudentHeader";

export default function Instructions(){
 const { topicId } = useParams();
 const navigate = useNavigate();
 const location = useLocation();
 const[content,setContent] = useState("");
 const[checked,setChecked] = useState(false);
 const[loading,setLoading] = useState(true);
 const[error,setError] = useState("");

 useEffect(()=>{
  load();
 },[]);

 useEffect(()=>{
  if (topicId) localStorage.setItem("lastTopicId", topicId);
  localStorage.setItem("lastStudentRoute", location.pathname + location.search);
 }, [topicId, location.pathname, location.search]);

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

 return(
  <div className="page-anim page-shell">
   <StudentHeader/>
   <div className="page-wrap max-w-3xl">
    <div className="flex items-center justify-between flex-wrap gap-3">
     <div>
      <h1 className="text-3xl font-bold">Instructions</h1>
      <p className="text-sm text-slate-500 mt-1">Read carefully before starting.</p>
     </div>
     <button className="btn btn-outline" onClick={load} disabled={loading}>Refresh</button>
    </div>

    {error && (
     <div className="card-soft mt-6 p-4 text-sm text-red-600">{error}</div>
    )}

    <div className="card mt-6 p-5 whitespace-pre-wrap min-h-[200px]">
     {loading ? "Loading instructions..." : (content || "No instructions available.")}
    </div>

    <label className="flex items-center gap-2 mt-4 text-sm text-slate-600">
     <input
      type="checkbox"
      checked={checked}
      onChange={e=>setChecked(e.target.checked)}
     />
     I have read and understood the instructions.
    </label>

    <div className="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
     <button className="btn btn-ghost w-full md:w-auto" onClick={()=>navigate("/dashboard")}>Back</button>
     <button
      className={`btn w-full md:w-auto ${checked ? "btn-primary" : "btn-outline"}`}
      disabled={!checked}
      onClick={()=>navigate(`/topic/${topicId}`)}
     >
      Proceed
     </button>
    </div>
   </div>
  </div>
 );
}
