import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getStudentTopics } from "../../services/studentTopicApi";
import { getProgressSummary } from "../../services/progressApi";
import StudentHeader from "../../components/StudentHeader";

export default function TopicDetail(){
  const { topicId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
 const[topic,setTopic] = useState(null);
 const[topics,setTopics] = useState([]);
 const[progressSummary,setProgressSummary] = useState({});
 const[loading,setLoading] = useState(true);
 const[error,setError] = useState("");
 const[activeOutlineId,setActiveOutlineId] = useState("");
 const hasText = (v) => {
  if (v === null || v === undefined) return false;
  const s = String(v).trim();
  return s !== "" && s !== "0";
 };

 const slugify = (text) => {
  return (text || "")
   .toString()
   .toLowerCase()
   .replace(/[^a-z0-9]+/g, "-")
   .replace(/(^-|-$)+/g, "");
 };

 const outlineItems = useMemo(() => {
  const items = [];
  if (hasText(topic?.concept)) items.push({ label: "Concept", id: "outline-concept" });
  if (hasText(topic?.explanation)) items.push({ label: "Explanation", id: "outline-explanation" });
  if (Array.isArray(topic?.blocks)) {
   topic.blocks.forEach((b) => {
    if (b?.type === "title" && hasText(b?.data?.text)) {
     items.push({ label: b.data.text, id: `outline-${slugify(b.data.text)}` });
    }
   });
  }
  if (topic?.exampleCode1 || topic?.exampleOutput1 || topic?.exampleCode2 || topic?.exampleOutput2) {
   items.push({ label: "Examples", id: "outline-examples" });
  }
  return items;
 }, [topic]);

 const renderBlock = (block, index) => {
  const key = block?.id || index;
  const type = block?.type;
  const data = block?.data || {};
  const titleId = type === "title" && data.text ? `outline-${slugify(data.text)}` : "";

  if(type === "title"){
   return (
    <h3 key={key} id={titleId} data-outline-id={titleId} className="text-xl font-bold scroll-mt-20">
     {data.text || ""}
    </h3>
   );
  }
  if(type === "paragraph"){
   return <p key={key} className="text-slate-700">{data.text || ""}</p>;
  }
  if(type === "important"){
   return (
    <div key={key} className="card-soft p-3 border-l-4 border-emerald-400 bg-emerald-50">
     <div className="text-xs uppercase tracking-widest text-emerald-700">Important</div>
     <div className="mt-2 text-sm text-emerald-900">{data.text || ""}</div>
    </div>
   );
  }
  if(type === "warning"){
   return (
    <div key={key} className="card-soft p-3 border-l-4 border-amber-400 bg-amber-50">
     <div className="text-xs uppercase tracking-widest text-amber-700">Warning</div>
     <div className="mt-2 text-sm text-amber-900">{data.text || ""}</div>
    </div>
   );
  }
  if(type === "tip"){
   return (
    <div key={key} className="card-soft p-3 border-l-4 border-sky-400 bg-sky-50">
     <div className="text-xs uppercase tracking-widest text-sky-700">Tip</div>
     <div className="mt-2 text-sm text-sky-900">{data.text || ""}</div>
    </div>
   );
  }
  if(type === "summary"){
   return (
    <div key={key} className="card-soft p-3 border border-slate-200 bg-slate-50">
     <div className="text-xs uppercase tracking-widest text-slate-600">Mini Summary</div>
     <div className="mt-2 text-sm text-slate-700">{data.text || ""}</div>
    </div>
   );
  }
  if(type === "think"){
   return (
    <div key={key} className="card-soft p-3 border-l-4 border-purple-300 bg-purple-50">
     <div className="text-xs uppercase tracking-widest text-purple-700">Think</div>
     <div className="mt-2 text-sm text-purple-900">{data.text || ""}</div>
    </div>
   );
  }
  if(type === "example"){
   return (
    <div key={key} className="card-soft p-3 border border-slate-200">
     <div className="text-xs uppercase tracking-widest text-slate-500">Example</div>
     <div className="mt-2 text-sm text-slate-700">{data.text || ""}</div>
    </div>
   );
  }
  if(type === "code"){
   return (
    <pre key={key} className="bg-slate-900 text-slate-100 p-3 rounded-lg text-sm overflow-auto">
     {data.code || ""}
    </pre>
   );
  }
  if(type === "output"){
   return (
    <pre key={key} className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm whitespace-pre-wrap">
     {data.output || ""}
    </pre>
   );
  }
  if(type === "bullets"){
   const items = Array.isArray(data.items) ? data.items.filter(Boolean) : [];
   return (
    <ul key={key} className="list-disc pl-5 text-slate-700">
     {items.map((item, i)=>(
      <li key={`${key}-b-${i}`}>{item}</li>
     ))}
    </ul>
   );
  }
  if(type === "image"){
   const title = data.title || data.caption || "";
   return (
    <figure key={key} className="card-soft p-3">
     {title && (
      <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">{title}</div>
     )}
     {data.url && (
      <img src={data.url} alt={title || "topic image"} className="w-full rounded-lg border border-slate-200" />
     )}
    </figure>
   );
  }
  return null;
 };

  useEffect(()=>{
    load();
  },[topicId]);

  useEffect(()=>{
    if (topicId) localStorage.setItem("lastTopicId", topicId);
    localStorage.setItem("lastStudentRoute", location.pathname + location.search);
  }, [topicId, location.pathname, location.search]);

 useEffect(() => {
  const elements = Array.from(document.querySelectorAll("[data-outline-id]"));
  if (!elements.length) return;

  const observer = new IntersectionObserver(
   (entries) => {
    const visible = entries
     .filter((e) => e.isIntersecting)
     .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    if (visible[0]) {
     setActiveOutlineId(visible[0].target.getAttribute("data-outline-id") || "");
    }
   },
   { rootMargin: "-20% 0px -60% 0px", threshold: [0.1, 0.25, 0.5] }
  );

  elements.forEach((el) => observer.observe(el));
  return () => observer.disconnect();
 }, [topic, loading]);

 const load = async()=>{
  try{
   setLoading(true);
   setError("");
   const [res, summary] = await Promise.all([
    getStudentTopics(),
    getProgressSummary()
   ]);
   const list = res.data || [];
   const t = list.find(x=>x._id===topicId);
   setTopic(t || null);
   setTopics(list);
   setProgressSummary(summary.data || {});
  }catch{
   setError("Unable to load topic.");
  }finally{
   setLoading(false);
  }
 };

 if(loading){
  return(
   <div className="page-anim page-shell">
    <StudentHeader/>
    <div className="page-wrap max-w-4xl">
     <div className="card p-6 text-sm text-slate-500">Loading topic...</div>
    </div>
   </div>
  );
 }

 if(!topic){
  return(
   <div className="page-anim page-shell">
    <StudentHeader/>
    <div className="page-wrap max-w-4xl">
     <div className="card p-6 text-sm text-slate-500">{error || "Topic not found."}</div>
     <button className="btn btn-outline mt-4" onClick={()=>navigate("/dashboard")}>Back</button>
    </div>
   </div>
  );
 }

 return(
  <div className="page-anim page-shell">
   <StudentHeader/>
   <div className="page-wrap max-w-5xl">
    <div className="flex items-center justify-between flex-wrap gap-3">
     <div>
      <h1 className="text-3xl font-bold">{topic.title}</h1>
      <p className="text-sm text-slate-500 mt-1">Review the concept before practice.</p>
     </div>
     <button className="btn btn-outline" onClick={load}>Refresh</button>
    </div>

    <div className="mt-6 grid md:grid-cols-[1fr_260px] gap-6 items-start">
     <div>
      <div className="card p-5">
       {(hasText(topic.concept) || hasText(topic.explanation)) && (
        <>
         <h2 className="text-lg font-semibold mb-2" id="outline-concept" data-outline-id="outline-concept">Concept</h2>
         {hasText(topic.concept) && (
          <p className="whitespace-pre-wrap text-slate-700">{topic.concept}</p>
         )}

         {hasText(topic.explanation) && (
          <>
           <h2 className="text-lg font-semibold mt-4 mb-2" id="outline-explanation" data-outline-id="outline-explanation">Explanation</h2>
           <pre className="whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-200">
            {topic.explanation}
           </pre>
          </>
         )}
        </>
       )}

       {Array.isArray(topic.blocks) && topic.blocks.length && (
        <div className="mt-6 pt-4 border-t border-slate-200">
         <div className="grid gap-4">
          {topic.blocks.map((block, index)=>renderBlock(block, index))}
         </div>
        </div>
       )}

       {(topic.exampleCode1 || topic.exampleOutput1 || topic.exampleCode2 || topic.exampleOutput2) && (
        <div className="mt-6">
         <h2 className="text-lg font-semibold mb-2" id="outline-examples" data-outline-id="outline-examples">Examples</h2>
         <div className="grid gap-4">
          {(topic.exampleCode1 || topic.exampleOutput1) && (
           <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-slate-500">Example 1</div>
            <div className="mt-2 grid gap-3">
             <div>
              <div className="text-xs uppercase tracking-widest text-slate-500">Code Editor</div>
              <textarea
               className="textarea mt-2 bg-slate-50"
               rows={4}
               readOnly
               value={topic.exampleCode1 || "No example code provided."}
              />
             </div>
             <div>
              <div className="text-xs uppercase tracking-widest text-slate-500">Output</div>
              <textarea
               className="textarea mt-2 bg-slate-50"
               rows={3}
               readOnly
               value={topic.exampleOutput1 || "No example output provided."}
              />
             </div>
            </div>
           </div>
          )}
          {(topic.exampleCode2 || topic.exampleOutput2) && (
           <div className="card-soft p-4">
            <div className="text-xs uppercase tracking-widest text-slate-500">Example 2</div>
            <div className="mt-2 grid gap-3">
             <div>
              <div className="text-xs uppercase tracking-widest text-slate-500">Code Editor</div>
              <textarea
               className="textarea mt-2 bg-slate-50"
               rows={4}
               readOnly
               value={topic.exampleCode2 || "No example code provided."}
              />
             </div>
             <div>
              <div className="text-xs uppercase tracking-widest text-slate-500">Output</div>
              <textarea
               className="textarea mt-2 bg-slate-50"
               rows={3}
               readOnly
               value={topic.exampleOutput2 || "No example output provided."}
              />
             </div>
            </div>
           </div>
          )}
         </div>
        </div>
       )}
      </div>
     </div>

     <aside className="card-soft p-4 sticky top-20 hidden md:block">
      <div className="text-xs uppercase tracking-widest text-slate-500">Working</div>
      <details open className="mt-2">
       <summary className="text-sm font-semibold cursor-pointer">Topic Outline</summary>
       <ul className="mt-2 text-sm text-slate-700 space-y-1 max-h-40 overflow-y-auto no-scrollbar scroll-smooth">
        {outlineItems.length ? outlineItems.map((item) => (
         <li key={item.id}>
          <button
           className={`btn btn-ghost text-left w-full ${activeOutlineId === item.id ? "font-semibold text-emerald-700" : ""}`}
           onClick={() => {
            const el = document.getElementById(item.id);
            if (el) {
             const offset = 88;
             const top = el.getBoundingClientRect().top + window.scrollY - offset;
             window.scrollTo({ top, behavior: "smooth" });
            }
           }}
          >
           • {item.label}
          </button>
         </li>
        )) : (
         <>
          <li>
           <button
            className={`btn btn-ghost text-left w-full ${activeOutlineId === "outline-concept" ? "font-semibold text-emerald-700" : ""}`}
            onClick={() => {
             const el = document.getElementById("outline-concept");
             if (el) {
              const offset = 88;
              const top = el.getBoundingClientRect().top + window.scrollY - offset;
              window.scrollTo({ top, behavior: "smooth" });
             }
            }}
           >
            • Concept
           </button>
          </li>
          <li>
           <button
            className={`btn btn-ghost text-left w-full ${activeOutlineId === "outline-explanation" ? "font-semibold text-emerald-700" : ""}`}
            onClick={() => {
             const el = document.getElementById("outline-explanation");
             if (el) {
              const offset = 88;
              const top = el.getBoundingClientRect().top + window.scrollY - offset;
              window.scrollTo({ top, behavior: "smooth" });
             }
            }}
           >
            • Explanation
           </button>
          </li>
          <li>
           <button
            className={`btn btn-ghost text-left w-full ${activeOutlineId === "outline-examples" ? "font-semibold text-emerald-700" : ""}`}
            onClick={() => {
             const el = document.getElementById("outline-examples");
             if (el) {
              const offset = 88;
              const top = el.getBoundingClientRect().top + window.scrollY - offset;
              window.scrollTo({ top, behavior: "smooth" });
             }
            }}
           >
            • Examples
           </button>
          </li>
         </>
        )}
       </ul>
      </details>
      <div className="border-t border-slate-200 my-3" />
     <details open>
      <summary className="text-sm font-semibold cursor-pointer">Progress</summary>
        {(() => {
         const stat = progressSummary?.[topic?._id] || { total: 0, solved: 0 };
         const percent = stat.total ? Math.round((stat.solved / stat.total) * 100) : 0;
         return (
          <div className="mt-2 text-sm text-slate-700 flex items-center gap-3">
           <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-[10px] bg-white"
            style={{ background: `conic-gradient(#0f766e ${percent}%, #e5e7eb 0)` }}
            title={`${percent}% complete`}
           >
            <div className="bg-white w-7 h-7 rounded-full flex items-center justify-center">
             <span>{percent}%</span>
            </div>
           </div>
           <div>
            <div>Topic: {percent}%</div>
            <div>Problems: {stat.solved} / {stat.total}</div>
           </div>
          </div>
         );
        })()}
     </details>
      <div className="border-t border-slate-200 my-3" />
      <details open>
       <summary className="text-sm font-semibold cursor-pointer">Quick Tips</summary>
       <ul className="mt-2 text-sm text-slate-700 space-y-1 max-h-40 overflow-y-auto no-scrollbar scroll-smooth">
        {(topic?.quickTips || []).map((tip, i)=>(
         <li key={`tip-${i}`}>✔ {tip}</li>
        ))}
       </ul>
      </details>
      <div className="border-t border-slate-200 my-3" />
      <details open>
       <summary className="text-sm font-semibold cursor-pointer">Common Mistakes</summary>
       <ul className="mt-2 text-sm text-slate-700 space-y-1">
        {(topic?.commonMistakes || []).map((mistake, i)=>(
         <li key={`mistake-${i}`}>❌ {mistake}</li>
        ))}
       </ul>
      </details>
     </aside>
    </div>

    <div className="mt-4 md:hidden">
     <details className="card-soft p-4">
      <summary className="text-sm font-semibold cursor-pointer">Working</summary>
      <div className="mt-3">
       <details open>
        <summary className="text-sm font-semibold cursor-pointer">Topic Outline</summary>
        <ul className="mt-2 text-sm text-slate-700 space-y-1 max-h-40 overflow-y-auto no-scrollbar scroll-smooth">
         {outlineItems.length ? outlineItems.map((item) => (
          <li key={`m-${item.id}`}>
           <button
            className={`btn btn-ghost text-left w-full ${activeOutlineId === item.id ? "font-semibold text-emerald-700" : ""}`}
            onClick={() => {
             const el = document.getElementById(item.id);
            if (el) {
             const offset = 88;
             const top = el.getBoundingClientRect().top + window.scrollY - offset;
             window.scrollTo({ top, behavior: "smooth" });
            }
            }}
           >
            • {item.label}
           </button>
          </li>
         )) : (
          <>
           <li>
            <button
             className={`btn btn-ghost text-left w-full ${activeOutlineId === "outline-concept" ? "font-semibold text-emerald-700" : ""}`}
             onClick={() => {
              const el = document.getElementById("outline-concept");
              if (el) {
               const offset = 88;
               const top = el.getBoundingClientRect().top + window.scrollY - offset;
               window.scrollTo({ top, behavior: "smooth" });
              }
             }}
            >
             • Concept
            </button>
           </li>
           <li>
            <button
             className={`btn btn-ghost text-left w-full ${activeOutlineId === "outline-explanation" ? "font-semibold text-emerald-700" : ""}`}
             onClick={() => {
              const el = document.getElementById("outline-explanation");
              if (el) {
               const offset = 88;
               const top = el.getBoundingClientRect().top + window.scrollY - offset;
               window.scrollTo({ top, behavior: "smooth" });
              }
             }}
            >
             • Explanation
            </button>
           </li>
           <li>
            <button
             className={`btn btn-ghost text-left w-full ${activeOutlineId === "outline-examples" ? "font-semibold text-emerald-700" : ""}`}
             onClick={() => {
              const el = document.getElementById("outline-examples");
              if (el) {
               const offset = 88;
               const top = el.getBoundingClientRect().top + window.scrollY - offset;
               window.scrollTo({ top, behavior: "smooth" });
              }
             }}
            >
             • Examples
            </button>
           </li>
          </>
         )}
        </ul>
       </details>
       <div className="border-t border-slate-200 my-3" />
       <details open>
        <summary className="text-sm font-semibold cursor-pointer">Progress</summary>
        {(() => {
         const stat = progressSummary?.[topic?._id] || { total: 0, solved: 0 };
         const percent = stat.total ? Math.round((stat.solved / stat.total) * 100) : 0;
         return (
          <div className="mt-2 text-sm text-slate-700 flex items-center gap-3">
           <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-[10px] bg-white"
            style={{ background: `conic-gradient(#0f766e ${percent}%, #e5e7eb 0)` }}
            title={`${percent}% complete`}
           >
            <div className="bg-white w-7 h-7 rounded-full flex items-center justify-center">
             <span>{percent}%</span>
            </div>
           </div>
           <div>
            <div>Topic: {percent}%</div>
            <div>Problems: {stat.solved} / {stat.total}</div>
           </div>
          </div>
         );
        })()}
       </details>
       <div className="border-t border-slate-200 my-3" />
       <details open>
        <summary className="text-sm font-semibold cursor-pointer">Quick Tips</summary>
        <ul className="mt-2 text-sm text-slate-700 space-y-1">
         {(topic?.quickTips || []).map((tip, i)=>(
          <li key={`m-tip-${i}`}>✔ {tip}</li>
         ))}
        </ul>
       </details>
       <div className="border-t border-slate-200 my-3" />
       <details open>
        <summary className="text-sm font-semibold cursor-pointer">Common Mistakes</summary>
        <ul className="mt-2 text-sm text-slate-700 space-y-1">
         {(topic?.commonMistakes || []).map((mistake, i)=>(
          <li key={`m-mistake-${i}`}>❌ {mistake}</li>
         ))}
        </ul>
       </details>
      </div>
     </details>
    </div>

    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mt-6">
     <button className="btn btn-ghost" onClick={()=>navigate("/dashboard")}>Back</button>
     <button
      className="btn btn-primary"
      onClick={()=>navigate(`/learn/${topicId}`)}
     >
      Start Practice
     </button>
    </div>
   </div>
  </div>
 );
}
