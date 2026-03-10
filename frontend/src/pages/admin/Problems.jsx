import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getTopics } from "../../services/topicApi";
import { getProblems, addProblem, updateProblem, deleteProblem } from "../../services/problemApi";

export default function Problems() {
    const [topics, setTopics] = useState([]);
    const [selectedTopicId, setSelectedTopicId] = useState("");
    const [problems, setProblems] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [title, setTitle] = useState("");
    const [statement, setStatement] = useState("");
    const [expectedOutput, setExpectedOutput] = useState("");
    const [hint, setHint] = useState("");
    const [solution, setSolution] = useState("");
    const [hiddenTestcases, setHiddenTestcases] = useState("");
    const [hiddenPairs, setHiddenPairs] = useState([]);
    const [sampleInput, setSampleInput] = useState("");
    const [sampleOutput, setSampleOutput] = useState("");
    const [rulesConstraints, setRulesConstraints] = useState("");
    const [difficulty, setDifficulty] = useState("easy");

    useEffect(() => {
        loadTopics();
    }, []);

    useEffect(() => {
        if (selectedTopicId) loadProblems(selectedTopicId);
        else setProblems([]);
    }, [selectedTopicId]);

    const loadTopics = async () => {
        try{
            setLoading(true);
            setError("");
            const res = await getTopics();
            setTopics(res.data || []);
            if (res.data.length && !selectedTopicId) {
                setSelectedTopicId(res.data[0]._id);
            }
        }catch{
            setError("Unable to load topics.");
        }finally{
            setLoading(false);
        }
    };

    const loadProblems = async (topicId) => {
        const res = await getProblems(topicId);
        setProblems(res.data || []);
    };

    const resetForm = () => {
        setTitle("");
        setStatement("");
        setExpectedOutput("");
        setHiddenTestcases("");
        setHiddenPairs([]);
        setSampleInput("");
        setSampleOutput("");
        setRulesConstraints("");
        setHint("");
        setSolution("");
        setDifficulty("easy");
        setEditingId(null);
    };

    const startEdit = (p) => {
        setTitle(p.title || "");
        setStatement(p.statement || "");
        setExpectedOutput(p.expectedOutput || "");
        setHint(p.hint || "");
        setSolution(p.solution || "");
        setHiddenTestcases(p.hiddenTestcases || "");
        try{
            const parsed = JSON.parse(p.hiddenTestcases || "[]");
            setHiddenPairs(Array.isArray(parsed) ? parsed : []);
        }catch{
            setHiddenPairs([]);
        }
        setSampleInput(p.sampleInput || "");
        setSampleOutput(p.sampleOutput || "");
        setRulesConstraints(p.rulesConstraints || "");
        setDifficulty(p.difficulty || "easy");
        setEditingId(p._id);
    };

    const submit = async () => {
        if (!selectedTopicId) return;

        const payload = {
            topicId: selectedTopicId,
            title,
            statement,
            expectedOutput,
            hiddenTestcases: JSON.stringify(hiddenPairs),
            sampleInput,
            sampleOutput,
            rulesConstraints,
            hint,
            solution,
            difficulty
        };

        if (editingId) {
            await updateProblem(editingId, payload);
        } else {
            await addProblem(payload);
        }

        resetForm();
        loadProblems(selectedTopicId);
    };

    return (
        <AdminLayout>
            <div className="page-wrap max-w-6xl">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-3xl font-bold">Problems</h2>
                        <p className="text-sm text-slate-500 mt-1">Create and manage practice problems.</p>
                    </div>
                    <button className="btn btn-outline" onClick={loadTopics} disabled={loading}>Refresh</button>
                </div>

                {error && <div className="card-soft mt-6 p-4 text-sm text-red-600">{error}</div>}

                <div className="card mt-6 p-5">
                    <div className="mb-4">
                        <label className="block text-sm mb-1">Topic</label>
                        <select
                            className="select"
                            value={selectedTopicId}
                            onChange={(e) => setSelectedTopicId(e.target.value)}
                        >
                            {topics.map((t) => (
                                <option key={t._id} value={t._id}>{t.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                        <input className="input" value={title} placeholder="Problem Title" onChange={e => setTitle(e.target.value)} />
                        <input className="input" value={expectedOutput} placeholder="Expected Output" onChange={e => setExpectedOutput(e.target.value)} />
                    </div>

                    <textarea className="textarea mt-3" rows={3} value={statement} placeholder="Problem Statement" onChange={e => setStatement(e.target.value)} />
                    <textarea className="textarea mt-3" rows={2} value={rulesConstraints} placeholder="Rules and Constraints" onChange={e => setRulesConstraints(e.target.value)} />
                    <div className="card-soft mt-3 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs uppercase tracking-widest text-slate-500">Hidden Testcases</div>
                                <div className="text-sm font-semibold">Input/Output pairs</div>
                            </div>
                            <button
                                className="btn btn-outline"
                                onClick={() => setHiddenPairs(prev => [...prev, { input: "", output: "" }])}
                            >
                                Add Testcase
                            </button>
                        </div>
                        <div className="mt-3 grid gap-3">
                            {!hiddenPairs.length && (
                                <div className="text-sm text-slate-500">No hidden testcases added.</div>
                            )}
                            {hiddenPairs.map((tc, index)=>(
                                <div key={index} className="card p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs uppercase tracking-widest text-slate-500">Case {index+1}</div>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => setHiddenPairs(prev => prev.filter((_,i)=>i!==index))}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    <div className="mt-3 grid md:grid-cols-2 gap-3">
                                        <textarea
                                            className="textarea"
                                            rows={3}
                                            placeholder="Input"
                                            value={tc.input || ""}
                                            onChange={e => setHiddenPairs(prev => prev.map((item,i)=> i===index ? { ...item, input: e.target.value } : item))}
                                        />
                                        <textarea
                                            className="textarea"
                                            rows={3}
                                            placeholder="Output"
                                            value={tc.output || ""}
                                            onChange={e => setHiddenPairs(prev => prev.map((item,i)=> i===index ? { ...item, output: e.target.value } : item))}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <textarea className="textarea mt-3" rows={2} value={hint} placeholder="Hint (shown when logic is wrong)" onChange={e => setHint(e.target.value)} />
                    <textarea className="textarea mt-3" rows={2} value={solution} placeholder="Solution (shown after hint unlock)" onChange={e => setSolution(e.target.value)} />

                    <div className="mt-3">
                        <label className="block text-sm mb-1">Difficulty</label>
                        <select className="select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 mt-3">
                        <textarea className="textarea" rows={2} value={sampleInput} placeholder="Sample Input" onChange={e => setSampleInput(e.target.value)} />
                        <textarea className="textarea" rows={2} value={sampleOutput} placeholder="Sample Output" onChange={e => setSampleOutput(e.target.value)} />
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button className="btn btn-primary" onClick={submit}>
                            {editingId ? "Update Problem" : "Add Problem"}
                        </button>
                        {editingId && (
                            <button className="btn btn-outline" onClick={resetForm}>Cancel</button>
                        )}
                    </div>
                </div>

                <div className="mt-6 grid gap-3">
                    {loading && (
                        <div className="card p-5 text-sm text-slate-500">Loading problems...</div>
                    )}
                    {!loading && problems.map((p) => (
                        <div key={p._id} className="card p-4">
                            <div className="flex justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <b>{p.title}</b>
                                    <span className="badge">{p.difficulty || "easy"}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="btn btn-outline" onClick={() => startEdit(p)}>Edit</button>
                                    <button className="btn btn-secondary" onClick={() => { deleteProblem(p._id); loadProblems(selectedTopicId); }}>Delete</button>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 mt-2">{p.statement}</p>
                        </div>
                    ))}
                    {!loading && !problems.length && !error && (
                        <div className="card p-5 text-sm text-slate-500">No problems created yet.</div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
