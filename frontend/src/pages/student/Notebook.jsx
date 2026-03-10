import { useEffect, useMemo, useRef, useState } from "react";
import StudentHeader from "../../components/StudentHeader";
import { getTutorials } from "../../services/tutorialApi";
import { getMe } from "../../services/studentProfileApi";

const hasSavedNotes = (text = "", shots = []) => {
  return text.trim().length > 0 || (Array.isArray(shots) && shots.length > 0);
};

export default function Notebook(){
  const [tutorials, setTutorials] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [notesText, setNotesText] = useState("");
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasSelection, setHasSelection] = useState(false);
  const [userName, setUserName] = useState("");
  const [findText, setFindText] = useState("");
  const [findCount, setFindCount] = useState(0);
  const [findIndex, setFindIndex] = useState(0);
  const [previewFullscreenOpen, setPreviewFullscreenOpen] = useState(false);
  const [imageFullscreenSrc, setImageFullscreenSrc] = useState("");
  const [mobilePane, setMobilePane] = useState("lessons");
  const [query, setQuery] = useState("");
  const editorRef = useRef(null);

  useEffect(()=>{
    load();
  },[]);

  const load = async()=>{
    try{
      setLoading(true);
      setError("");
      const [res, me] = await Promise.all([getTutorials(), getMe()]);
      setTutorials(res.data || []);
      setUserName(me.data?.name || "Student");
    }catch{
      setError("Unable to load notebook.");
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{
    setHasSelection(false);
  }, [selectedId]);
 
  useEffect(()=>{
    if (selectedId) setMobilePane("editor");
  }, [selectedId]);

  const lessonsWithNotes = useMemo(()=>{
    return tutorials.filter((t)=>{
      const saved = localStorage.getItem(`notes:${t._id}`) || "";
      const savedShots = localStorage.getItem(`notesShots:${t._id}`) || "[]";
      let parsedShots = [];
      try{
        parsedShots = JSON.parse(savedShots);
      }catch{
        parsedShots = [];
      }
      return hasSavedNotes(saved, parsedShots);
    });
  }, [tutorials]);

  const filteredLessons = useMemo(()=>{
    const q = query.trim().toLowerCase();
    if (!q) return lessonsWithNotes;
    return lessonsWithNotes.filter((t)=>(t.title || "").toLowerCase().includes(q));
  }, [lessonsWithNotes, query]);

  useEffect(()=>{
    if (!selectedId) return;
  }, [selectedId]);

  useEffect(()=>{
    if (!selectedId) {
      setNotesText("");
      setScreenshots([]);
      return;
    }
    const stored = localStorage.getItem(`notes:${selectedId}`) || "";
    const normalized = stored.includes("<")
      ? stored.replace(/<[^>]*>/g, "").replace(/\[\[img:[^\]]+\]\]/g, "")
      : stored.replace(/\[\[img:[^\]]+\]\]/g, "");
    const storedShots = localStorage.getItem(`notesShots:${selectedId}`) || "[]";
    setNotesText(normalized);
    try{
      setScreenshots(JSON.parse(storedShots));
    }catch{
      setScreenshots([]);
    }
  }, [selectedId]);

  const syncNotes = ()=>{
    if (!selectedId) return;
    localStorage.setItem(`notes:${selectedId}`, notesText);
  };

  const wrapSelection = (startTag, endTag)=>{
    const el = editorRef.current;
    if (!el) return;
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    if (start === end) return;
    const before = notesText.slice(0, start);
    const selected = notesText.slice(start, end);
    const after = notesText.slice(end);
    const next = `${before}${startTag}${selected}${endTag}${after}`;
    setNotesText(next);
  };

  const applyBullets = ()=>{
    const el = editorRef.current;
    if (!el) return;
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const before = notesText.slice(0, start);
    const selected = notesText.slice(start, end) || "";
    const after = notesText.slice(end);
    const lines = (selected || " ").split("\n").map((line)=> line.startsWith("- ") ? line : `- ${line}`);
    setNotesText(`${before}${lines.join("\n")}${after}`);
  };

  const escapeRegExp = (value)=>value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const highlightFind = (term)=>{
    if (!term) {
      setFindCount(0);
      setFindIndex(0);
      return;
    }
    const matches = (notesText.toLowerCase().match(new RegExp(escapeRegExp(term.toLowerCase()), "g")) || []).length;
    setFindCount(matches);
    setFindIndex(matches ? 1 : 0);
  };

  const jumpToMatch = (dir)=>{
    if (!findCount) return;
    let next = findIndex + dir;
    if (next < 1) next = findCount;
    if (next > findCount) next = 1;
    setFindIndex(next);
  };

  useEffect(()=>{
    if (!findIndex) return;
    const target = document.querySelector(`[data-find-index="${findIndex}"]`);
    if (target) target.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [findIndex]);

  const openImageFullscreen = (src)=>{
    if (!src) return;
    setImageFullscreenSrc(src);
  };

  const selectedLesson = lessonsWithNotes.find((t)=>t._id === selectedId);
  const quotes = [
    "Small steps every day lead to big wins.",
    "Consistency beats intensity. Keep going.",
    "You are closer than you think.",
    "Focus, learn, and grow — one lesson at a time."
  ];
  const quote = quotes[(userName.length + tutorials.length) % quotes.length];
  useEffect(()=>{ syncNotes(); }, [notesText]);

  const NotesPreview = ({ text, findText: search, findIndex: activeIndex })=>{
    let globalCounter = 0;
    const highlightText = (segment)=>{
      if (!search) return [segment];
      const lower = segment.toLowerCase();
      const needle = search.toLowerCase();
      const out = [];
      let idx = 0;
      while (idx < segment.length) {
        const pos = lower.indexOf(needle, idx);
        if (pos === -1) {
          out.push(segment.slice(idx));
          break;
        }
        if (pos > idx) out.push(segment.slice(idx, pos));
        globalCounter += 1;
        out.push(
          <mark
            key={`m-${globalCounter}`}
            className={`note-find ${globalCounter === activeIndex ? "note-find-active" : ""}`}
            data-find-index={globalCounter}
          >
            {segment.slice(pos, pos + needle.length)}
          </mark>
        );
        idx = pos + needle.length;
      }
      return out;
    };

    const renderInline = (segment)=>{
      const tokens = segment.split(/(\*\*[^*]+\*\*|_[^_]+_|\[\[hl\]\][\s\S]*?\[\[\/hl\]\]|\[\[color:[^\]]+\]\][\s\S]*?\[\[\/color\]\]|\[\[size:[^\]]+\]\][\s\S]*?\[\[\/size\]\])/g);
      return tokens.map((token, idx)=>{
        if (token.startsWith("**") && token.endsWith("**")) {
          return <strong key={`b-${idx}`}>{highlightText(token.slice(2, -2))}</strong>;
        }
        if (token.startsWith("_") && token.endsWith("_")) {
          return <em key={`i-${idx}`}>{highlightText(token.slice(1, -1))}</em>;
        }
        if (token.startsWith("[[hl]]") && token.endsWith("[[/hl]]")) {
          return <mark key={`h-${idx}`} className="note-find">{highlightText(token.slice(6, -6))}</mark>;
        }
        if (token.startsWith("[[color:") && token.includes("]][[")) {
          const color = token.slice(8, token.indexOf("]]"));
          const inner = token.slice(token.indexOf("]]") + 2, token.lastIndexOf("[[/color]]"));
          return <span key={`c-${idx}`} style={{ color }}>{highlightText(inner)}</span>;
        }
        if (token.startsWith("[[size:") && token.includes("]][[")) {
          const size = token.slice(7, token.indexOf("]]"));
          const inner = token.slice(token.indexOf("]]") + 2, token.lastIndexOf("[[/size]]"));
          const fontSize = size === "2" ? "12px" : size === "4" ? "18px" : size === "5" ? "22px" : "14px";
          return <span key={`s-${idx}`} style={{ fontSize }}>{highlightText(inner)}</span>;
        }
        return <span key={`t-${idx}`}>{highlightText(token)}</span>;
      });
    };

    return <div className="whitespace-pre-wrap break-words">{renderInline(text || "")}</div>;
  };

  return(
    <div className="page-anim page-shell">
      <StudentHeader/>
      <div className="page-wrap max-w-none px-3 sm:px-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold">Notebook</h1>
            <p className="text-sm text-slate-500 mt-1">All your lesson notes in one place.</p>
          </div>
        </div>

        {error && (
          <div className="card-soft mt-6 p-4 text-sm text-red-600">{error}</div>
        )}

        <div className="mt-4 lg:hidden card-soft p-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              className={`btn text-sm ${mobilePane === "lessons" ? "btn-primary" : "btn-outline"}`}
              onClick={()=>setMobilePane("lessons")}
            >
              Lessons
            </button>
            <button
              className={`btn text-sm ${mobilePane === "editor" ? "btn-primary" : "btn-outline"}`}
              onClick={()=>setMobilePane("editor")}
              disabled={!selectedId}
            >
              Notes
            </button>
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-[260px_1fr] gap-4">
          <div
            className={`card p-4 h-fit lg:sticky lg:top-24 ${
              mobilePane !== "lessons" ? "hidden lg:block" : ""
            }`}
          >
            <div className="text-xs uppercase tracking-widest text-slate-500">Lessons</div>
            <div className="mt-3">
              <input
                className="input h-9 text-sm"
                placeholder="Search lessons..."
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
              />
            </div>
            <div className="mt-3 grid gap-2 max-h-[60vh] lg:max-h-[70vh] overflow-auto no-scrollbar pr-1">
              {loading && (
                <div className="text-sm text-slate-500">Loading...</div>
              )}
              {!loading && !lessonsWithNotes.length && (
                <div className="text-sm text-slate-500">No notes yet.</div>
              )}
              {!loading && lessonsWithNotes.length > 0 && !filteredLessons.length && (
                <div className="text-sm text-slate-500">No lessons match your search.</div>
              )}
              {!loading && filteredLessons.map((t)=>(
                <button
                  key={t._id}
                  className={`w-full text-left px-3 py-2 rounded-lg border ${
                    selectedId === t._id ? "bg-emerald-50 border-emerald-200" : "border-slate-200 hover:bg-slate-50"
                  }`}
                  onClick={()=>{
                    setSelectedId(t._id);
                    setMobilePane("editor");
                  }}
                >
                  Lesson {t.order ?? 0}: {t.title}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`card p-3 md:p-4 ${mobilePane !== "editor" ? "hidden lg:block" : ""}`}
          >
            <div className="text-xs uppercase tracking-widest text-slate-500">Editor</div>
            <div className="mt-2 flex flex-wrap gap-2 items-center">
              <button
                className="btn btn-outline px-3 py-1 text-sm"
                onClick={()=>wrapSelection("**", "**")}
                disabled={!hasSelection}
              >
                Bold
              </button>
              <button
                className="btn btn-outline px-3 py-1 text-sm"
                onClick={()=>wrapSelection("_", "_")}
                disabled={!hasSelection}
              >
                Italic
              </button>
              <button
                className="btn btn-outline px-3 py-1 text-sm"
                onClick={()=>wrapSelection("__", "__")}
                disabled={!hasSelection}
              >
                Underline
              </button>
              <button
                className="btn btn-outline px-3 py-1 text-sm"
                onClick={applyBullets}
              >
                Bullets
              </button>
              <button
                className="btn btn-outline px-3 py-1 text-sm"
                onClick={()=>wrapSelection("[[hl]]", "[[/hl]]")}
                disabled={!hasSelection}
              >
                Highlight
              </button>
              <select
                className="select w-full sm:w-28 h-8 text-sm"
                defaultValue="16"
                onChange={(e)=>wrapSelection(`[[size:${e.target.value}]]`, "[[/size]]")}
              >
                <option value="2">Small</option>
                <option value="3">Normal</option>
                <option value="4">Large</option>
                <option value="5">Title</option>
              </select>
              <input
                type="color"
                className="h-8 w-10 border border-slate-200 rounded"
                onChange={(e)=>wrapSelection(`[[color:${e.target.value}]]`, "[[/color]]")}
                title="Text color"
              />
              <div className="flex items-center gap-2">
                <input
                  className="input h-8 text-sm w-full sm:w-40"
                  placeholder="Search notes..."
                  value={findText}
                  onChange={(e)=>{
                    const val = e.target.value;
                    setFindText(val);
                    highlightFind(val);
                  }}
                />
                <button
                  className="btn btn-outline px-2 py-1 text-xs"
                  onClick={()=>jumpToMatch(1)}
                  disabled={!findCount}
                >
                  Next
                </button>
                <button
                  className="btn btn-outline px-2 py-1 text-xs"
                  onClick={()=>jumpToMatch(-1)}
                  disabled={!findCount}
                >
                  Prev
                </button>
                <span className="text-[11px] text-slate-500">
                  {findCount ? `${findIndex}/${findCount}` : "0"}
                </span>
              </div>
              </div>

            {!selectedLesson ? (
              <div className="mt-6 card-soft p-6 text-center">
                <div className="text-xs uppercase tracking-widest text-slate-500">Welcome</div>
                <h2 className="text-2xl font-bold mt-2">Hi {userName}!</h2>
                <p className="text-sm text-slate-600 mt-2">{quote}</p>
                <div className="mt-4 text-xs text-slate-500">Select a lesson from the left to open notes.</div>
              </div>
            ) : (
              <>
                <div className="mt-3 text-sm text-slate-600">
                  Lesson: <span className="font-semibold">{selectedLesson.title}</span>
                </div>
                <textarea
                  ref={editorRef}
                  className="textarea mt-4 h-[220px] overflow-auto no-scrollbar"
                  value={notesText}
                  onChange={(e)=>setNotesText(e.target.value)}
                  onSelect={(e)=>{
                    const start = e.target.selectionStart || 0;
                    const end = e.target.selectionEnd || 0;
                    setHasSelection(end > start);
                  }}
                  onKeyUp={(e)=>{
                    const start = e.target.selectionStart || 0;
                    const end = e.target.selectionEnd || 0;
                    setHasSelection(end > start);
                  }}
                />
                <div className="mt-3 card-soft p-3 text-sm text-slate-700 max-h-56 overflow-auto no-scrollbar">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="text-[11px] uppercase tracking-widest text-slate-500">Preview</div>
                    <button
                      className="btn btn-outline px-2 py-1 text-xs"
                      onClick={()=>setPreviewFullscreenOpen(true)}
                    >
                      Full Screen
                    </button>
                  </div>
                  <NotesPreview
                    text={notesText}
                    findText={findText}
                    findIndex={findIndex}
                  />
                </div>
                {!!screenshots.length && (
                  <div className="mt-3 card-soft p-3 text-sm text-slate-700 max-h-64 overflow-auto no-scrollbar">
                    <div className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">Screenshots</div>
                    <div className="grid gap-2">
                      {screenshots.map((shot, idx)=>(
                        <div key={`${shot?.dataUrl || "shot"}-${idx}`} className="note-shot">
                          <img src={shot?.dataUrl} alt={`lesson screenshot ${idx + 1}`} />
                          <button
                            className="btn btn-outline px-2 py-1 text-xs mt-2"
                            onClick={()=>openImageFullscreen(shot?.dataUrl)}
                          >
                            Full Screen
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {previewFullscreenOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 p-4 md:p-8">
          <div className="card h-full w-full p-4 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="text-xs uppercase tracking-widest text-slate-500">Notes Preview</div>
              <button
                className="btn btn-outline px-3 py-1 text-xs"
                onClick={()=>setPreviewFullscreenOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-auto no-scrollbar pr-1">
              <NotesPreview
                text={notesText}
                findText={findText}
                findIndex={findIndex}
              />
            </div>
          </div>
        </div>
      )}

      {imageFullscreenSrc && (
        <div className="fixed inset-0 z-[60] bg-black/90 p-4 md:p-8 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={imageFullscreenSrc}
              alt="fullscreen screenshot"
              className="max-h-full max-w-full object-contain rounded-lg"
            />
            <button
              className="btn btn-outline px-3 py-1 text-xs absolute top-2 right-2 bg-white"
              onClick={()=>setImageFullscreenSrc("")}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
