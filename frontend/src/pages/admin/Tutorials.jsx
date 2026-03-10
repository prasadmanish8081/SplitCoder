import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { addTutorial, deleteTutorial, getTutorials, updateTutorial } from "../../services/tutorialApi";

export default function Tutorials(){
  const[items,setItems] = useState([]);
  const[title,setTitle] = useState("");
  const[description,setDescription] = useState("");
  const[videoUrl,setVideoUrl] = useState("");
  const[thumbnailUrl,setThumbnailUrl] = useState("");
  const[order,setOrder] = useState("");
  const[problems,setProblems] = useState([]);
  const[quiz,setQuiz] = useState([]);
  const[editingId,setEditingId] = useState(null);
  const[loading,setLoading] = useState(true);
  const[error,setError] = useState("");

  useEffect(()=>{
    load();
  },[]);

  const load = async()=>{
    try{
      setLoading(true);
      setError("");
      const res = await getTutorials();
      setItems(res.data || []);
    }catch{
      setError("Unable to load tutorials.");
    }finally{
      setLoading(false);
    }
  };

  const setVideoFromFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setVideoUrl(reader.result || "");
    };
    reader.readAsDataURL(file);
  };

  const setThumbnailFromFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setThumbnailUrl(reader.result || "");
    };
    reader.readAsDataURL(file);
  };

  const submit = async()=>{
    const payload = { title, description, videoUrl, thumbnailUrl, order: order === "" ? 0 : Number(order), problems, quiz };
    if(editingId) await updateTutorial(editingId, payload);
    else await addTutorial(payload);
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setThumbnailUrl("");
    setOrder("");
    setProblems([]);
    setQuiz([]);
    setEditingId(null);
    load();
  };

  const startEdit = (t)=>{
    setTitle(t.title || "");
    setDescription(t.description || "");
    setVideoUrl(t.videoUrl || "");
    setThumbnailUrl(t.thumbnailUrl || "");
    setOrder(t.order ?? "");
    setProblems(t.problems || []);
    setQuiz(t.quiz || []);
    setEditingId(t._id);
  };

  const cancelEdit = ()=>{
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setThumbnailUrl("");
    setOrder("");
    setProblems([]);
    setQuiz([]);
    setEditingId(null);
  };

  const addProblem = ()=>{
    setProblems((prev)=>[
      ...prev,
      {
        title: "",
        statement: "",
        expectedOutput: "",
        hint: "",
        solution: "",
        hiddenTestcases: "",
        sampleInput: "",
        sampleOutput: "",
        rulesConstraints: "",
        difficulty: "easy",
        order: prev.length + 1
      }
    ]);
  };

  const updateProblem = (idx, field, value)=>{
    setProblems((prev)=>{
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const removeProblem = (idx)=>{
    setProblems((prev)=>prev.filter((_, i)=>i !== idx));
  };

  const addQuizQuestion = ()=>{
    setQuiz((prev)=>[
      ...prev,
      { question: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" }
    ]);
  };

  const updateQuiz = (idx, field, value)=>{
    setQuiz((prev)=>{
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const updateQuizOption = (qIdx, optIdx, value)=>{
    setQuiz((prev)=>{
      const next = [...prev];
      const options = Array.isArray(next[qIdx].options) ? [...next[qIdx].options] : ["", "", "", ""];
      options[optIdx] = value;
      next[qIdx] = { ...next[qIdx], options };
      return next;
    });
  };

  const removeQuizQuestion = (idx)=>{
    setQuiz((prev)=>prev.filter((_, i)=>i !== idx));
  };

  return(
    <AdminLayout>
      <div className="page-wrap max-w-5xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-3xl font-bold">Tutorials</h2>
            <p className="text-sm text-slate-500 mt-1">Add tutorial videos and descriptions.</p>
          </div>
          <button className="btn btn-outline" onClick={load} disabled={loading}>Refresh</button>
        </div>

        {error && <div className="card-soft mt-6 p-4 text-sm text-red-600">{error}</div>}

        <div className="card mt-6 p-5">
          <div className="grid md:grid-cols-3 gap-3">
            <input className="input" value={title} placeholder="Video Title" onChange={e=>setTitle(e.target.value)} />
            <input className="input" value={videoUrl} placeholder="Video URL (YouTube or direct)" onChange={e=>setVideoUrl(e.target.value)} />
            <input className="input" value={order} placeholder="Lesson Order" onChange={e=>setOrder(e.target.value)} />
          </div>
          <textarea className="textarea mt-3" rows={4} value={description} placeholder="Video Description" onChange={e=>setDescription(e.target.value)} />
          <div className="mt-3 grid md:grid-cols-2 gap-3 items-center">
            <div className="flex flex-wrap gap-2">
              <label className="btn btn-outline cursor-pointer w-fit">
                Upload Video
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={e=>setVideoFromFile(e.target.files?.[0])}
                />
              </label>
              <label className="btn btn-outline cursor-pointer w-fit">
                Upload Thumbnail
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e=>setThumbnailFromFile(e.target.files?.[0])}
                />
              </label>
            </div>
            <input
              className="input"
              value={thumbnailUrl}
              placeholder="Thumbnail URL (optional)"
              onChange={e=>setThumbnailUrl(e.target.value)}
            />
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold">Tutorial Problems</div>
              <button className="btn btn-outline" onClick={addProblem}>Add Problem</button>
            </div>
            {!problems.length && (
              <div className="text-xs text-slate-500 mt-2">No problems added yet.</div>
            )}
            <div className="mt-3 grid gap-3">
              {problems.map((p, idx)=>(
                <div key={`p-${idx}`} className="card-soft p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs uppercase tracking-widest text-slate-500">Problem {idx + 1}</div>
                    <button className="btn btn-ghost text-sm" onClick={()=>removeProblem(idx)}>Remove</button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 mt-2">
                    <input className="input" value={p.title} placeholder="Title" onChange={e=>updateProblem(idx, "title", e.target.value)} />
                    <input className="input" value={p.order ?? idx + 1} placeholder="Order" onChange={e=>updateProblem(idx, "order", Number(e.target.value))} />
                  </div>
                  <textarea className="textarea mt-2" rows={3} value={p.statement} placeholder="Statement" onChange={e=>updateProblem(idx, "statement", e.target.value)} />
                  <textarea className="textarea mt-2" rows={2} value={p.expectedOutput} placeholder="Expected Output" onChange={e=>updateProblem(idx, "expectedOutput", e.target.value)} />
                  <textarea className="textarea mt-2" rows={2} value={p.sampleInput} placeholder="Sample Input (optional)" onChange={e=>updateProblem(idx, "sampleInput", e.target.value)} />
                  <textarea className="textarea mt-2" rows={2} value={p.sampleOutput} placeholder="Sample Output (optional)" onChange={e=>updateProblem(idx, "sampleOutput", e.target.value)} />
                  <textarea className="textarea mt-2" rows={2} value={p.rulesConstraints} placeholder="Rules/Constraints (optional)" onChange={e=>updateProblem(idx, "rulesConstraints", e.target.value)} />
                  <textarea className="textarea mt-2" rows={2} value={p.hint} placeholder="Hint (optional)" onChange={e=>updateProblem(idx, "hint", e.target.value)} />
                  <textarea className="textarea mt-2" rows={2} value={p.solution} placeholder="Solution (optional)" onChange={e=>updateProblem(idx, "solution", e.target.value)} />
                  <textarea className="textarea mt-2" rows={2} value={p.hiddenTestcases} placeholder='Hidden Testcases JSON (optional)' onChange={e=>updateProblem(idx, "hiddenTestcases", e.target.value)} />
                  <select className="select mt-2" value={p.difficulty || "easy"} onChange={e=>updateProblem(idx, "difficulty", e.target.value)}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold">Quiz Questions</div>
              <button className="btn btn-outline" onClick={addQuizQuestion}>Add Question</button>
            </div>
            {!quiz.length && (
              <div className="text-xs text-slate-500 mt-2">No quiz added yet.</div>
            )}
            <div className="mt-3 grid gap-3">
              {quiz.map((q, idx)=>(
                <div key={`q-${idx}`} className="card-soft p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs uppercase tracking-widest text-slate-500">Question {idx + 1}</div>
                    <button className="btn btn-ghost text-sm" onClick={()=>removeQuizQuestion(idx)}>Remove</button>
                  </div>
                  <textarea className="textarea mt-2" rows={2} value={q.question} placeholder="Question" onChange={e=>updateQuiz(idx, "question", e.target.value)} />
                  <div className="mt-2 grid gap-2">
                    {(q.options || ["", "", "", ""]).map((opt, optIdx)=>(
                      <input
                        key={`q-${idx}-o-${optIdx}`}
                        className="input"
                        value={opt}
                        placeholder={`Option ${optIdx + 1}`}
                        onChange={e=>updateQuizOption(idx, optIdx, e.target.value)}
                      />
                    ))}
                  </div>
                  <div className="mt-2 grid md:grid-cols-2 gap-3">
                    <input
                      className="input"
                      value={q.correctIndex ?? 0}
                      placeholder="Correct Option Index (0-3)"
                      onChange={e=>updateQuiz(idx, "correctIndex", Number(e.target.value))}
                    />
                    <input
                      className="input"
                      value={q.explanation || ""}
                      placeholder="Explanation (optional)"
                      onChange={e=>updateQuiz(idx, "explanation", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="btn btn-primary" onClick={submit}>
              {editingId ? "Update Tutorial" : "Add Tutorial"}
            </button>
            {editingId && (
              <button className="btn btn-outline" onClick={cancelEdit}>Cancel</button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {loading && (
            <div className="card p-5 text-sm text-slate-500">Loading tutorials...</div>
          )}
          {!loading && items.map((t)=>(
            <div key={t._id} className="card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <b>Lesson {t.order ?? 0}: {t.title}</b>
                </div>
              {t.thumbnailUrl && (
                <div className="mt-2">
                  <img
                    src={t.thumbnailUrl}
                    alt={`${t.title} thumbnail`}
                    className="w-40 h-24 object-cover rounded-lg border border-slate-200"
                  />
                </div>
              )}
              {t.description && <p className="text-sm text-slate-600 mt-2">{t.description}</p>}
            </div>
              <div className="flex gap-2">
                <button className="btn btn-outline" onClick={()=>startEdit(t)}>Edit</button>
                <button className="btn btn-secondary" onClick={()=>{deleteTutorial(t._id);load();}}>Delete</button>
              </div>
            </div>
          ))}
          {!loading && !items.length && !error && (
            <div className="card p-5 text-sm text-slate-500">No tutorials added yet.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
