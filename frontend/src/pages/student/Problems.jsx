import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentHeader from "../../components/StudentHeader";
import { getStudentTopics } from "../../services/studentTopicApi";
import { getAllStudentProblems } from "../../services/studentProblemApi";

export default function Problems(){
 const navigate = useNavigate();
 const[topics,setTopics] = useState([]);
 const[problems,setProblems] = useState([]);
 const[topicFilter,setTopicFilter] = useState("all");
 const[difficultyFilter,setDifficultyFilter] = useState("all");
 const[loading,setLoading] = useState(true);
 const[error,setError] = useState("");
 const[showScrollTop,setShowScrollTop] = useState(false);

 useEffect(()=>{
  load();
 },[]);

 useEffect(()=>{
  const onScroll = ()=>{
   setShowScrollTop(window.scrollY > 200);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  return ()=>window.removeEventListener("scroll", onScroll);
 },[]);

 const load = async()=>{
  try{
   setLoading(true);
   setError("");
   const [t, p] = await Promise.all([getStudentTopics(), getAllStudentProblems()]);
   setTopics(t.data || []);
   setProblems(p.data || []);
  }catch{
   setError("Unable to load problems. Please refresh.");
  }finally{
   setLoading(false);
  }
 };

 const topicMap = useMemo(()=>{
  const map = {};
  topics.forEach(t=>{ map[t._id] = t.title; });
  return map;
 },[topics]);

 const filtered = useMemo(()=>{
  return problems.filter(p=>{
   const topicOk = topicFilter === "all" || p.topicId === topicFilter;
   const diff = (p.difficulty || "easy");
   const diffOk = difficultyFilter === "all" || diff === difficultyFilter;
   return topicOk && diffOk;
  });
 },[problems, topicFilter, difficultyFilter]);

 return(
  <div className="page-anim page-shell">
   <StudentHeader/>
   <div className="page-wrap">
    <div className="flex items-center justify-between flex-wrap gap-3">
     <div>
      <h1 className="text-3xl font-bold">Problems</h1>
      <p className="text-sm text-slate-500 mt-1">Filter by topic or difficulty and practice.</p>
     </div>
     <button className="btn btn-outline w-full md:w-auto" onClick={load} disabled={loading}>Refresh</button>
    </div>

    <div className="grid md:grid-cols-2 gap-3 mt-6">
     <select className="select" value={topicFilter} onChange={e=>setTopicFilter(e.target.value)}>
      <option value="all">All Topics</option>
      {topics.map(t=>(
       <option key={t._id} value={t._id}>{t.title}</option>
      ))}
     </select>
     <select className="select" value={difficultyFilter} onChange={e=>setDifficultyFilter(e.target.value)}>
      <option value="all">All Difficulties</option>
      <option value="easy">Easy</option>
      <option value="medium">Medium</option>
      <option value="hard">Hard</option>
     </select>
    </div>

    {error && (
     <div className="card-soft mt-6 p-4 text-sm text-red-600">{error}</div>
    )}

   <div className="mt-6 grid gap-3">
     {loading && (
      <div className="card p-6 text-sm text-slate-500">Loading problems...</div>
     )}
     {!loading && filtered.map((p, idx)=>(
      <button
       key={p._id}
       className="card p-4 text-left hover:shadow-lg transition"
       onClick={()=>navigate(`/learn/${p.topicId}`)}
      >
       <div className="flex items-center justify-between gap-3">
        <div>
         <div className="text-xs uppercase tracking-widest text-emerald-700">{topicMap[p.topicId] || "Topic"}</div>
         <div className="text-base font-semibold mt-1">{idx+1}. {p.title}</div>
        </div>
        <span className="badge">{p.difficulty || "easy"}</span>
       </div>
      </button>
     ))}
    {!loading && !filtered.length && !error && (
     <div className="card p-6 text-sm text-slate-500">No problems found.</div>
    )}
   </div>
  </div>
  {showScrollTop && (
   <button
    className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition"
    onClick={()=>window.scrollTo({ top: 0, behavior: "smooth" })}
    aria-label="Scroll to top"
    title="Scroll to top"
   >
    ^
   </button>
  )}
 </div>
 );
}
