import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  ChartColumnBig,
  CheckCircle2,
  ChevronRight,
  Code2,
  Compass,
  Cpu,
  Globe,
  LockKeyhole,
  Menu,
  MessageSquareMore,
  MonitorSmartphone,
  Play,
  Rocket,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  SquareTerminal,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";

const Motion = motion;

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Why Us", href: "#why" },
  { label: "Stats", href: "#stats" },
  { label: "Process", href: "#process" },
  { label: "Stories", href: "#testimonials" },
];

const features = [
  {
    icon: <Users className="h-5 w-5" />,
    title: "Real-Time Collaboration",
    text: "Code simultaneously with your team members without delays.",
  },
  {
    icon: <Code2 className="h-5 w-5" />,
    title: "Smart Live Editor",
    text: "Fast, responsive and developer-friendly code editing experience.",
  },
  {
    icon: <Bot className="h-5 w-5" />,
    title: "AI Coding Assistant",
    text: "Get intelligent coding suggestions and faster debugging.",
  },
  {
    icon: <Compass className="h-5 w-5" />,
    title: "Team Workspaces",
    text: "Manage projects, tasks, and team communication in one place.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Secure Authentication",
    text: "Enterprise-grade authentication and secure access control.",
  },
  {
    icon: <Share2 className="h-5 w-5" />,
    title: "Instant Project Sharing",
    text: "Share coding projects instantly with developers worldwide.",
  },
];

const stats = [
  { value: 15000, suffix: "+", label: "Active Developers" },
  { value: 2000, suffix: "+", label: "Projects Created" },
  { value: 120, suffix: "+", label: "Coding Teams" },
  { value: 99.99, suffix: "%", label: "Server Uptime" },
];

const steps = [
  {
    title: "Create Your Workspace",
    text: "Set up your coding environment instantly.",
  },
  {
    title: "Invite Your Team",
    text: "Collaborate with friends or developers in real-time.",
  },
  {
    title: "Build Amazing Projects",
    text: "Code, share, and deploy faster together.",
  },
];

const testimonials = [
  {
    quote: "SplitCoder completely changed the way our team collaborates.",
    name: "Aanya Mehta",
    role: "Frontend Lead, NovaLabs",
    accent: "from-cyan-400 to-blue-500",
    colors: ["#6568F6", "#9BA0FF", "#ffffff"],
  },
  {
    quote: "The live collaboration experience feels incredibly smooth.",
    name: "Marcus Lee",
    role: "Full-Stack Engineer, Vertex",
    accent: "from-violet-400 to-indigo-500",
    colors: ["#7C83FF", "#6568F6", "#ffffff"],
  },
  {
    quote: "Perfect platform for coding teams and students.",
    name: "Sara Khan",
    role: "CS Student, CodeBridge",
    accent: "from-sky-400 to-cyan-500",
    colors: ["#64C2FF", "#6568F6", "#ffffff"],
  },
];

const typingPhrases = [
  "Real-time collaboration.",
  "Modern AI assistance.",
  "Premium team workflows.",
  "Faster shipping.",
];

const createAvatar = (name, colors) => {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" fill="none">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="100%" stop-color="${colors[1]}" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="32" fill="url(#g)" />
      <circle cx="64" cy="53" r="24" fill="rgba(255,255,255,0.94)" />
      <path d="M28 108c5-19 21-30 36-30s31 11 36 30" fill="rgba(255,255,255,0.94)" />
      <text x="64" y="72" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="${colors[1]}">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

function CountUp({ end, suffix = "", duration = 1.8 }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let started = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;

      if (prefersReducedMotion) {
        setValue(end);
        return;
      }

      const startTime = performance.now();
      const animate = (now) => {
        const progress = Math.min((now - startTime) / (duration * 1000), 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(end * eased);
        if (progress < 1) requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    }, { threshold: 0.5 });

    observer.observe(node);
    return () => observer.disconnect();
  }, [duration, end, prefersReducedMotion]);

  const formatted = Number.isInteger(end) ? Math.round(value).toLocaleString() : value.toFixed(2);

  return (
    <span ref={ref} className="tabular-nums">
      {formatted}
      {suffix}
    </span>
  );
}

function SectionHeading({ eyebrow, title, subtitle, align = "center" }) {
  return (
    <div className={`mx-auto max-w-3xl ${align === "left" ? "text-left" : "text-center"}`}>
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-[0_10px_30px_rgba(101,104,246,0.08)] backdrop-blur-xl">
        <Sparkles className="h-3.5 w-3.5 text-[#6568F6]" />
        {eyebrow}
      </div>
      <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 md:text-5xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">{subtitle}</p>
    </div>
  );
}

function BlurBlob({ className }) {
  return <div className={`pointer-events-none absolute rounded-full blur-3xl opacity-70 ${className}`} />;
}

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [mouse, setMouse] = useState({ x: 50, y: 30 });
  const [typingIndex, setTypingIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const sectionIds = useMemo(() => navItems.map((item) => item.href.slice(1)), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) setActiveSection(visible.target.id);
      },
      { threshold: [0.18, 0.32, 0.5], rootMargin: "-18% 0px -60% 0px" },
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  useEffect(() => {
    const phrase = typingPhrases[typingIndex];
    const delay = isDeleting ? 38 : 68;

    const timer = window.setTimeout(() => {
      if (!isDeleting) {
        const next = phrase.slice(0, typedText.length + 1);
        setTypedText(next);
        if (next === phrase) {
          window.setTimeout(() => setIsDeleting(true), 900);
        }
      } else {
        const next = phrase.slice(0, typedText.length - 1);
        setTypedText(next);
        if (next === "") {
          setIsDeleting(false);
          setTypingIndex((index) => (index + 1) % typingPhrases.length);
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isDeleting, typingIndex, typedText.length]);

  useEffect(() => {
    const onMove = (event) => {
      setMouse({
        x: (event.clientX / window.innerWidth) * 100,
        y: (event.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const floatingVariants = {
    float: {
      y: [0, -10, 0],
      x: [0, 6, 0],
      rotate: [0, 1.5, 0],
      transition: { duration: 7, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const pulseVariants = {
    float: {
      y: [0, -14, 0],
      transition: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <div
      id="home"
      className="relative overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(101,104,246,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(101,104,246,0.12),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8faff_42%,#ffffff_100%)] text-slate-950"
      onMouseMove={(event) => {
        setMouse({
          x: (event.clientX / window.innerWidth) * 100,
          y: (event.clientY / window.innerHeight) * 100,
        });
      }}
    >
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-70"
        style={{
          background: `radial-gradient(700px circle at ${mouse.x}% ${mouse.y}%, rgba(101,104,246,0.16), transparent 40%)`,
        }}
      />

      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(rgba(101,104,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(101,104,246,0.05)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-60 [background-image:radial-gradient(circle,rgba(101,104,246,0.22)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.75),transparent_88%)]" />

      <BlurBlob className="left-[-6rem] top-[8rem] h-72 w-72 bg-[#6568F6]/25" />
      <BlurBlob className="right-[-4rem] top-[16rem] h-80 w-80 bg-sky-300/30" />
      <BlurBlob className="bottom-[10rem] left-[20%] h-64 w-64 bg-indigo-300/25" />

      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
        <div
          className={`mx-auto max-w-7xl rounded-[1.6rem] border px-4 py-3 shadow-[0_24px_80px_rgba(15,23,42,0.09)] backdrop-blur-2xl transition-all duration-300 ${
            scrolled ? "border-white/35 bg-white/85 shadow-[0_28px_90px_rgba(15,23,42,0.13)]" : "border-white/30 bg-white/70"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <a href="#home" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#6568F6_0%,#8F92FF_52%,#C1C4FF_100%)] text-white shadow-[0_18px_40px_rgba(101,104,246,0.32)]">
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold tracking-[-0.03em] text-slate-950">SplitCoder</div>
                <div className="text-xs text-slate-500">Collaborative coding reimagined</div>
              </div>
            </a>

            <nav className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-white/70 px-2 py-2 lg:flex">
              {navItems.map((item) => {
                const isActive = activeSection === item.href.slice(1);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      isActive ? "bg-[#6568F6] text-white shadow-[0_12px_28px_rgba(101,104,246,0.32)]" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              <a href="#features" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950">
                Explore
              </a>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-[#6568F6] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_20px_45px_rgba(101,104,246,0.34)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_55px_rgba(101,104,246,0.42)]"
              >
                Start Coding Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 text-slate-900 shadow-sm lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {mobileOpen && (
            <Motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-[1.4rem] border border-slate-200 bg-white/90 p-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#6568F6]/30 hover:bg-[#6568F6]/6 hover:text-slate-950"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <div className="mt-3 flex gap-3">
                <Link to="/login" className="flex-1 rounded-2xl bg-[#6568F6] px-4 py-3 text-center text-sm font-semibold text-white">
                  Start Coding Free
                </Link>
                <a href="#testimonials" className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700">
                  Watch Demo
                </a>
              </div>
            </Motion.div>
          )}
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-4 pb-18 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <Motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.2, 0.65, 0.2, 1] }}
              className="max-w-2xl"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#6568F6]/20 bg-white/80 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-slate-600 shadow-[0_12px_35px_rgba(101,104,246,0.08)] backdrop-blur-xl">
                <Rocket className="h-3.5 w-3.5 text-[#6568F6]" />
                Next Generation Collaborative Coding Platform
              </div>

              <h1 className="max-w-3xl text-5xl font-semibold leading-[0.94] tracking-[-0.06em] text-slate-950 sm:text-6xl lg:text-[5.4rem]">
                Build, Learn &amp; <span className="bg-[linear-gradient(135deg,#6568F6_0%,#989AFD_38%,#6568F6_100%)] bg-clip-text text-transparent">Code Together</span> Without Limits
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                SplitCoder helps developers and students collaborate in real-time, manage coding projects, share ideas, and learn faster with an advanced collaborative workspace.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  to="/login"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#6568F6_0%,#7D80FB_52%,#5A5DF3_100%)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_22px_60px_rgba(101,104,246,0.36)] transition hover:-translate-y-1 hover:shadow-[0_28px_72px_rgba(101,104,246,0.45)]"
                >
                  Start Coding Free
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#testimonials"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#6568F6]/30 hover:text-slate-950"
                >
                  <Play className="h-4 w-4 text-[#6568F6]" />
                  Watch Demo
                </a>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#6568F6]" />
                  No credit card required
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#6568F6]" />
                  Trusted by developers worldwide
                </span>
              </div>

              <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/75 px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <span className="inline-flex h-9 items-center rounded-full bg-[#6568F6] px-3 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-[0_16px_32px_rgba(101,104,246,0.3)]">
                  Live
                </span>
                <span className="text-sm text-slate-600">
                  {typedText}
                  <span className="ml-0.5 animate-pulse text-[#6568F6]">|</span>
                </span>
              </div>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.95, ease: [0.2, 0.65, 0.2, 1], delay: 0.1 }}
              className="relative mx-auto w-full max-w-[660px]"
            >
              <Motion.div
                variants={pulseVariants}
                animate="float"
                className="absolute -left-8 top-10 hidden rounded-2xl border border-white/35 bg-white/70 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.1)] backdrop-blur-xl lg:block"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Live Sync</div>
                    <div className="text-sm font-semibold text-slate-950">12 collaborators online</div>
                  </div>
                </div>
              </Motion.div>

              <Motion.div
                variants={pulseVariants}
                animate="float"
                className="absolute -right-6 top-4 hidden w-60 rounded-[1.6rem] border border-white/40 bg-white/80 p-4 shadow-[0_18px_45px_rgba(101,104,246,0.14)] backdrop-blur-2xl lg:block"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">AI Assistant</div>
                    <div className="mt-1 text-sm font-semibold text-slate-950">Refactor suggestion ready</div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#6568F6_0%,#8F92FF_100%)] text-white">
                    <BrainCircuit className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Split your utility into hooks for cleaner state control and smoother rendering.
                </p>
              </Motion.div>

              <div className="relative rounded-[2rem] border border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(250,250,255,0.82))] p-4 shadow-[0_30px_120px_rgba(15,23,42,0.14)] backdrop-blur-2xl sm:p-5">
                <div className="absolute inset-x-7 top-7 h-24 rounded-full bg-[#6568F6]/12 blur-3xl" />
                <div className="relative overflow-hidden rounded-[1.55rem] border border-slate-200 bg-[linear-gradient(180deg,#0f172a_0%,#0b1020_100%)] text-white shadow-[0_28px_90px_rgba(15,23,42,0.38)]">
                  <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-red-400" />
                      <span className="h-3 w-3 rounded-full bg-amber-400" />
                      <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                      SplitCoder Studio
                    </div>
                  </div>

                  <div className="grid gap-4 p-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-4">
                      <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.2)]">
                        <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                          <span>live-editor.tsx</span>
                          <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-300">Synced 1s ago</span>
                        </div>
                        <div className="space-y-2 font-mono text-[13px] leading-6 text-slate-200">
                          <div>
                            <span className="text-violet-300">function</span> <span className="text-cyan-300">ship</span>() {"{"}
                          </div>
                          <div className="pl-4">
                            return <span className="text-emerald-300">&lt;team&gt;Ship faster&lt;/team&gt;</span>;
                          </div>
                          <div>{"}"}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Motion.div variants={floatingVariants} animate="float" className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Terminal</span>
                            <SquareTerminal className="h-4 w-4 text-cyan-300" />
                          </div>
                          <pre className="mt-3 overflow-hidden text-[12px] leading-6 text-slate-200">$ npm run dev{"\n"}➜ ready in 0.3s</pre>
                        </Motion.div>

                        <Motion.div variants={floatingVariants} animate="float" className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Analytics</span>
                            <ChartColumnBig className="h-4 w-4 text-violet-300" />
                          </div>
                          <div className="mt-3 flex items-end gap-2">
                            {[34, 52, 42, 72, 58].map((bar, index) => (
                              <div
                                key={bar}
                                className="flex-1 rounded-t-xl bg-[linear-gradient(180deg,#A7AAFF_0%,#6568F6_100%)]"
                                style={{ height: `${bar + index * 4}px` }}
                              />
                            ))}
                          </div>
                        </Motion.div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Team Members</div>
                            <div className="mt-1 text-sm font-semibold text-white">Online now</div>
                          </div>
                          <div className="flex -space-x-2">
                            {["A", "M", "S", "J"].map((initial, index) => (
                              <div
                                key={initial}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[linear-gradient(135deg,#6568F6_0%,#8F92FF_100%)] text-xs font-semibold text-white shadow-[0_8px_18px_rgba(101,104,246,0.3)]"
                                style={{ transform: `translateY(${index % 2 === 0 ? 0 : 2}px)` }}
                              >
                                {initial}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 space-y-3">
                          {[
                            ["Aanya", "Editing auth flow"],
                            ["Marcus", "Reviewing merge request"],
                            ["Sara", "Testing terminal commands"],
                          ].map(([name, activity]) => (
                            <div key={name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
                              <div>
                                <div className="text-sm font-semibold text-white">{name}</div>
                                <div className="text-xs text-slate-400">{activity}</div>
                              </div>
                              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.7)]" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Motion.div variants={floatingVariants} animate="float" className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-white">
                            <LockKeyhole className="h-4 w-4 text-cyan-300" />
                            Secure sharing
                          </div>
                          <p className="mt-2 text-xs leading-5 text-slate-400">Invite via encrypted team links and access controls.</p>
                        </Motion.div>
                        <Motion.div variants={floatingVariants} animate="float" className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-white">
                            <MonitorSmartphone className="h-4 w-4 text-violet-300" />
                            Responsive view
                          </div>
                          <p className="mt-2 text-xs leading-5 text-slate-400">Built for desktop, tablet, and mobile collaboration.</p>
                        </Motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Motion.div
                variants={pulseVariants}
                animate="float"
                className="absolute -bottom-6 left-8 hidden rounded-[1.3rem] border border-white/40 bg-white/80 p-4 shadow-[0_18px_42px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:block"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6568F6]/12 text-[#6568F6]">
                    <MessageSquareMore className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Code Sharing</div>
                    <div className="text-sm font-semibold text-slate-950">2 comments resolved</div>
                  </div>
                </div>
              </Motion.div>
            </Motion.div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeading
            eyebrow="Features"
            title="Everything You Need To Build Together"
            subtitle="Powerful collaboration tools designed for modern developers and coding teams."
          />

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => (
              <Motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, delay: index * 0.04 }}
                className="group relative overflow-hidden rounded-[1.6rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(101,104,246,0.16)]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(101,104,246,0.65),transparent)] opacity-70" />
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(101,104,246,0.14),rgba(101,104,246,0.06))] text-[#6568F6] ring-1 ring-[#6568F6]/15 transition group-hover:scale-105 group-hover:ring-[#6568F6]/30">
                  {feature.icon}
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-slate-950">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.text}</p>
                <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#6568F6]">
                  Learn more
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Motion.article>
            ))}
          </div>
        </section>

        <section id="why" className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-8 rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,248,255,0.95))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl lg:grid-cols-[0.95fr_1.05fr] lg:p-8">
            <Motion.div initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <SectionHeading
                align="left"
                eyebrow="Why SplitCoder"
                title="Why Developers Love SplitCoder"
                subtitle="SplitCoder combines collaboration, productivity, and modern developer experience into one powerful platform. Whether you are a student, freelancer, or software team, SplitCoder helps you code smarter and faster."
              />

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  ["Modern dashboard preview", <MonitorSmartphone className="h-4 w-4" />],
                  ["Floating UI cards", <Sparkles className="h-4 w-4" />],
                  ["Graphs and analytics", <TrendingUp className="h-4 w-4" />],
                  ["Team activity panel", <Users className="h-4 w-4" />],
                ].map(([label, icon]) => (
                  <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6568F6]/10 text-[#6568F6]">{icon}</div>
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                  </div>
                ))}
              </div>
            </Motion.div>

            <Motion.div initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[1.8rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.1)] backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Project Activity</div>
                      <div className="mt-1 text-lg font-semibold text-slate-950">Weekly collaboration score</div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6568F6]/10 text-[#6568F6]">
                      <ChartColumnBig className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-6 flex h-44 items-end gap-3 rounded-[1.4rem] bg-[linear-gradient(180deg,rgba(101,104,246,0.08),rgba(101,104,246,0.02))] p-4">
                    {[40, 58, 36, 72, 64, 84].map((height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t-2xl bg-[linear-gradient(180deg,#B8BAFF_0%,#6568F6_100%)] shadow-[0_14px_24px_rgba(101,104,246,0.22)]"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[1.8rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.1)] backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6568F6]/10 text-[#6568F6]">
                        <Cpu className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-950">Live deployment checks</div>
                        <div className="text-sm text-slate-500">Automated and instant</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.8rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.1)] backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6568F6]/10 text-[#6568F6]">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-950">Distributed access</div>
                        <div className="text-sm text-slate-500">Global performance optimized</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.8rem] border border-white/70 bg-[linear-gradient(135deg,rgba(101,104,246,0.08),rgba(255,255,255,0.8))] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.1)] backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6568F6] text-white shadow-[0_16px_30px_rgba(101,104,246,0.35)]">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-950">Deploy in seconds</div>
                        <div className="text-sm text-slate-500">Premium workflow designed for speed</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Motion.div>
          </div>
        </section>

        <section id="stats" className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeading
            eyebrow="Statistics"
            title="Growth That Speaks For Itself"
            subtitle="Premium glassmorphism cards with subtle hover glow effects and animated counters."
          />

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <Motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="group rounded-[1.6rem] border border-white/70 bg-white/80 p-6 text-center shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition hover:-translate-y-1 hover:shadow-[0_26px_80px_rgba(101,104,246,0.18)]"
              >
                <div className="text-4xl font-semibold tracking-[-0.05em] text-slate-950">
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-3 text-sm font-medium uppercase tracking-[0.18em] text-slate-500">{stat.label}</div>
              </Motion.div>
            ))}
          </div>
        </section>

        <section id="process" className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeading
            eyebrow="How It Works"
            title="Get Started In Minutes"
            subtitle="A connected animated timeline makes onboarding feel simple, clear, and premium."
          />

          <div className="mt-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="relative rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <div className="absolute left-10 top-12 bottom-12 w-px bg-[linear-gradient(180deg,rgba(101,104,246,0.1),rgba(101,104,246,0.6),rgba(101,104,246,0.1))]" />
              <div className="space-y-8">
                {steps.map((step, index) => (
                  <div key={step.title} className="relative flex gap-5">
                    <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#6568F6_0%,#8F92FF_100%)] text-white shadow-[0_16px_36px_rgba(101,104,246,0.32)]">
                      0{index + 1}
                    </div>
                    <div className="pt-1">
                      <h3 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">{step.title}</h3>
                      <p className="mt-2 max-w-md text-sm leading-7 text-slate-600">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["Create", <Sparkles className="h-4 w-4" />],
                ["Invite", <Users className="h-4 w-4" />],
                ["Ship", <ArrowRight className="h-4 w-4" />],
              ].map(([title, icon], index) => (
                <Motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                  className="rounded-[1.5rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,255,0.92))] p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6568F6]/10 text-[#6568F6]">{icon}</div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{steps[index].text}</p>
                </Motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeading
            eyebrow="Testimonials"
            title="What Developers Say"
            subtitle="Three premium testimonial cards with glowing hover effects and polished profile imagery."
          />

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Motion.article
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, delay: index * 0.06 }}
                className="group rounded-[1.7rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_28px_75px_rgba(101,104,246,0.18)]"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={createAvatar(testimonial.name, testimonial.colors)}
                    alt={testimonial.name}
                    className="h-16 w-16 rounded-2xl object-cover shadow-[0_16px_30px_rgba(101,104,246,0.25)] ring-1 ring-[#6568F6]/15"
                  />
                  <div>
                    <div className="text-base font-semibold text-slate-950">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                    <div className="mt-2 flex items-center gap-1 text-[#6568F6]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-7 text-slate-600">“{testimonial.quote}”</p>
                <div className={`mt-5 h-px w-full bg-gradient-to-r ${testimonial.accent} opacity-40`} />
              </Motion.article>
            ))}
          </div>
        </section>

        <section id="cta" className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
          <Motion.div
            initial={{ opacity: 0, scale: 0.98, y: 22 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65 }}
            className="relative overflow-hidden rounded-[2.2rem] border border-[#6568F6]/20 bg-[linear-gradient(135deg,#6568F6_0%,#7A7DF9_45%,#A7AAFF_100%)] px-6 py-12 text-white shadow-[0_30px_110px_rgba(101,104,246,0.38)] sm:px-10 lg:px-14"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_30%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur-xl">
                  <Sparkles className="h-3.5 w-3.5" />
                  Premium collaboration experience
                </div>
                <h2 className="mt-6 max-w-2xl text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">Ready To Transform The Way You Code?</h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
                  Join thousands of developers already building with SplitCoder.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <a href="#home" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-[#5f64f6] shadow-[0_20px_50px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5">
                  Get Started Now
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#features" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/15">
                  Explore Platform
                </a>
              </div>
            </div>
          </Motion.div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-slate-200/70 bg-white/75 px-4 py-14 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr_0.9fr_1.1fr]">
          <div>
            <a href="#home" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#6568F6_0%,#8F92FF_100%)] text-white shadow-[0_18px_40px_rgba(101,104,246,0.32)]">
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-950">SplitCoder</div>
                <div className="text-xs text-slate-500">Build together, ship faster</div>
              </div>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
              A premium collaborative coding platform for teams, students, and ambitious builders.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Quick Links</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {navItems.slice(1).map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="transition hover:text-slate-950">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>support@splitcoder.dev</li>
              <li>Discord Community</li>
              <li>GitHub Repository</li>
            </ul>
            <div className="mt-5 flex items-center gap-3">
              {[Code2, MessageSquareMore, Globe].map((Icon, index) => (
                <a
                  key={index}
                  href="#home"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-[#6568F6]/30 hover:text-[#6568F6]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Newsletter</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">Get product updates, launch news, and collaboration tips.</p>
            <form className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#6568F6]/40 focus:ring-4 focus:ring-[#6568F6]/10"
              />
              <button type="button" className="inline-flex items-center justify-center rounded-2xl bg-[#6568F6] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(101,104,246,0.3)]">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-slate-200/70 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>© 2026 SplitCoder. All rights reserved.</div>
          <div className="flex flex-wrap gap-4">
            <a href="#home" className="transition hover:text-slate-950">
              Privacy
            </a>
            <a href="#home" className="transition hover:text-slate-950">
              Terms
            </a>
            <a href="#home" className="transition hover:text-slate-950">
              Security
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
