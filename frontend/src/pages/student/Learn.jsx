import { useParams,useNavigate, useLocation } from "react-router-dom";
import { useEffect,useState } from "react";
import { getStudentTopics } from "../../services/studentTopicApi";
import { getProgress, markProblemSolved } from "../../services/progressApi";
import { getStudentProblems } from "../../services/studentProblemApi";
import { runPython, submitSolution } from "../../services/pythonApi";
import StudentHeader from "../../components/StudentHeader";

export default function Learn(){

 const {topicId} = useParams();
 const navigate = useNavigate();
 const location = useLocation();

 const[topic,setTopic]=useState(null);
 const[topics,setTopics]=useState([]);
 const[problems,setProblems]=useState([]);
 const[selectedProblem,setSelectedProblem]=useState(null);
 const[progress,setProgress]=useState([]);
 const[viewMode,setViewMode]=useState("concept"); // concept | list | detail
 const[code,setCode]=useState("");
 const[language,setLanguage]=useState("python");
 const[output,setOutput]=useState("");
 const[lastRunStatus,setLastRunStatus]=useState("idle"); // idle | ok | error
 const[lastRunError,setLastRunError]=useState("");
 const[submitStatus,setSubmitStatus]=useState("idle"); // idle | correct | wrong | error
 const[submitMessage,setSubmitMessage]=useState("");
 const[submitActual,setSubmitActual]=useState("");
 const[submitExpected,setSubmitExpected]=useState("");
 const[mismatchCounts,setMismatchCounts]=useState({});
 const[hintUnlocked,setHintUnlocked]=useState({});
 const[solutionUnlocked,setSolutionUnlocked]=useState({});
 const[hintByProblem,setHintByProblem]=useState({});
 const[activeOverlay,setActiveOverlay]=useState(null); // null | "hint" | "solution"
 const[showSolutionInPanel,setShowSolutionInPanel]=useState(false);
 const[showCongrats,setShowCongrats]=useState(false);
 const[strip,setStrip]=useState({ show:false, type:"info", message:"", showNext:false, nextType:null, hint:"", ai:false });
 const[loading,setLoading]=useState(true);
 const[error,setError]=useState("");

 useEffect(()=>{
  load();
 },[topicId]);

 useEffect(()=>{
  if (topicId) localStorage.setItem("lastTopicId", topicId);
  localStorage.setItem("lastStudentRoute", location.pathname + location.search);
 }, [topicId, location.pathname, location.search]);

 const load = async()=>{
  try{
   setLoading(true);
   setError("");
   const res = await getStudentTopics();
   setTopics(res.data || []);
   const t = res.data.find(x=>x._id===topicId);
   setTopic(t || null);

   const p = await getStudentProblems(topicId);
   setProblems(p.data || []);

   const pr = await getProgress();
   setProgress(pr.data || []);
  }catch{
   setError("Unable to load learning content.");
  }finally{
   setLoading(false);
  }
 };

 const run = async()=>{
  setStrip({ show:false, type:"info", message:"", showNext:false, nextType:null, hint:"", ai:false });
  setSubmitStatus("idle");
  setSubmitMessage("");
  setSubmitActual("");
  setSubmitExpected("");
  const res = await runPython(code, language, "", selectedProblem?._id);
  if(res.data.status){
   if(res.data.status === "correct"){
    setLastRunStatus("ok");
    setLastRunError("");
    setSubmitStatus("correct");
    setSubmitMessage("");
    setSubmitActual("");
    setSubmitExpected("");
    setOutput("");
    return;
   }
   if(res.data.status === "wrong"){
    setLastRunStatus("ok");
    setLastRunError("");
    setSubmitStatus("wrong");
    setSubmitMessage(res.data.hint || "Wrong answer. Check logic and edge cases.");
    setSubmitActual(res.data.actual || "");
    setSubmitExpected(res.data.expected || "");
    setOutput("");
    return;
   }
   if(res.data.status === "error"){
    setLastRunStatus("error");
    setLastRunError(res.data.message || "");
    setSubmitStatus("error");
    setSubmitMessage(res.data.hint || "Runtime error. Review details.");
    setSubmitActual("");
    setSubmitExpected("");
    setOutput(`Details:\n${res.data.message || "Runtime error"}`);
    return;
   }
  }
  if(res.data.error){
   setLastRunStatus("error");
   setLastRunError(res.data.error);
   setOutput(`Details:\n${res.data.error}`);
   setStrip({
    show:true,
    type:"error",
    message: res.data.hint || "Runtime error. Review the details below.",
    showNext:false,
    nextType:null,
    hint: res.data.hint || "",
    ai: !!res.data.aiHintUsed
   });
   return;
  }
  setLastRunStatus("ok");
  setLastRunError("");
  setOutput(res.data.output || "");
 };


 const submit = async()=>{
  if(!selectedProblem) return alert("Select a problem");
  setSubmitStatus("idle");
  setSubmitMessage("");
  setSubmitActual("");
  setSubmitExpected("");
  if(lastRunStatus !== "ok"){
   setStrip({
    show:true,
    type:"error",
    message:"Please run code without errors before submitting.",
    showNext:false,
    nextType:null,
    hint:"",
    ai:false
   });
   return;
  }
  const res = await submitSolution(selectedProblem._id, code, language);

  if(res.data.status === "error"){
   setSubmitStatus("error");
   setSubmitMessage(res.data.hint || "Runtime error. Review details.");
   setSubmitActual("");
   setSubmitExpected("");
   setOutput(`Details:\n${res.data.message || "Runtime error"}`);
   setStrip({
    show:true,
    type:"error",
    message: res.data.hint || "Runtime error. Review the details below.",
    showNext:false,
    nextType:null,
    hint:"",
    ai: !!res.data.aiHintUsed
   });
   return;
  }

  if(res.data.status === "wrong"){
   setSubmitStatus("wrong");
   setSubmitMessage(res.data.hint || "Wrong answer. Check logic and edge cases.");
   setSubmitActual(res.data.actual || "");
   setSubmitExpected(res.data.expected || "");
   const pid = selectedProblem._id;
   const nextCount = (mismatchCounts[pid] || 0) + 1;
   setMismatchCounts({...mismatchCounts, [pid]: nextCount});
   const unlockHint = nextCount >= 3;
   const unlockSolution = nextCount >= 4;
   if(unlockHint) setHintUnlocked(prev=>({ ...prev, [pid]: true }));
   if(unlockSolution) setSolutionUnlocked(prev=>({ ...prev, [pid]: true }));
   setHintByProblem(prev=>({ ...prev, [pid]: res.data.hint || "Logic seems wrong." }));
   setStrip({
    show:true,
    type:"wrong",
    message:"Output mismatch",
    showNext:false,
    nextType:null,
    hint:"",
    ai: !!res.data.aiHintUsed
   });
   return;
  }

 if(res.data.status === "correct"){
   setSubmitStatus("correct");
   setSubmitMessage("");
   setSubmitActual("");
   setSubmitExpected("");
   const prog = await markProblemSolved(topicId, selectedProblem._id);
   setMismatchCounts({...mismatchCounts, [selectedProblem._id]: 0});
   const pr = await getProgress();
   setProgress(pr.data || []);

   if(prog.data.topicSolved){
    setShowCongrats(false);
    setStrip({
     show:true,
     type:"success",
     message:"All problems solved. Next topic unlocked.",
     showNext:true,
     nextType:"topic",
     hint:"",
     ai:false
    });
   }else{
    setStrip({
     show:true,
     type:"success",
     message:"Correct! You can move to the next problem.",
     showNext:true,
     nextType:"problem",
     hint:"",
     ai:false
    });
   }
  }
 };

 const isProblemSolved = (id)=>{
  return progress.find(x=>x.problemId===id && x.solved);
 };

 const canOpenProblem = (index)=>{
  if(index===0) return true;
  return isProblemSolved(problems[index-1]?._id);
 };

  const openProblem = (p)=>{
  setSelectedProblem(p);
  setViewMode("detail");
  setLastRunStatus("idle");
  setLastRunError("");
  setOutput("");
  setCode("");
  setLanguage("python");
  setActiveOverlay(null);
  setShowSolutionInPanel(false);
  setStrip({ show:false, type:"info", message:"", showNext:false, nextType:null, hint:"", ai:false });
  setSubmitStatus("idle");
  setSubmitMessage("");
  setSubmitActual("");
  setSubmitExpected("");
 };

 const getNextProblem = ()=>{
  if(!selectedProblem) return null;
  const idx = problems.findIndex(x=>x._id===selectedProblem._id);
  return problems[idx+1] || null;
 };

 const nextTopicId = ()=>{
  const idx = topics.findIndex(x=>x._id===topicId);
  if(idx===-1) return null;
  return topics[idx+1]?._id || null;
 };

 if(loading){
  return(
   <div className="page-anim page-shell">
    <StudentHeader/>
    <div className="page-wrap">
     <div className="card p-6 text-sm text-slate-500">Loading content...</div>
    </div>
   </div>
  );
 }

 if(!topic){
  return(
   <div className="page-anim page-shell">
    <StudentHeader/>
    <div className="page-wrap">
     <div className="card p-6 text-sm text-slate-500">{error || "Topic not found."}</div>
     <button className="btn btn-outline mt-4" onClick={()=>navigate("/dashboard")}>Back</button>
    </div>
   </div>
  );
 }

 const isOverlayOpen = activeOverlay !== null;
 const canShowHint = selectedProblem && hintUnlocked[selectedProblem._id];
 const canShowSolution = selectedProblem && solutionUnlocked[selectedProblem._id];
 const exampleProblem = selectedProblem || problems[0] || null;
 const topicExample1 = {
  code: topic?.exampleCode1 || "",
  output: topic?.exampleOutput1 || ""
 };
 const topicExample2 = {
  code: topic?.exampleCode2 || "",
  output: topic?.exampleOutput2 || ""
 };
 const hasText = (v) => {
  if (v === null || v === undefined) return false;
  const s = String(v).trim();
  return s !== "" && s !== "0";
 };

 const renderBlock = (block, index) => {
  const key = block?.id || index;
  const type = block?.type;
  const data = block?.data || {};

  if(type === "title"){
   return <h3 key={key} className="text-xl font-bold">{data.text || ""}</h3>;
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

  const stripPadding = strip.show ? "pb-16" : "pb-0";

  return(
  <div className={`min-h-screen lg:h-screen page-anim page-shell ${stripPadding}`}>
   <StudentHeader/>
   <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-64px)]">

      {/* LEFT */}
   <div className="w-full lg:w-1/2 p-3 sm:p-4 lg:p-6 lg:border-r border-slate-200 flex flex-col panel-left overflow-visible lg:overflow-hidden">
     <div className="flex flex-col lg:flex-row h-full gap-4">
     <div className="w-full lg:w-14 shrink-0">
      {viewMode === "detail" && selectedProblem && (
       <div className="h-auto lg:h-full flex flex-row lg:flex-col items-center justify-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-2">
        <div className="text-[10px] uppercase tracking-widest text-slate-500">
         Help
        </div>
        <div className="flex-1 w-full flex flex-row lg:flex-col items-center justify-center gap-3">
        <button
         disabled={!canShowHint}
         className={`btn btn-xs w-full ${canShowHint ? "btn-outline" : "btn-ghost"}`}
         onClick={()=>{
          if(!canShowHint) return;
          setActiveOverlay(activeOverlay === "hint" ? null : "hint");
          setShowSolutionInPanel(false);
         }}
        >
         <span className="lg:[writing-mode:vertical-rl] lg:rotate-180">Hint</span>
        </button>
        <button
         disabled={!canShowSolution}
         className={`btn btn-xs w-full ${canShowSolution ? "btn-outline" : "btn-ghost"}`}
         onClick={()=>{
          if(!canShowSolution) return;
          setActiveOverlay(null);
          setShowSolutionInPanel(true);
         }}
        >
         <span className="lg:[writing-mode:vertical-rl] lg:rotate-180">Solution</span>
        </button>
        </div>
       </div>
      )}
     </div>

     <div className="relative flex-1 h-full">
     <div className={`${isOverlayOpen ? "blur-sm" : ""} h-full lg:overflow-y-auto pr-2 no-scrollbar`}>
      <div className="flex justify-between items-start">
       <h2 className="text-2xl font-bold mb-3">{topic.title}</h2>
       {viewMode !== "list" ? (
        <button className="btn btn-ghost text-sm" onClick={()=>setViewMode("list")}>
         Problems
        </button>
       ):(
        <button className="btn btn-ghost text-sm" onClick={()=>setViewMode("concept")}>
         Concept
        </button>
       )}
      </div>

      {viewMode === "concept" && (
       <div className="card p-4">
        {(hasText(topic.concept) || hasText(topic.explanation)) && (
         <>
          <h3 className="text-lg font-semibold">Concept</h3>
          {hasText(topic.concept) && (
           <p className="mt-2 text-slate-700">{topic.concept}</p>
          )}
          {hasText(topic.explanation) && (
           <pre className="whitespace-pre-wrap bg-slate-50 p-3 border border-slate-200 rounded-lg mt-3">
            {topic.explanation}
           </pre>
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

        {(topicExample1.code || topicExample1.output || topicExample2.code || topicExample2.output) && (
         <>
          <h4 className="mt-6 font-bold">Example</h4>
          <div className="mt-2 grid gap-4">
           {(topicExample1.code || topicExample1.output) && (
            <div className="card-soft p-4">
             <div className="text-xs uppercase tracking-widest text-slate-500">Example 1</div>
             <div className="mt-2 grid gap-3">
              <div>
               <div className="text-xs uppercase tracking-widest text-slate-500">Code Editor</div>
               <textarea
                className="textarea mt-2 bg-slate-50"
                rows={4}
                readOnly
                value={topicExample1.code || "No example code provided."}
               />
              </div>
              <div>
               <div className="text-xs uppercase tracking-widest text-slate-500">Output</div>
               <textarea
                className="textarea mt-2 bg-slate-50"
                rows={3}
                readOnly
                value={topicExample1.output || "No example output provided."}
               />
              </div>
             </div>
            </div>
           )}
           {(topicExample2.code || topicExample2.output) && (
            <div className="card-soft p-4">
             <div className="text-xs uppercase tracking-widest text-slate-500">Example 2</div>
             <div className="mt-2 grid gap-3">
              <div>
               <div className="text-xs uppercase tracking-widest text-slate-500">Code Editor</div>
               <textarea
                className="textarea mt-2 bg-slate-50"
                rows={4}
                readOnly
                value={topicExample2.code || "No example code provided."}
               />
              </div>
              <div>
               <div className="text-xs uppercase tracking-widest text-slate-500">Output</div>
               <textarea
                className="textarea mt-2 bg-slate-50"
                rows={3}
                readOnly
                value={topicExample2.output || "No example output provided."}
               />
              </div>
             </div>
            </div>
           )}
          </div>
         </>
        )}
       </div>
      )}

      {viewMode === "list" && (
       <div className="grid gap-2">
        {problems.map((p,i)=>{
         const isUnlocked = canOpenProblem(i);
         const solved = isProblemSolved(p._id);
         return (
          <button
           key={p._id}
           disabled={!isUnlocked}
           onClick={()=>openProblem(p)}
           className={`card p-3 text-left ${selectedProblem?._id===p._id ? "ring-2 ring-emerald-200" : ""} ${!isUnlocked ? "opacity-60" : ""}`}
          >
           <div className="flex items-center justify-between">
            <span>{i+1}. {p.title} {solved ? "(Solved)" : ""}</span>
            <span className="text-xs text-slate-500">{isUnlocked ? "Unlocked" : "Locked"}</span>
           </div>
          </button>
         );
        })}
        {!problems.length && (
         <div className="card p-4 text-sm text-slate-500">No problems found.</div>
        )}
       </div>
      )}

      {viewMode === "detail" && selectedProblem && (
       <div className="card p-4">
        <div className="flex justify-between items-start">
         <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold">{selectedProblem.title}</h3>
          <span className="badge">{selectedProblem.difficulty || "easy"}</span>
         </div>
         <button className="btn btn-ghost text-sm" onClick={()=>setViewMode("list")}>Back</button>
        </div>

        {showSolutionInPanel && canShowSolution ? (
         <div className="mt-2">
          <div className="flex items-center justify-between">
           <h4 className="font-bold">Solution</h4>
           <button
            className="btn btn-ghost text-sm"
            onClick={()=>{
             setShowSolutionInPanel(false);
            }}
           >
            Back to Problem
           </button>
          </div>
          <pre className="border border-slate-200 p-3 mt-2 whitespace-pre-wrap rounded-lg bg-slate-50">
           {selectedProblem.solution || "No solution provided."}
          </pre>
         </div>
        ):(
         <>
          <p className="mt-2 text-slate-700">{selectedProblem.statement}</p>

          <h4 className="mt-4 font-bold">Expected Output</h4>
          <textarea
           className="textarea mt-2 bg-slate-50"
           rows={3}
           readOnly
           value={selectedProblem.expectedOutput || ""}
          />

          {selectedProblem.rulesConstraints && (
           <>
            <h4 className="mt-4 font-bold">Rules and Constraints</h4>
            <p className="mt-2 text-slate-700">{selectedProblem.rulesConstraints}</p>
           </>
          )}
         </>
        )}
       </div>
      )}
     </div>

     <div
      className={`absolute top-0 left-0 right-0 h-1/2 bg-white border-b border-slate-200 shadow transition-transform duration-300 ${isOverlayOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none border-b-0 shadow-none"}`}
      onClick={()=>{
       if(activeOverlay === "hint") setActiveOverlay(null);
      }}
     >
      <div className="p-4 h-full overflow-auto" onClick={(e)=>e.stopPropagation()}>
       {activeOverlay === "hint" && (
        <>
         <h4 className="font-bold">Hint</h4>
         <p className="mt-2 text-sm text-slate-700">{selectedProblem ? (hintByProblem[selectedProblem._id] || "Try checking your logic and edge cases.") : ""}</p>
        </>
       )}
       {activeOverlay === "solution" && null}
     </div>
     </div>
    </div>
    </div>

    {viewMode === "detail" && selectedProblem && null}
   </div>

   {/* RIGHT */}
   <div className="w-full lg:w-1/2 p-3 sm:p-4 lg:p-6 panel-right lg:overflow-y-auto lg:no-scrollbar">
    <div className="mb-3 flex items-center gap-3">
     <label className="text-sm text-slate-600">Language</label>
     <select
      className="select w-full sm:w-40"
      value={language}
      onChange={e=>setLanguage(e.target.value)}
     >
      <option value="python">Python</option>
     </select>
    </div>

    <textarea
     className="textarea w-full h-52 sm:h-60"
     placeholder="Write Python code..."
     value={code}
     onChange={e=>setCode(e.target.value)}
    />

    <div className="mt-4 flex flex-wrap gap-2">
     <button onClick={run} className="btn btn-outline">
      Run
     </button>

     <button onClick={submit} className="btn btn-primary">
      Submit
     </button>
    </div>

    {submitStatus !== "idle" ? (
     <div
      className={`card-soft mt-4 p-3 min-h-[120px] flex items-center ${
       submitStatus === "correct" ? "bg-emerald-50 border border-emerald-200 text-emerald-700 accepted-anim" :
       "bg-red-50 border border-red-200 text-red-700"
      }`}
     >
      <div className={`w-full ${submitStatus === "correct" ? "text-center" : ""}`}>
       <div className={`${submitStatus === "correct" ? "text-lg md:text-xl font-bold" : "text-sm font-semibold"}`}>
        {submitStatus === "correct" ? "Accepted" : "Wrong Answer"}
       </div>
       {submitMessage && (
        <div className="text-xs mt-1">{submitMessage}</div>
       )}
       {submitStatus === "wrong" && (submitActual || submitExpected) && (
        <div className="mt-3">
         {submitActual !== "" && (
          <div className="mb-2">
           <div className="text-[11px] uppercase tracking-widest text-red-600/80">Your Output</div>
           <pre className="mt-1 bg-white/60 border border-red-200 rounded-md p-2 text-[12px] whitespace-pre-wrap">
            {submitActual}
           </pre>
          </div>
         )}
         {submitExpected !== "" && (
          <div>
           <div className="text-[11px] uppercase tracking-widest text-emerald-700/80">Expected</div>
           <pre className="mt-1 bg-white/60 border border-emerald-200 rounded-md p-2 text-[12px] whitespace-pre-wrap">
            {submitExpected}
           </pre>
          </div>
         )}
        </div>
       )}
      </div>
     </div>
    ) : (
     <pre className="card-soft mt-4 p-3 whitespace-pre-wrap min-h-[120px]">{output}</pre>
    )}

    {lastRunStatus === "error" && lastRunError && (
     <div className="text-xs text-red-600 mt-2">{lastRunError}</div>
    )}

   </div>

   {strip.show && (
    <div className={`fixed bottom-0 left-0 right-0 p-3 text-white ${strip.type==="success" ? "bg-emerald-600" : strip.type==="error" ? "bg-red-600" : "bg-amber-500"}`}>
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
     <div className="text-sm flex items-center gap-2">
      {strip.ai && (
       <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold bg-white/20">
        AI Hint
       </span>
      )}
      <span>{strip.message}</span>
     </div>
      {strip.showNext && (
       <button
        className="btn btn-outline bg-white text-black"
        onClick={()=>{
         if(strip.nextType === "topic"){
          const nextId = nextTopicId();
          if(nextId) navigate(`/instructions/${nextId}`);
          else navigate("/dashboard");
          return;
         }
         const next = getNextProblem();
         if(next) openProblem(next);
        }}
       >
        {strip.nextType === "topic" ? "Next Topic" : "Next Problem"}
       </button>
      )}
     </div>
    </div>
   )}

   {showCongrats && (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
     <div className="card p-6 text-center w-80">
      <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
      <p className="text-sm mb-4">All problems solved for this topic.</p>
      <button
       className="btn btn-primary w-full"
       onClick={()=>{
        const nextId = nextTopicId();
        if(nextId) navigate(`/learn/${nextId}`);
        else navigate("/dashboard");
        setShowCongrats(false);
       }}
      >
       Next Topic
      </button>
     </div>
    </div>
   )}

   </div>
  </div>
 );
}
