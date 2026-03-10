import { useEffect,useState } from "react";
import { getStudentTopics } from "../../services/studentTopicApi";
import { getProgress, getProgressSummary } from "../../services/progressApi";
import { useNavigate } from "react-router-dom";
import StudentHeader from "../../components/StudentHeader";

export default function Dashboard(){

 const[topics,setTopics]=useState([]);
 const[progress,setProgress]=useState([]);
 const[topicStats,setTopicStats]=useState({});
 const[loading,setLoading]=useState(true);
 const[error,setError]=useState("");
 const[showCongrats,setShowCongrats]=useState(false);
 const[query,setQuery]=useState("");
 const[showScrollTop,setShowScrollTop]=useState(false);
 const[showSuggestions,setShowSuggestions]=useState(false);
 const navigate = useNavigate();

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
   const [t, p, summary] = await Promise.all([
    getStudentTopics(),
    getProgress(),
    getProgressSummary()
   ]);
   setTopics(t.data || []);
   setProgress(p.data || []);
   setTopicStats(summary.data || {});
  }catch{
   setError("Unable to load dashboard. Please refresh.");
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  if (!topics.length) return;
  const allSolved = topics.every(t=>isSolved(t._id));
  if (allSolved && !localStorage.getItem("congrats_topics_shown")) {
   setShowCongrats(true);
   localStorage.setItem("congrats_topics_shown", "1");
  }
 }, [topics, progress]);

 const continueLearning = ()=>{
  const lastRoute = localStorage.getItem("lastStudentRoute") || "";
  if (lastRoute && !lastRoute.startsWith("/dashboard") && !lastRoute.startsWith("/login")) {
   navigate(lastRoute);
   return;
  }
  const firstUnlocked = topics.find((t, i)=> i === 0 || isSolved(topics[i-1]._id));
  if (firstUnlocked?._id) {
   navigate(`/instructions/${firstUnlocked._id}`);
  }
 };

 const isSolved = (id)=>{
  return progress.find(x=>x.topicId===id && x.solved && !x.problemId);
 };

 const getTopicPreview = (t) => {
  const blocks = Array.isArray(t.blocks) ? t.blocks : [];
  const pick = blocks.find(b => ["paragraph","important","summary","tip","warning","think","example","title"].includes(b.type));
  if (pick?.type === "bullets") {
   const items = Array.isArray(pick.data?.items) ? pick.data.items.filter(Boolean) : [];
   return items.slice(0, 2).join(" • ");
  }
  if (pick?.data?.text) return pick.data.text;
  return t.concept || "";
 };

 const filtered = query.trim()
  ? topics.filter(t => (t.title || "").toLowerCase().includes(query.trim().toLowerCase()))
  : topics;

 const suggestions = query.trim()
  ? topics.filter(t => (t.title || "").toLowerCase().includes(query.trim().toLowerCase())).slice(0,5)
  : [];

 return(
  <div className="page-anim page-shell">
   <StudentHeader/>
   <div className="page-wrap max-w-3xl">
    <div className="flex items-center justify-between flex-wrap gap-3">
     <div>
      <h1 className="text-3xl font-bold">Your Topics</h1>
      <p className="text-sm text-slate-500 mt-1">Follow the sequence to unlock the next topic.</p>
     </div>
     <button className="btn btn-primary" onClick={continueLearning} disabled={loading}>Continue</button>
    </div>

    <div className="mt-4 relative max-w-sm">
     <input
      className="input pr-10"
      placeholder="Search topic..."
      value={query}
      onChange={(e)=>{ setQuery(e.target.value); setShowSuggestions(true); }}
      onFocus={()=>setShowSuggestions(true)}
      onBlur={()=>setTimeout(()=>setShowSuggestions(false), 150)}
     />
     {query && (
      <button
       className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
       onClick={()=>{ setQuery(""); setShowSuggestions(false); }}
       aria-label="Clear search"
      >
       x
      </button>
     )}
     {showSuggestions && suggestions.length > 0 && (
      <div className="absolute z-20 mt-2 w-full card-soft p-2 shadow-lg">
       {suggestions.map((t)=>(
        <button
         key={t._id}
         className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-sm"
         onClick={()=>{ setQuery(t.title || ""); setShowSuggestions(false); }}
        >
         {t.title}
        </button>
       ))}
      </div>
     )}
    </div>

    {error && (
     <div className="card-soft mt-6 p-4 text-sm text-red-600">{error}</div>
    )}

    <style>{`
     .topic-row { align-items: center; }
     .topic-title { max-width: 260px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
     .topic-title-text { display: inline-block; padding-right: 24px; }
     .topic-card:hover .topic-title-text { animation: marquee 8s linear 3s infinite; }
     @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
     .progress-ring { width: 44px; height: 44px; border-radius: 9999px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0; }
    `}</style>

    <div className="mt-3 grid gap-4 max-w-4xl w-full">
     {loading && (
      <div className="card p-6 text-sm text-slate-500">Loading topics...</div>
     )}
     {!loading && filtered.map((t,i)=>{

      const idx = topics.findIndex(x=>x._id===t._id);
      const unlocked = idx===0 || isSolved(topics[idx-1]?._id);
      const isTopicSolved = isSolved(t._id);

      const stat = topicStats[t._id] || { total: 0, solved: 0 };
      const percent = stat.total ? Math.round((stat.solved / stat.total) * 100) : 0;
      return(
        <div key={t._id} className={`card p-5 topic-card ${unlocked && !isTopicSolved ? "topic-unlock" : ""}`}>

         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 topic-row">
          <div className="flex items-center gap-3 min-w-0">
           <div className="topic-title font-bold min-w-0">
            <span className="topic-title-text">{t.title}</span>
           </div>
          </div>
          <div className="text-xs text-slate-500 mt-1 md:hidden">
           {getTopicPreview(t) || "No concept added yet."}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto md:justify-end">
           <div
            className="progress-ring"
            style={{ background: `conic-gradient(#0f766e ${percent}%, #e5e7eb 0)` }}
            title={`${percent}% complete`}
           >
            <div className="bg-white w-9 h-9 rounded-full flex items-center justify-center">
             <span>{percent}%</span>
            </div>
           </div>
           {unlocked ? (
            <button
             onClick={()=>navigate(`/instructions/${t._id}`)}
             className="btn btn-primary text-sm flex-1 sm:flex-none md:w-auto"
            >
             {isTopicSolved ? "Review" : "Start"}
            </button>
           ):(
            <button disabled className="btn btn-outline text-sm flex-1 sm:flex-none md:w-auto">
             Locked
            </button>
           )}
          </div>
         </div>
         <div className="text-xs text-slate-500 mt-2 hidden md:block">
          {getTopicPreview(t) || "No concept added yet."}
         </div>

       </div>
      )
     })}
     {!loading && !filtered.length && !error && (
      <div className="card p-6 text-sm text-slate-500">No topics available yet.</div>
     )}

   </div>
   {showCongrats && (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
     <div className="card p-6 text-center w-80">
      <div className="text-4xl mb-2">🏆</div>
      <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
      <p className="text-sm text-slate-600 mb-4">You completed all topics.</p>
      <button className="btn btn-primary w-full" onClick={()=>setShowCongrats(false)}>Close</button>
     </div>
    </div>
   )}
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
 </div>
 );
}
