import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentHeader from "../../components/StudentHeader";
import { getTutorials } from "../../services/tutorialApi";
import { getTutorialProgress } from "../../services/tutorialProgressApi";

export default function Tutorials(){
  const[tutorials,setTutorials] = useState([]);
  const[progress,setProgress] = useState({});
  const[query,setQuery] = useState("");
  const[loading,setLoading] = useState(true);
  const[error,setError] = useState("");
  const[showSuggestions,setShowSuggestions] = useState(false);
  const[showCongrats,setShowCongrats] = useState(false);
  const[showScrollTop,setShowScrollTop] = useState(false);
  const navigate = useNavigate();
  const isYoutubeUrl = (url = "") => /youtube\.com|youtu\.be/.test(url);
  const getYoutubeThumb = (url = "") => {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:\?|&|$)/);
    const id = match ? match[1] : "";
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
  };

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
      const [res, p] = await Promise.all([getTutorials(), getTutorialProgress()]);
      setTutorials(res.data || []);
      const map = {};
      (p.data || []).forEach((item) => {
        map[item.tutorialId] = item || {};
      });
      setProgress(map);
    }catch{
      setError("Unable to load tutorials. Please refresh.");
    }finally{
      setLoading(false);
    }
  };

  const isTutorialComplete = (t, doc)=>{
    const quiz = t?.quiz || [];
    const problems = t?.problems || [];
    const score = doc?.quizScore || 0;
    const quizOk = quiz.length ? score >= 80 || doc?.quizPassed : true;
    const solved = Array.isArray(doc?.solvedProblemIds) ? doc.solvedProblemIds.length : 0;
    const problemsOk = problems.length ? solved >= problems.length : true;
    return quizOk && problemsOk;
  };

  useEffect(()=>{
    if (!tutorials.length) return;
    const allWatched = tutorials.every(t => isTutorialComplete(t, progress[t._id]));
    if (allWatched && !localStorage.getItem("congrats_tutorials_shown")) {
      setShowCongrats(true);
      localStorage.setItem("congrats_tutorials_shown", "1");
    }
  }, [tutorials, progress]);

  const continueTutorial = ()=>{
    const lastId = localStorage.getItem("lastTutorialId");
    if (lastId) {
      navigate(`/tutorials/${lastId}`);
      return;
    }
    const firstUnlocked = tutorials.find((t, idx)=>{
      if (idx === 0) return true;
      const prev = tutorials[idx - 1];
      return isTutorialComplete(prev, progress[prev._id]);
    });
    if (firstUnlocked?._id) navigate(`/tutorials/${firstUnlocked._id}`);
  };

  const filtered = useMemo(()=>{
    const q = query.trim().toLowerCase();
    if(!q) return tutorials;
    return tutorials.filter(t => (t.title || "").toLowerCase().includes(q));
  },[tutorials, query]);

  const orderIndex = useMemo(()=>{
    const map = {};
    tutorials.forEach((t, idx) => {
      map[t._id] = idx;
    });
    return map;
  }, [tutorials]);

  const suggestions = useMemo(()=>{
    const q = query.trim().toLowerCase();
    if(!q) return [];
    return tutorials
      .filter(t => (t.title || "").toLowerCase().includes(q))
      .slice(0, 6);
  },[tutorials, query]);

  return(
    <div className="page-anim page-shell">
      <StudentHeader/>
      <div className="page-wrap">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold">Tutorials</h1>
            <p className="text-sm text-slate-500 mt-1">Search and open tutorials in order.</p>
          </div>
          <button className="btn btn-primary w-full md:w-auto" onClick={continueTutorial} disabled={loading}>Continue</button>
        </div>

        <div className="mt-4 grid md:grid-cols-[1fr_200px] gap-3 items-stretch">
          <div className="relative">
            <input
              className="input pr-10"
              placeholder="Search tutorial..."
              value={query}
              onChange={e=>{
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={()=>setShowSuggestions(true)}
              onBlur={()=>setTimeout(()=>setShowSuggestions(false), 150)}
            />
            {query && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                onClick={()=>{
                  setQuery("");
                  setShowSuggestions(false);
                }}
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
                    onClick={()=>{
                      setQuery(t.title || "");
                      setShowSuggestions(false);
                    }}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-outline w-full md:w-auto" onClick={()=>setShowSuggestions(false)}>
            Search
          </button>
        </div>

        {error && (
          <div className="card-soft mt-6 p-4 text-sm text-red-600">{error}</div>
        )}

        <div className="mt-6 grid gap-4">
          {loading && (
            <div className="card p-6 text-sm text-slate-500">Loading tutorials...</div>
          )}
          {!loading && filtered.map((t)=>{
            const percent = progress[t._id]?.percent || 0;
            const idx = orderIndex[t._id] ?? -1;
            const prev = idx > 0 ? tutorials[idx - 1] : null;
            const prevComplete = prev ? isTutorialComplete(prev, progress[prev._id]) : true;
            const unlocked = idx === 0 || prevComplete;
            const isYoutube = isYoutubeUrl(t.videoUrl || "");
            const thumb = t.thumbnailUrl || (isYoutube ? getYoutubeThumb(t.videoUrl || "") : "");
            return (
              <button
                key={t._id}
                className={`card p-4 sm:p-5 grid grid-cols-[120px_1fr] sm:grid-cols-[160px_1fr] md:grid-cols-[220px_1fr] gap-3 sm:gap-4 items-start text-left ${!unlocked ? "opacity-60" : ""}`}
                disabled={!unlocked}
                onClick={()=>navigate(`/tutorials/${t._id}`)}
              >
                <div className="w-full">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={t.title || "Tutorial thumbnail"}
                      className="w-full h-24 sm:h-28 md:h-40 object-cover rounded-xl border border-slate-200"
                    />
                  ) : (
                    <div className="w-full h-40 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                      No thumbnail
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-emerald-700">Tutorial</div>
                  <div className="mt-2 text-lg font-semibold">
                    Lesson {t.order ?? 0}: {t.title}
                  </div>
                  <div className="mt-2 text-sm text-slate-500">Progress: {Math.round(percent)}%</div>
                  <div className="card-soft p-4 mt-3 hidden sm:block">
                    <div className="text-xs uppercase tracking-widest text-slate-500">Description</div>
                    <div className="mt-3 text-sm text-slate-700">
                      {t.description || "No description available."}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          {!loading && !filtered.length && !error && (
            <div className="card p-6 text-sm text-slate-500">No tutorials match your search.</div>
          )}
        </div>
      </div>
      {showCongrats && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card p-6 text-center w-80">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
            <p className="text-sm text-slate-600 mb-4">You watched all tutorials.</p>
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
  );
}
