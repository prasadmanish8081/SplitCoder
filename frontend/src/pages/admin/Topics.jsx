import { useEffect,useState } from "react";
import { getTopics,addTopic,deleteTopic,updateTopic } from "../../services/topicApi";
import AdminLayout from "../../components/AdminLayout";

export default function Topics(){
    const[topics,setTopics] = useState([]);
    const[title,setTitle] = useState("");
    const[concept,setConcept] = useState("");
    const[explanation,setExplanation] = useState("");
    const[exampleCode1,setExampleCode1] = useState("");
    const[exampleOutput1,setExampleOutput1] = useState("");
    const[exampleCode2,setExampleCode2] = useState("");
    const[exampleOutput2,setExampleOutput2] = useState("");
    const[blocks,setBlocks] = useState([]);
    const[newBlockType,setNewBlockType] = useState("paragraph");
    const[quickTips,setQuickTips] = useState([]);
    const[commonMistakes,setCommonMistakes] = useState([]);
    const[order,setOrder] = useState("");
    const[editingId,setEditingId] = useState(null);
    const[loading,setLoading] = useState(true);
    const[error,setError] = useState("");

    useEffect(() => {
        load();
    },[]);

    const load = async() => {
        try{
            setLoading(true);
            setError("");
            const res = await getTopics();
            setTopics(res.data || []);
        }catch{
            setError("Unable to load topics.");
        }finally{
            setLoading(false);
        }
    };

    const submit = async() => {
        const payload = {
            title,
            concept,
            explanation,
            exampleCode1,
            exampleOutput1,
            exampleCode2,
            exampleOutput2,
            blocks,
            quickTips,
            commonMistakes,
            order: order === "" ? undefined : Number(order)
        };
        if(editingId){
            await updateTopic(editingId, payload);
        }else{
            await addTopic(payload);
        }
        setTitle("");
        setConcept("");
        setExplanation("");
        setExampleCode1("");
        setExampleOutput1("");
        setExampleCode2("");
        setExampleOutput2("");
        setBlocks([]);
        setNewBlockType("paragraph");
        setQuickTips([]);
        setCommonMistakes([]);
        setOrder("");
        setEditingId(null);
        load();
    };

    const startEdit = (t)=>{
        setTitle(t.title || "");
        setConcept(t.concept || "");
        setExplanation(t.explanation || "");
        setExampleCode1(t.exampleCode1 || "");
        setExampleOutput1(t.exampleOutput1 || "");
        setExampleCode2(t.exampleCode2 || "");
        setExampleOutput2(t.exampleOutput2 || "");
        setBlocks(Array.isArray(t.blocks) ? t.blocks : []);
        setNewBlockType("paragraph");
        setQuickTips(Array.isArray(t.quickTips) ? t.quickTips : []);
        setCommonMistakes(Array.isArray(t.commonMistakes) ? t.commonMistakes : []);
        setOrder(t.order ?? "");
        setEditingId(t._id);
    };

    const cancelEdit = ()=>{
        setTitle("");
        setConcept("");
        setExplanation("");
        setExampleCode1("");
        setExampleOutput1("");
        setExampleCode2("");
        setExampleOutput2("");
        setBlocks([]);
        setNewBlockType("paragraph");
        setQuickTips([]);
        setCommonMistakes([]);
        setOrder("");
        setEditingId(null);
    };

    const blockTypes = [
        { value: "title", label: "Title" },
        { value: "paragraph", label: "Paragraph" },
        { value: "important", label: "Important" },
        { value: "code", label: "Code Block" },
        { value: "output", label: "Output Box" },
        { value: "bullets", label: "Bullet Points" },
        { value: "warning", label: "Warning Box" },
        { value: "example", label: "Example Block" },
        { value: "think", label: "Think Question" },
        { value: "tip", label: "Tip / Note" },
        { value: "summary", label: "Mini Summary" },
        { value: "image", label: "Image" }
    ];

    const defaultBlockData = (type) => {
        if(type === "bullets") return { items: [""] };
        if(type === "image") return { url: "", caption: "" };
        if(type === "code") return { code: "" };
        if(type === "output") return { output: "" };
        if(type === "title") return { text: "" };
        return { text: "" };
    };

    const generateId = () => {
        if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
        return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    };

    const addBlock = () => {
        const type = newBlockType;
        const next = { id: generateId(), type, data: defaultBlockData(type) };
        setBlocks(prev => [...prev, next]);
    };

    const updateBlock = (index, patch) => {
        setBlocks(prev => prev.map((b,i) => i===index ? { ...b, ...patch } : b));
    };

    const updateBlockData = (index, patch) => {
        setBlocks(prev => prev.map((b,i) => i===index ? { ...b, data: { ...b.data, ...patch } } : b));
    };

    const setImageFromFile = (index, file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            updateBlockData(index, { url: reader.result || "" });
        };
        reader.readAsDataURL(file);
    };


    const removeBlock = (index) => {
        setBlocks(prev => prev.filter((_,i) => i!==index));
    };

    const moveBlock = (index, dir) => {
        setBlocks(prev => {
            const next = [...prev];
            const to = index + dir;
            if(to < 0 || to >= next.length) return prev;
            const temp = next[index];
            next[index] = next[to];
            next[to] = temp;
            return next;
        });
    };

    return(
        <AdminLayout>
            <div className="page-wrap max-w-5xl">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-3xl font-bold">Topics</h2>
                        <p className="text-sm text-slate-500 mt-1">Manage roadmap topics shown to students.</p>
                    </div>
                    <button className="btn btn-outline" onClick={load} disabled={loading}>Refresh</button>
                </div>

                {error && <div className="card-soft mt-6 p-4 text-sm text-red-600">{error}</div>}

                <div className="card mt-6 p-5">
                    <div className="grid md:grid-cols-2 gap-3">
                        <input className="input" value={title} placeholder="Title" onChange={e=>setTitle(e.target.value)} />
                        <input className="input" value={order} placeholder="Order (number)" onChange={e=>setOrder(e.target.value)} />
                    </div>

                    <textarea className="textarea mt-3" rows={3} value={concept} placeholder="Concept" onChange={e=>setConcept(e.target.value)} />
                    <textarea className="textarea mt-3" rows={3} value={explanation} placeholder="Explanation" onChange={e=>setExplanation(e.target.value)} />

                    <div className="mt-4 card-soft p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-xs uppercase tracking-widest text-slate-500">Block Editor</div>
                                <div className="text-sm font-semibold">Build rich content blocks</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <select className="select w-48" value={newBlockType} onChange={e=>setNewBlockType(e.target.value)}>
                                    {blockTypes.map(t=>(
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                                <button className="btn btn-outline" onClick={addBlock}>Add Block</button>
                            </div>
                        </div>

                        <div className="mt-4 grid gap-3">
                            {!blocks.length && (
                                <div className="text-sm text-slate-500">No blocks yet. Add one above.</div>
                            )}
                            {blocks.map((block, index)=>(
                                <div key={block.id || index} className="card p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="text-xs uppercase tracking-widest text-slate-500">{block.type}</div>
                                        <div className="flex items-center gap-2">
                                            <button className="btn btn-ghost" onClick={()=>moveBlock(index, -1)}>Up</button>
                                            <button className="btn btn-ghost" onClick={()=>moveBlock(index, 1)}>Down</button>
                                            <button className="btn btn-secondary" onClick={()=>removeBlock(index)}>Delete</button>
                                        </div>
                                    </div>

                                    {block.type === "title" && (
                                        <input
                                            className="input mt-3"
                                            value={block.data?.text || ""}
                                            placeholder="Title text"
                                            onChange={e=>updateBlockData(index, { text: e.target.value })}
                                        />
                                    )}

                                    {["paragraph","important","warning","example","think","tip","summary"].includes(block.type) && (
                                        <textarea
                                            className="textarea mt-3"
                                            rows={3}
                                            value={block.data?.text || ""}
                                            placeholder="Write text..."
                                            onChange={e=>updateBlockData(index, { text: e.target.value })}
                                        />
                                    )}

                                    {block.type === "code" && (
                                        <textarea
                                            className="textarea mt-3 font-mono"
                                            rows={4}
                                            value={block.data?.code || ""}
                                            placeholder="Code block"
                                            onChange={e=>updateBlockData(index, { code: e.target.value })}
                                        />
                                    )}

                                    {block.type === "output" && (
                                        <textarea
                                            className="textarea mt-3"
                                            rows={3}
                                            value={block.data?.output || ""}
                                            placeholder="Output text"
                                            onChange={e=>updateBlockData(index, { output: e.target.value })}
                                        />
                                    )}

                                    {block.type === "bullets" && (
                                        <textarea
                                            className="textarea mt-3"
                                            rows={4}
                                            value={(block.data?.items || []).join("\n")}
                                            placeholder="One bullet per line"
                                            onChange={e=>updateBlockData(index, { items: e.target.value.split("\n") })}
                                        />
                                    )}

                                    {block.type === "image" && (
                                        <div className="mt-3 grid gap-3">
                                            <div className="flex items-center gap-3">
                                                <label className="btn btn-outline cursor-pointer">
                                                    Choose Image
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={e => setImageFromFile(index, e.target.files?.[0])}
                                                    />
                                                </label>
                                                {block.data?.url && (
                                                    <span className="text-xs text-slate-500">Image selected</span>
                                                )}
                                            </div>
                                            {block.data?.url && (
                                                <div className="card-soft p-2">
                                                    <img
                                                        src={block.data.url}
                                                        alt={block.data?.title || block.data?.caption || "preview"}
                                                        className="w-full rounded-lg border border-slate-200"
                                                    />
                                                </div>
                                            )}
                                            <input
                                                className="input"
                                                value={block.data?.title || block.data?.caption || ""}
                                                placeholder="Image Title (shown above)"
                                                onChange={e=>updateBlockData(index, { title: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 grid md:grid-cols-2 gap-3">
                        <textarea className="textarea" rows={3} value={exampleCode1} placeholder="Example 1 Code" onChange={e=>setExampleCode1(e.target.value)} />
                        <textarea className="textarea" rows={3} value={exampleOutput1} placeholder="Example 1 Output" onChange={e=>setExampleOutput1(e.target.value)} />
                    </div>
                    <div className="mt-3 grid md:grid-cols-2 gap-3">
                        <textarea className="textarea" rows={3} value={exampleCode2} placeholder="Example 2 Code" onChange={e=>setExampleCode2(e.target.value)} />
                        <textarea className="textarea" rows={3} value={exampleOutput2} placeholder="Example 2 Output" onChange={e=>setExampleOutput2(e.target.value)} />
                    </div>

                    <div className="card-soft mt-4 p-4">
                        <div className="text-xs uppercase tracking-widest text-slate-500">Sidebar Data</div>
                        <div className="mt-3 grid gap-4">
                            <div>
                                <div className="text-sm font-semibold mb-2">Quick Tips</div>
                                <div className="grid gap-2">
                                    {quickTips.map((tip, index)=>(
                                        <div key={`tip-${index}`} className="flex items-center gap-2">
                                            <input
                                                className="input"
                                                value={tip}
                                                placeholder="Tip"
                                                onChange={e=>setQuickTips(prev=>prev.map((t,i)=> i===index ? e.target.value : t))}
                                            />
                                            <button className="btn btn-secondary" onClick={()=>setQuickTips(prev=>prev.filter((_,i)=>i!==index))}>Delete</button>
                                        </div>
                                    ))}
                                    <button
                                        className="btn btn-outline"
                                        disabled={quickTips.length >= 3}
                                        onClick={()=>setQuickTips(prev=> prev.length >= 3 ? prev : [...prev, ""])}
                                    >
                                        Add Tip
                                    </button>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-semibold mb-2">Common Mistakes</div>
                                <div className="grid gap-2">
                                    {commonMistakes.map((mistake, index)=>(
                                        <div key={`mistake-${index}`} className="flex items-center gap-2">
                                            <input
                                                className="input"
                                                value={mistake}
                                                placeholder="Mistake"
                                                onChange={e=>setCommonMistakes(prev=>prev.map((m,i)=> i===index ? e.target.value : m))}
                                            />
                                            <button className="btn btn-secondary" onClick={()=>setCommonMistakes(prev=>prev.filter((_,i)=>i!==index))}>Delete</button>
                                        </div>
                                    ))}
                                    <button
                                        className="btn btn-outline"
                                        disabled={commonMistakes.length >= 3}
                                        onClick={()=>setCommonMistakes(prev=> prev.length >= 3 ? prev : [...prev, ""])}
                                    >
                                        Add Mistake
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                        <button className="btn btn-primary" onClick={submit}>
                            {editingId ? "Update Topic" : "Add Topic"}
                        </button>
                        {editingId && (
                            <button className="btn btn-outline" onClick={cancelEdit}>Cancel</button>
                        )}
                    </div>
                </div>

                <div className="mt-6 grid gap-3">
                    {loading && (
                        <div className="card p-5 text-sm text-slate-500">Loading topics...</div>
                    )}
                    {!loading && topics.map(t=>(
                        <div key={t._id} className="card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <b>{t.title}</b>
                                    <span className="badge">Order {t.order ?? "-"}</span>
                                </div>
                                <p className="text-sm text-slate-600 mt-2">{t.concept}</p>
                                {t.explanation && <p className="text-xs text-slate-500 mt-1">{t.explanation}</p>}
                            </div>
                            <div className="flex gap-2">
                                <button className="btn btn-outline" onClick={()=>startEdit(t)}>Edit</button>
                                <button className="btn btn-secondary" onClick={()=>{deleteTopic(t._id);load();}}>Delete</button>
                            </div>
                        </div>
                    ))}
                    {!loading && !topics.length && !error && (
                        <div className="card p-5 text-sm text-slate-500">No topics created yet.</div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
