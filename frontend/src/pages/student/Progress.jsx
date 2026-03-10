import { useEffect, useMemo, useState } from "react";
import StudentHeader from "../../components/StudentHeader";
import { getProgressSummary } from "../../services/progressApi";
import { getStudentTopics } from "../../services/studentTopicApi";

export default function Progress(){
  const[summary,setSummary] = useState({});
  const[topics,setTopics] = useState([]);
  const[loading,setLoading] = useState(true);
  const[error,setError] = useState("");

  useEffect(()=>{
    load();
  },[]);

  const load = async()=>{
    try{
      setLoading(true);
      setError("");
      const [s, t] = await Promise.all([getProgressSummary(), getStudentTopics()]);
      setSummary(s.data || {});
      setTopics(t.data || []);
    }catch{
      setError("Unable to load progress.");
    }finally{
      setLoading(false);
    }
  };

  const rows = useMemo(()=>{
    return topics.map((t)=>{
      const stat = summary[t._id] || { total: 0, solved: 0 };
      const percent = stat.total ? Math.round((stat.solved / stat.total) * 100) : 0;
      return { ...t, stat, percent };
    });
  },[topics, summary]);

  return(
    <div className="page-anim page-shell">
      <StudentHeader/>
      <div className="page-wrap">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold">Progress</h1>
            <p className="text-sm text-slate-500 mt-1">Track your topic completion and practice progress.</p>
          </div>
          <button className="btn btn-outline w-full md:w-auto" onClick={load} disabled={loading}>Refresh</button>
        </div>

        {error && (
          <div className="card-soft mt-6 p-4 text-sm text-red-600">{error}</div>
        )}

        <div className="mt-6 grid gap-4">
          {loading && (
            <div className="card p-6 text-sm text-slate-500">Loading progress...</div>
          )}
          {!loading && rows.map((row)=>(
            <div key={row._id} className="card p-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="text-xs uppercase tracking-widest text-emerald-700">Topic</div>
                  <div className="text-lg font-semibold mt-1">{row.title}</div>
                </div>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-[11px] bg-white"
                  style={{ background: `conic-gradient(#0f766e ${row.percent}%, #e5e7eb 0)` }}
                >
                  <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center">
                    <span>{row.percent}%</span>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="h-2 rounded-full bg-emerald-600 transition-all" style={{ width: `${row.percent}%` }} />
                </div>
                <div className="text-sm text-slate-600 mt-2 flex items-center justify-between">
                  <span>Problems: {row.stat.solved} / {row.stat.total}</span>
                  <span className="text-xs uppercase tracking-widest text-slate-500">
                    {row.stat.solved} of {row.stat.total} done
                  </span>
                </div>
              </div>
            </div>
          ))}
          {!loading && !rows.length && !error && (
            <div className="card p-6 text-sm text-slate-500">No topics found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
