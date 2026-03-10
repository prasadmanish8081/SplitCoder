import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home(){
    const navigate = useNavigate();

    useEffect(()=>{
        const nodes = document.querySelectorAll("[data-reveal]");
        const io = new IntersectionObserver((entries)=>{
            entries.forEach(entry=>{
                if(entry.isIntersecting) entry.target.classList.add("in-view");
            });
        }, { threshold: 0.2 });
        nodes.forEach(n=>io.observe(n));
        return ()=>io.disconnect();
    },[]);

    return(
        <div className="page-shell relative overflow-hidden text-slate-900">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(15,118,110,0.18),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.18),transparent_40%)]" />
            <div className="relative z-10 page-wrap pt-24 pb-16">
                <div className="max-w-3xl reveal" data-reveal>
                    <div className="pill mb-4">
                        Python Learning System
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                        Master Python with structured practice and real feedback.
                    </h1>
                    <p className="mt-4 text-lg text-slate-700 max-w-2xl">
                        Learn concepts, solve problems, unlock topics, and track your progress.
                        Designed to teach the right way, step by step.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            className="btn btn-primary"
                            onClick={()=>navigate("/login")}
                        >
                            Start Learning
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={()=>navigate("/register")}
                        >
                            Create Account
                        </button>
                    </div>
                </div>

                <div className="mt-16 grid md:grid-cols-3 gap-4 reveal" data-reveal>
                    <div className="card p-5 glow-card">
                        <div className="text-sm text-emerald-700 font-semibold">Guided Concepts</div>
                        <div className="mt-2 text-lg font-semibold">Learn in the right order</div>
                        <p className="text-sm text-slate-600 mt-2">
                            Each topic builds on the previous, so you never feel lost.
                        </p>
                    </div>
                    <div className="card p-5 glow-card">
                        <div className="text-sm text-emerald-700 font-semibold">Practice Problems</div>
                        <div className="mt-2 text-lg font-semibold">Immediate feedback</div>
                        <p className="text-sm text-slate-600 mt-2">
                            Run code, fix errors, and unlock hints with real explanations.
                        </p>
                    </div>
                    <div className="card p-5 glow-card">
                        <div className="text-sm text-emerald-700 font-semibold">Progress Tracking</div>
                        <div className="mt-2 text-lg font-semibold">See what's done</div>
                        <p className="text-sm text-slate-600 mt-2">
                            Topics, problems, and roadmap completion in one place.
                        </p>
                    </div>
                </div>

                <div className="mt-16 border-t border-slate-200 pt-8 reveal" data-reveal>
                    <div className="flex flex-wrap items-center justify-between text-sm text-slate-500 gap-2">
                        <span>Built for focused Python mastery</span>
                        <span>(c) 2026</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
