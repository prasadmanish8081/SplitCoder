import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StudentHeader from "../../components/StudentHeader";
import { getMe, updateMe, deleteMe } from "../../services/studentProfileApi";
import { getProgressSummary, resetProgress } from "../../services/progressApi";
import { getTutorials } from "../../services/tutorialApi";
import { getTutorialProgress } from "../../services/tutorialProgressApi";
import { getStudentTopics } from "../../services/studentTopicApi";

export default function Profile(){
 const navigate = useNavigate();
 const location = useLocation();
 const[user,setUser] = useState(null);
 const[name,setName] = useState("");
 const[email,setEmail] = useState("");
 const[password,setPassword] = useState("");
 const[loading,setLoading] = useState(true);
 const[saving,setSaving] = useState(false);
 const[error,setError] = useState("");
 const[theme,setTheme] = useState("light");
 const[topics,setTopics] = useState([]);
 const[summary,setSummary] = useState({});
 const[tutorials,setTutorials] = useState([]);
 const[tutorialProgress,setTutorialProgress] = useState({});
 const[activeSection,setActiveSection] = useState("profile");

 useEffect(()=>{
  load();
 },[]);

 useEffect(()=>{
  const params = new URLSearchParams(location.search);
  const tab = params.get("tab");
  if (tab === "progress") setActiveSection("progress");
 },[location.search]);

 useEffect(()=>{
  const saved = localStorage.getItem("theme") || "light";
  setTheme(saved);
  const root = document.documentElement;
  if(saved === "dark") root.classList.add("theme-dark");
  else root.classList.remove("theme-dark");
 },[]);

 const load = async()=>{
  try{
   setLoading(true);
   setError("");
   const [res, t, s, tut, tutProg] = await Promise.all([
    getMe(),
    getStudentTopics(),
    getProgressSummary(),
    getTutorials(),
    getTutorialProgress()
   ]);
   setUser(res.data);
   setName(res.data?.name || "");
   setEmail(res.data?.email || "");
   setTopics(t.data || []);
   setSummary(s.data || {});
   setTutorials(tut.data || []);
   const progMap = {};
   (tutProg.data || []).forEach((item)=>{
    progMap[item.tutorialId] = item.percent || 0;
   });
   setTutorialProgress(progMap);
  }catch{
   setError("Unable to load profile.");
  }finally{
   setLoading(false);
  }
 };

 const save = async()=>{
  try{
   setSaving(true);
   await updateMe({ name, email, password: password || undefined });
   setPassword("");
   load();
  }catch{
   setError("Unable to update profile.");
  }finally{
   setSaving(false);
  }
 };

 const removeAccount = async()=>{
  const ok = window.confirm("This will permanently delete your account. Continue?");
  if(!ok) return;
  await deleteMe();
  localStorage.removeItem("studentToken");
  navigate("/login");
 };

 const toggleTheme = (next)=>{
  const root = document.documentElement;
  setTheme(next);
  localStorage.setItem("theme", next);
  if(next === "dark") root.classList.add("theme-dark");
  else root.classList.remove("theme-dark");
 };

 const restartCourse = async()=>{
  const ok = window.confirm("This will reset all your progress and lock topics again. Continue?");
  if(!ok) return;
  await resetProgress();
  navigate("/dashboard");
 };

 return(
  <div className="page-anim page-shell">
   <StudentHeader/>
   <div className="page-wrap">
    <div className="flex items-center justify-between flex-wrap gap-3">
     <div>
      <h1 className="text-3xl font-bold">Profile</h1>
      <p className="text-sm text-slate-500 mt-1">Manage your account details.</p>
     </div>
     <button className="btn btn-outline w-full md:w-auto" onClick={load} disabled={loading}>Refresh</button>
    </div>

    {error && (
     <div className="card-soft mt-6 p-4 text-sm text-red-600">{error}</div>
    )}

    <div className="grid lg:grid-cols-[260px,1fr] gap-6 mt-6">
     <div className="card-soft p-4 h-fit lg:sticky lg:top-24">
      <div className="text-xs uppercase tracking-widest text-slate-500">Navigation</div>
      <div className="mt-3 flex flex-col gap-2">
       <button className={`text-left ${activeSection==="profile" ? "font-semibold" : "text-slate-600"}`} onClick={()=>setActiveSection("profile")}>Profile</button>
       <button className={`text-left ${activeSection==="settings" ? "font-semibold" : "text-slate-600"}`} onClick={()=>setActiveSection("settings")}>Settings</button>
       <button className={`text-left ${activeSection==="progress" ? "font-semibold" : "text-slate-600"}`} onClick={()=>setActiveSection("progress")}>Progress</button>
       <button className={`text-left ${activeSection==="delete" ? "font-semibold text-red-600" : "text-red-600"}`} onClick={()=>setActiveSection("delete")}>Delete Account</button>
      </div>
     </div>

     <div className="grid gap-6">
      {activeSection === "profile" && (
      <div id="profile-section" className="card p-5">
       <h2 className="text-lg font-semibold mb-3">Account Update</h2>
       <div className="grid md:grid-cols-2 gap-3">
        <input className="input" value={name} placeholder="Name" onChange={e=>setName(e.target.value)} />
        <input className="input" value={email} placeholder="Email" onChange={e=>setEmail(e.target.value)} />
       </div>
       <input className="input mt-3" type="password" value={password} placeholder="New Password" onChange={e=>setPassword(e.target.value)} />
       <div className="mt-4 flex gap-3">
        <button className="btn btn-primary w-full md:w-auto" onClick={save} disabled={saving || loading || !user}>
         {saving ? "Saving..." : "Save Changes"}
        </button>
       </div>
      </div>
      )}

      {activeSection === "settings" && (
      <div id="settings-section" className="card-soft p-5">
       <h2 className="text-lg font-semibold mb-2">Settings</h2>
       <div className="grid gap-4">
        <div>
         <div className="text-sm text-slate-600 mb-2">Theme</div>
         <div className="flex flex-col md:flex-row gap-2">
          <button className={`btn w-full md:w-auto ${theme === "light" ? "btn-primary" : "btn-outline"}`} onClick={()=>toggleTheme("light")}>
           Light
          </button>
          <button className={`btn w-full md:w-auto ${theme === "dark" ? "btn-primary" : "btn-outline"}`} onClick={()=>toggleTheme("dark")}>
           Dark
          </button>
         </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
         <div className="text-sm text-slate-600 mb-2">Restart Course</div>
         <button className="btn btn-secondary w-full md:w-auto" onClick={restartCourse}>
          Restart Full Course
         </button>
        </div>
       </div>
      </div>
      )}

      {activeSection === "progress" && (
      <div id="progress-section" className="card p-5">
       <h2 className="text-lg font-semibold mb-3">Progress Overview</h2>
       {(() => {
        const totals = topics.reduce((acc, t) => {
         const stat = summary[t._id] || { total: 0, solved: 0 };
         const completed = stat.total > 0 && stat.solved === stat.total;
         return {
          totalTopics: acc.totalTopics + 1,
          completedTopics: acc.completedTopics + (completed ? 1 : 0)
         };
        }, { totalTopics: 0, completedTopics: 0 });
        const topicPercent = totals.totalTopics ? Math.round((totals.completedTopics / totals.totalTopics) * 100) : 0;
        const videoPercent = tutorials.length
         ? Math.round(tutorials.reduce((sum, t)=>sum + (tutorialProgress[t._id] || 0), 0) / tutorials.length)
         : 0;
        const overallPercent = Math.round((topicPercent + videoPercent) / 2);
        return (
         <div className="grid md:grid-cols-[1.2fr_1fr] gap-6">
          <div className="card-soft p-5 flex items-center gap-5">
           <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-[12px] bg-white"
            style={{ background: `conic-gradient(#0f766e ${overallPercent}%, #e5e7eb 0)` }}
           >
            <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center">
             <span className="font-semibold">{overallPercent}%</span>
            </div>
           </div>
           <div>
            <div className="text-sm text-slate-600">Overall Progress</div>
            <div className="text-lg font-semibold">Topics + Videos</div>
           </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
           <div className="card-soft p-4 text-center">
            <div
             className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-[10px] bg-white"
             style={{ background: `conic-gradient(#0f766e ${topicPercent}%, #e5e7eb 0)` }}
            >
             <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center">
              <span>{topicPercent}%</span>
             </div>
            </div>
            <div className="mt-2 text-xs text-slate-600">Topics</div>
            <div className="text-sm font-semibold">{totals.completedTopics} / {totals.totalTopics}</div>
           </div>
           <div className="card-soft p-4 text-center">
            <div
             className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-[10px] bg-white"
             style={{ background: `conic-gradient(#0ea5a4 ${videoPercent}%, #e5e7eb 0)` }}
            >
             <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center">
              <span>{videoPercent}%</span>
             </div>
            </div>
            <div className="mt-2 text-xs text-slate-600">Videos</div>
            <div className="text-sm font-semibold">{tutorials.length} lessons</div>
           </div>
          </div>
         </div>
        );
       })()}
      </div>
      )}

      {activeSection === "delete" && (
      <div id="delete-section" className="card p-5 border border-red-200">
       <h2 className="text-lg font-semibold mb-2 text-red-600">Delete Account</h2>
       <div className="text-sm text-slate-600 mb-4">
        This action cannot be undone. Your progress will be removed.
       </div>
       <button className="btn btn-secondary w-full md:w-auto" onClick={removeAccount}>
        Delete Account
       </button>
      </div>
      )}
     </div>
    </div>
   </div>
  </div>
 );
}
