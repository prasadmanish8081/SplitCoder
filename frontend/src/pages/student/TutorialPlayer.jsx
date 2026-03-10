import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import StudentHeader from "../../components/StudentHeader";
import { getTutorials } from "../../services/tutorialApi";
import { getTutorialProgress, updateTutorialProgress } from "../../services/tutorialProgressApi";
import { runPython } from "../../services/pythonApi";

const parseIframeSrc = (value = "") => {
  const match = value.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : value;
};

const getYoutubeId = (rawValue = "") => {
  const value = parseIframeSrc(String(rawValue || "").trim());
  if (!value) return "";

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const id = url.pathname.replace(/^\/+/, "").split("/")[0];
      return /^[0-9A-Za-z_-]{11}$/.test(id) ? id : "";
    }

    const isYoutubeHost = host.includes("youtube.com") || host.includes("youtube-nocookie.com");
    if (!isYoutubeHost) return "";

    const byQuery = url.searchParams.get("v") || url.searchParams.get("vi");
    if (byQuery && /^[0-9A-Za-z_-]{11}$/.test(byQuery)) return byQuery;

    const parts = url.pathname.split("/").filter(Boolean);
    const markerIdx = parts.findIndex((p) => ["embed", "shorts", "live", "v"].includes(p));
    if (markerIdx !== -1) {
      const id = parts[markerIdx + 1] || "";
      return /^[0-9A-Za-z_-]{11}$/.test(id) ? id : "";
    }

    const fallback = value.match(/([0-9A-Za-z_-]{11})/);
    return fallback ? fallback[1] : "";
  } catch {
    const fallback = value.match(/([0-9A-Za-z_-]{11})/);
    return fallback ? fallback[1] : "";
  }
};

const isYoutubeUrl = (url = "") => Boolean(getYoutubeId(url));

export default function TutorialPlayer(){
  const { tutorialId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const notesRef = useRef(null);
  const gridRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const ytTimerRef = useRef(null);
  const ytReadyRef = useRef(false);
  const progressRef = useRef({});

  const [tutorials, setTutorials] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [ytError, setYtError] = useState("");

  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [panelTab, setPanelTab] = useState("editor");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScoreLocal, setQuizScoreLocal] = useState(0);
  const [selectedProblemId, setSelectedProblemId] = useState("");
  const [problemCode, setProblemCode] = useState("");
  const [problemOutput, setProblemOutput] = useState("");
  const [problemRunning, setProblemRunning] = useState(false);
  const [problemStatus, setProblemStatus] = useState("");
  const [problemMessage, setProblemMessage] = useState("");
  const [showProblemDetailMobile, setShowProblemDetailMobile] = useState(false);
  const [showProblemDetail, setShowProblemDetail] = useState(false);
  const notesOpen = panelTab === "notes";
  const [notesTitle, setNotesTitle] = useState("");
  const [notesText, setNotesText] = useState("");
  const [screenshots, setScreenshots] = useState([]);
  const [hasSelection, setHasSelection] = useState(false);
  const [notesStyle, setNotesStyle] = useState("hand");
  const [findText, setFindText] = useState("");
  const [findCount, setFindCount] = useState(0);
  const [findIndex, setFindIndex] = useState(0);
  const [previewFullscreenOpen, setPreviewFullscreenOpen] = useState(false);
  const [imageFullscreenSrc, setImageFullscreenSrc] = useState("");
  const [mobilePane, setMobilePane] = useState("video");
  const [leftWidth, setLeftWidth] = useState(62);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileSplitActive, setMobileSplitActive] = useState(false);
  const resizingRef = useRef(false);
  const practiceAutoOpenRef = useRef(false);

  useEffect(()=>{
    if (searchParams.get("notes") === "1") setPanelTab("notes");
  }, [searchParams]);

  useEffect(()=>{
    if (tutorialId) {
      localStorage.setItem("lastTutorialId", tutorialId);
      localStorage.setItem("lastStudentRoute", location.pathname + location.search);
    }
  }, [tutorialId, location.pathname, location.search]);

  useEffect(()=>{
    setMobilePane("video");
  }, [tutorialId]);

  useEffect(()=>{
    const update = ()=>{
      setIsDesktop(window.innerWidth >= 1280);
      setIsMobile(window.innerWidth < 768);
    };
    update();
    window.addEventListener("resize", update, { passive: true });
    return ()=>window.removeEventListener("resize", update);
  }, []);

  useEffect(()=>{
    const onFsChange = ()=>{
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    onFsChange();
    return ()=>document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(()=>{
    load();
  }, [tutorialId]);

  const load = async()=>{
    try{
      setLoading(true);
      setError("");
      const [tRes, pRes] = await Promise.all([getTutorials(), getTutorialProgress()]);
      const list = tRes.data || [];
      const map = {};
      (pRes.data || []).forEach((item)=>{
        map[item.tutorialId] = item || {};
      });
      setTutorials(list);
      setProgressMap(map);
    }catch{
      setError("Unable to load tutorial.");
    }finally{
      setLoading(false);
    }
  };

  const getProblemId = (problem, idx)=>String(problem?._id || idx);

  const tutorial = useMemo(()=>{
    return tutorials.find(t=>t._id === tutorialId) || null;
  }, [tutorials, tutorialId]);

  const isYoutube = isYoutubeUrl(tutorial?.videoUrl || "");
  const progressDoc = progressMap[tutorialId] || {};
  const tutorialProblems = [...(tutorial?.problems || [])].sort((a, b)=>(a.order ?? 0) - (b.order ?? 0));
  const tutorialQuiz = tutorial?.quiz || [];
  const solvedProblemIds = Array.isArray(progressDoc.solvedProblemIds) ? progressDoc.solvedProblemIds.map(String) : [];
  const isProblemSolved = (id)=>solvedProblemIds.includes(String(id));
  const isProblemUnlocked = (idx)=>{
    if (idx === 0) return true;
    const prevId = getProblemId(tutorialProblems[idx - 1], idx - 1);
    return isProblemSolved(prevId);
  };
  const selectedProblem = tutorialProblems.find((p, idx)=>getProblemId(p, idx) === selectedProblemId) || null;
  const quizTotal = tutorialQuiz.length;
  const quizAnsweredCount = Object.keys(quizAnswers || {}).length;
  const quizCanSubmit = quizTotal > 0 && quizAnsweredCount === quizTotal;

  const orderIndex = useMemo(()=>{
    return tutorials.findIndex(t=>t._id === tutorialId);
  }, [tutorials, tutorialId]);

  const nextTutorial = useMemo(()=>{
    if (orderIndex < 0) return null;
    return tutorials[orderIndex + 1] || null;
  }, [tutorials, orderIndex]);

  const canOpenNext = useMemo(()=>{
    const doc = progressMap[tutorialId] || {};
    const quiz = tutorial?.quiz || [];
    const problems = tutorial?.problems || [];
    const quizOk = quiz.length ? (doc.quizScore || 0) >= 80 || doc.quizPassed : true;
    const solved = Array.isArray(doc.solvedProblemIds) ? doc.solvedProblemIds.length : 0;
    const problemsOk = problems.length ? solved >= problems.length : true;
    return quizOk && problemsOk;
  }, [progressMap, tutorialId, tutorial]);

  const htmlToPlainText = (html)=>{
    if (!html) return "";
    try{
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const parts = [];
      doc.body.childNodes.forEach((node)=>{
        if (!(node.nodeType === 1 && node.tagName === "IMG")) {
          const text = node.textContent || "";
          if (text.trim()) parts.push(text.trim());
        }
      });
      return parts.join("\n");
    }catch{
      return "";
    }
  };

  const extractImageMarkers = (text = "")=>{
    const matches = text.match(/\[\[img:([^\]]+)\]\]/g) || [];
    return matches
      .map((m)=>m.replace("[[img:", "").replace("]]", "").trim())
      .filter(Boolean);
  };

  const stripImageMarkers = (text = "")=>text.replace(/\[\[img:[^\]]+\]\]/g, "").trim();

  useEffect(()=>{
    const storedTitle = localStorage.getItem(`notesTitle:${tutorialId}`) || "";
    const stored = localStorage.getItem(`notes:${tutorialId}`) || "";
    const storedShots = localStorage.getItem(`notesShots:${tutorialId}`) || "[]";
    setNotesTitle(storedTitle);
    const normalized = stored.includes("<") ? htmlToPlainText(stored) : stored;
    setNotesText(stripImageMarkers(normalized));
    try{
      const parsed = JSON.parse(storedShots);
      const markerShots = extractImageMarkers(normalized).map((src)=>({ dataUrl: src, time: 0, source: "legacy" }));
      const merged = [...markerShots, ...(Array.isArray(parsed) ? parsed : [])];
      const deduped = merged.filter((shot, idx, arr)=>shot?.dataUrl && arr.findIndex((x)=>x?.dataUrl === shot.dataUrl) === idx);
      setScreenshots(deduped);
    }catch{
      const markerShots = extractImageMarkers(normalized).map((src)=>({ dataUrl: src, time: 0, source: "legacy" }));
      setScreenshots(markerShots);
    }
  }, [tutorialId]);

  useEffect(()=>{
    localStorage.setItem(`notes:${tutorialId}`, notesText);
  }, [notesText, tutorialId]);

  useEffect(()=>{
    localStorage.setItem(`notesTitle:${tutorialId}`, notesTitle);
  }, [notesTitle, tutorialId]);

  useEffect(()=>{
    localStorage.setItem(`notesShots:${tutorialId}`, JSON.stringify(screenshots));
  }, [screenshots, tutorialId]);

  useEffect(()=>{
    if (!tutorialId) return;
    setPanelTab("editor");
    setQuizIndex(0);
    setQuizSubmitted(false);
    setQuizScoreLocal(0);
    setProblemCode("");
    setProblemOutput("");
    setProblemStatus("");
    setProblemMessage("");
    setShowProblemDetailMobile(false);
    setShowProblemDetail(false);
    const stored = localStorage.getItem(`tutorialQuiz:${tutorialId}`) || "";
    try{
      const parsed = stored ? JSON.parse(stored) : {};
      setQuizAnswers(parsed || {});
    }catch{
      setQuizAnswers({});
    }
    practiceAutoOpenRef.current = false;
  }, [tutorialId]);

  useEffect(()=>{
    if (!tutorialId) return;
    localStorage.setItem(`tutorialQuiz:${tutorialId}`, JSON.stringify(quizAnswers));
  }, [quizAnswers, tutorialId]);

  useEffect(()=>{
    if (!tutorialId || !selectedProblemId) return;
    const stored = localStorage.getItem(`tutorialProblemCode:${tutorialId}:${selectedProblemId}`) || "";
    setProblemCode(stored);
    setProblemOutput("");
    setProblemStatus("");
    setProblemMessage("");
    setShowProblemDetail(false);
    setShowProblemDetailMobile(false);
  }, [tutorialId, selectedProblemId]);

  useEffect(()=>{
    if (!tutorialId || !selectedProblemId) return;
    localStorage.setItem(`tutorialProblemCode:${tutorialId}:${selectedProblemId}`, problemCode);
  }, [tutorialId, selectedProblemId, problemCode]);

  useEffect(()=>{
    setHasSelection(false);
  }, [notesOpen]);

  useEffect(()=>{
    progressRef.current = progressMap;
  }, [progressMap]);

  useEffect(()=>{
    if (!tutorialProblems.length) {
      setSelectedProblemId("");
      return;
    }
    const solved = progressMap[tutorialId]?.solvedProblemIds || [];
    const firstIdx = tutorialProblems.findIndex((p, idx)=> idx === 0 || solved.includes(getProblemId(tutorialProblems[idx - 1], idx - 1)));
    const safeIdx = firstIdx === -1 ? 0 : firstIdx;
    const nextId = getProblemId(tutorialProblems[safeIdx], safeIdx);
    setSelectedProblemId((prev)=> prev || nextId);
  }, [tutorialProblems, tutorialId, progressMap, getProblemId]);

  useEffect(()=>{
    if (!isYoutubeUrl(tutorial?.videoUrl || "")) return;
    setYtError("");
    ytReadyRef.current = false;

    const ensureScript = () => {
      if (window.YT && window.YT.Player) return Promise.resolve();
      return new Promise((resolve) => {
        const existing = document.getElementById("yt-iframe-api");
        if (existing) {
          const check = setInterval(() => {
            if (window.YT && window.YT.Player) {
              clearInterval(check);
              resolve();
            }
          }, 200);
          return;
        }
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.id = "yt-iframe-api";
        window.onYouTubeIframeAPIReady = () => resolve();
        document.body.appendChild(tag);
      });
    };

    let cancelled = false;
    ensureScript().then(() => {
      if (cancelled) return;
      const id = getYoutubeId(tutorial.videoUrl || "");
      const hostEl = document.getElementById(`yt-player-${tutorialId}`);
      if (!hostEl || !id) {
        setYtError("Invalid YouTube link. Please use a valid watch/share/embed URL.");
        return;
      }
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
      ytPlayerRef.current = new window.YT.Player(hostEl, {
        videoId: id,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          rel: 0,
          modestbranding: 1,
          controls: 1,
          origin: window.location.origin,
          playsinline: 1,
          fs: 1,
          enablejsapi: 1
        },
        events: {
          onReady: (event) => {
            ytReadyRef.current = true;
            const dur = event.target.getDuration() || 0;
            if (dur) setDuration(dur);
            const iframe = event.target.getIframe?.();
            if (iframe) {
              iframe.setAttribute("allow", "autoplay; fullscreen; encrypted-media; picture-in-picture");
              iframe.setAttribute("playsinline", "1");
            }
          },
          onStateChange: (event) => {
            const state = event.data;
            if (state === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (state === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (state === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              updateProgress(100);
            }
          }
        }
      });

      if (ytTimerRef.current) clearInterval(ytTimerRef.current);
      ytTimerRef.current = setInterval(() => {
        const player = ytPlayerRef.current;
        if (!player || !ytReadyRef.current) return;
        const cur = player.getCurrentTime() || 0;
        const dur = player.getDuration() || 0;
        if (dur > 0) {
          setCurrentTime(cur);
          setDuration(dur);
          const percent = (cur / dur) * 100;
          const prev = progressRef.current[tutorialId]?.percent || 0;
          if (Math.abs(prev - percent) >= 2) {
            updateProgress(percent);
          }
        }
      }, 500);
    }).catch(() => {
      setYtError("Unable to load YouTube player.");
    });

    return () => {
      cancelled = true;
      if (ytTimerRef.current) {
        clearInterval(ytTimerRef.current);
        ytTimerRef.current = null;
      }
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
      ytReadyRef.current = false;
    };
  }, [tutorialId, tutorial?.videoUrl]);

  const updateProgress = async (percent)=>{
    if (!tutorialId) return;
    const safe = Math.max(0, Math.min(100, percent));
    setProgressMap((prev)=>({
      ...prev,
      [tutorialId]: { ...(prev[tutorialId] || {}), percent: safe }
    }));
    try{
      setUpdating(true);
      await updateTutorialProgress(tutorialId, { percent: safe });
    }finally{
      setUpdating(false);
    }
  };

  const handleLoaded = ()=>{
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  const handleTimeUpdate = ()=>{
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime || 0;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(cur);
    if (dur > 0) {
      const percent = (cur / dur) * 100;
      if (Math.abs((progressMap[tutorialId]?.percent || 0) - percent) >= 2) {
        updateProgress(percent);
      }
    }
  };

  const handlePlay = ()=>{
    setIsPlaying(true);
    if (duration > 0) {
      updateProgress((currentTime / duration) * 100);
    }
  };

  const handlePause = ()=>{
    setIsPlaying(false);
    if (duration > 0) {
      updateProgress((currentTime / duration) * 100);
    }
  };

  const handleEnded = ()=>{
    setIsPlaying(false);
    updateProgress(100);
  };

  const togglePlay = ()=>{
    if (!videoRef.current) return;
    if (videoRef.current.paused) videoRef.current.play();
    else videoRef.current.pause();
  };

  const toggleYoutubePlay = ()=>{
    const player = ytPlayerRef.current;
    if (!player || !window.YT) return;
    const state = player.getPlayerState?.();
    if (state === window.YT.PlayerState.PLAYING) player.pauseVideo();
    else player.playVideo();
  };

  const seekTo = (value)=>{
    if (!videoRef.current || !duration) return;
    const time = (Number(value) / 100) * duration;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };
 
  const enterFullScreen = async()=>{
    const el = containerRef.current;
    const video = videoRef.current;
    if (isYoutube) {
      const iframe = ytPlayerRef.current?.getIframe?.();
      if (iframe && iframe.requestFullscreen) {
        try{
          await iframe.requestFullscreen();
        }catch{
          // ignore
        }
      }
      const player = ytPlayerRef.current;
      if (player && typeof player.playVideo === "function") player.playVideo();
    } else if (video && typeof video.webkitEnterFullscreen === "function") {
      video.webkitEnterFullscreen();
      if (video && typeof video.play === "function") video.play();
    } else if (video && video.requestFullscreen) {
      try{
        await video.requestFullscreen();
      }catch{
        // ignore
      }
      if (video && typeof video.play === "function") video.play();
    } else if (el && el.requestFullscreen) {
      try{
        await el.requestFullscreen();
      }catch{
        // ignore
      }
      if (video && typeof video.play === "function") video.play();
    }
    if (screen.orientation && typeof screen.orientation.lock === "function") {
      screen.orientation.lock("landscape").catch(()=>{});
    }
  };

  const exitFullScreen = ()=>{
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(()=>{});
    }
  };

  const ensureCaretTop = ()=>{
    const el = notesRef.current;
    if (!el) return;
    if (!el.value) return;
  };

  const insertText = (text)=>{
    const el = notesRef.current;
    if (!el) {
      setNotesText((prev)=>`${prev}${text}`);
      return;
    }
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const before = notesText.slice(0, start);
    const after = notesText.slice(end);
    const next = `${before}${text}${after}`;
    setNotesText(next);
    requestAnimationFrame(()=>{
      const pos = start + text.length;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  const wrapSelection = (startTag, endTag)=>{
    const el = notesRef.current;
    if (!el) return;
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    if (start === end) return;
    const before = notesText.slice(0, start);
    const selected = notesText.slice(start, end);
    const after = notesText.slice(end);
    const next = `${before}${startTag}${selected}${endTag}${after}`;
    setNotesText(next);
    requestAnimationFrame(()=>{
      el.focus();
      const selStart = start + startTag.length;
      const selEnd = selStart + selected.length;
      el.setSelectionRange(selStart, selEnd);
    });
  };

  const applyBullets = ()=>{
    const el = notesRef.current;
    if (!el) return;
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const before = notesText.slice(0, start);
    const selected = notesText.slice(start, end) || "";
    const after = notesText.slice(end);
    const lines = (selected || " ").split("\n").map((line)=> line.startsWith("- ") ? line : `- ${line}`);
    const next = `${before}${lines.join("\n")}${after}`;
    setNotesText(next);
  };

  const removeImage = (src)=>{
    setScreenshots((prev)=>prev.filter((shot)=>shot.dataUrl !== src));
  };

  const openImageFullscreen = (src)=>{
    if (!src) return;
    setImageFullscreenSrc(src);
  };

  const escapeRegExp = (value)=>value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const normalizeOutput = (text = "")=>{
    const s = String(text || "");
    return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n")
      .map((line)=>line.replace(/[ \t]+$/g, ""))
      .join("\n")
      .replace(/\n+$/g, "");
  };

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

  useEffect(()=>{
    if (!findText) {
      setFindCount(0);
      setFindIndex(0);
      return;
    }
    highlightFind(findText);
  }, [notesText]);

  useEffect(()=>{
    if (!isMobile || !tutorial) return;
    setMobileSplitActive(false);
  }, [isMobile, tutorialId]);

  useEffect(()=>{
    const handleMove = (e)=>{
      if (!resizingRef.current) return;
      const gridEl = gridRef.current;
      if (!gridEl) return;
      const rect = gridEl.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      const minPct = 45;
      const gap = 24;
      const maxPct = rect.width > 0
        ? ((rect.width - 42 - 320 - gap) / rect.width) * 100
        : 80;
      const safeMax = Number.isFinite(maxPct) ? Math.max(minPct, Math.min(80, maxPct)) : 80;
      const clamped = Math.max(minPct, Math.min(safeMax, pct));
      setLeftWidth(clamped);
    };
    const handleUp = ()=>{
      resizingRef.current = false;
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return ()=>{
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, []);

  useEffect(()=>{
    if (!isDesktop) return;
    const gridEl = gridRef.current;
    if (!gridEl) return;
    const rect = gridEl.getBoundingClientRect();
    if (!rect.width) return;
    const minPct = 45;
    const gap = 24;
    const maxPct = ((rect.width - 42 - 320 - gap) / rect.width) * 100;
    const safeMax = Number.isFinite(maxPct) ? Math.max(minPct, Math.min(80, maxPct)) : 80;
    setLeftWidth((prev)=>Math.max(minPct, Math.min(safeMax, prev)));
  }, [isDesktop]);

  const takeScreenshot = ()=>{
    if (isYoutube) {
      const id = getYoutubeId(tutorial.videoUrl || "");
      if (!id) return;
      const dataUrl = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      const shot = { dataUrl, time: 0, source: "youtube" };
      setScreenshots((prev)=>[shot, ...prev]);
      return;
    }
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.readyState < 2) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    const shot = { dataUrl, time: Math.round(video.currentTime || 0), source: "upload" };
    setScreenshots((prev)=>[shot, ...prev]);
  };

  const addCodeToNotes = ()=>{
    const codeBlock = code ? code : "(empty)";
    const outBlock = output ? output : "(empty)";
    insertText(`\n\nEditor:\n${codeBlock}\n\nOutput:\n${outBlock}`);
  };

  const saveProblemToNotes = ()=>{
    if (!selectedProblem) return;
    const block = [
      `\n\nProblem: ${selectedProblem.title}`,
      selectedProblem.statement ? `\n${selectedProblem.statement}` : "",
      `\n\nCode:\n${problemCode || "(empty)"}`,
      `\n\nOutput:\n${problemOutput || "(empty)"}`
    ].join("");
    insertText(block);
  };

  const runProblem = async()=>{
    if (!selectedProblem) return;
    setProblemRunning(true);
    setProblemOutput("");
    setProblemStatus("");
    setProblemMessage("");
    try{
      const res = await runPython(problemCode, "python", selectedProblem.sampleInput || "", null);
      if (res.data?.error) {
        setProblemStatus("error");
        setProblemMessage(res.data.hint || res.data.error || "Runtime error.");
        setProblemOutput(`Error: ${res.data.error || "Runtime error"}`);
      } else {
        setProblemOutput(res.data?.output || "");
      }
    }catch{
      setProblemStatus("error");
      setProblemMessage("Unable to run code.");
    }finally{
      setProblemRunning(false);
    }
  };

  const submitProblem = async()=>{
    if (!selectedProblem) return;
    setProblemRunning(true);
    setProblemStatus("");
    setProblemMessage("");
    try{
      const res = await runPython(problemCode, "python", selectedProblem.sampleInput || "", null);
      if (res.data?.error) {
        setProblemStatus("error");
        setProblemMessage(res.data.hint || res.data.error || "Runtime error.");
        setProblemOutput(`Error: ${res.data.error || "Runtime error"}`);
        return;
      }
      const actual = normalizeOutput(res.data?.output || "");
      const expected = normalizeOutput(selectedProblem.expectedOutput || "");
      setProblemOutput(res.data?.output || "");
      if (actual !== expected) {
        setProblemStatus("wrong");
        setProblemMessage("Wrong output. Check logic or formatting.");
        return;
      }
      setProblemStatus("correct");
      setProblemMessage("Correct! Problem solved.");
      const pid = selectedProblemId || getProblemId(selectedProblem, 0);
      const nextSolved = Array.from(new Set([...solvedProblemIds, String(pid)]));
      setProgressMap((prev)=>({
        ...prev,
        [tutorialId]: { ...(prev[tutorialId] || {}), solvedProblemIds: nextSolved }
      }));
      await updateTutorialProgress(tutorialId, { solvedProblemIds: nextSolved });
    }catch{
      setProblemStatus("error");
      setProblemMessage("Unable to submit code.");
    }finally{
      setProblemRunning(false);
    }
  };

  const submitQuiz = async()=>{
    if (!quizCanSubmit) return;
    let correct = 0;
    tutorialQuiz.forEach((q, idx)=>{
      const answer = quizAnswers[idx];
      if (Number(answer) === Number(q.correctIndex)) correct += 1;
    });
    const score = quizTotal ? Math.round((correct / quizTotal) * 100) : 0;
    setQuizScoreLocal(score);
    setQuizSubmitted(true);
    setProgressMap((prev)=>({
      ...prev,
      [tutorialId]: { ...(prev[tutorialId] || {}), quizScore: score, quizPassed: score >= 80 }
    }));
    await updateTutorialProgress(tutorialId, { quizScore: score, quizPassed: score >= 80 });
  };

  const goToLesson = ()=>{
    setMobilePane("video");
    const target = containerRef.current;
    if (target && typeof target.scrollIntoView === "function") {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const NotesPreview = ({
    text,
    shots = [],
    findText: search,
    findIndex: activeIndex,
    onRemoveImage,
    onOpenImage
  })=>{
    const parts = [];
    let findCounter = 0;
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
        findCounter += 1;
        out.push(
          <mark
            key={`m-${findCounter}`}
            className={`note-find ${findCounter === activeIndex ? "note-find-active" : ""}`}
            data-find-index={findCounter}
          >
            {segment.slice(pos, pos + needle.length)}
          </mark>
        );
        idx = pos + needle.length;
      }
      return out;
    };

    const renderInline = (segment)=>{
      const tokens = segment.split(/(\*\*[^*]+\*\*|_[^_]+_|\[\[hl\]\][\s\S]*?\[\[\/hl\]\])/g);
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
        return <span key={`t-${idx}`}>{highlightText(token)}</span>;
      });
    };

    if (text) parts.push(<span key="text-main">{renderInline(text)}</span>);
    if (shots.length) {
      parts.push(
        <div key="shots-title" className="mt-3 text-[11px] uppercase tracking-widest text-slate-500">
          Screenshots
        </div>
      );
      shots.forEach((shot, idx)=>{
        if (!shot?.dataUrl) return;
        parts.push(
          <div key={`img-${idx}-${shot.dataUrl}`} className="note-shot">
            <img src={shot.dataUrl} alt="screenshot" />
            {onOpenImage && (
              <button
                className="btn btn-outline px-2 py-1 text-xs mt-2"
                onClick={()=>onOpenImage(shot.dataUrl)}
              >
                Full Screen
              </button>
            )}
            <button className="note-shot-delete" onClick={()=>onRemoveImage(shot.dataUrl)}>x</button>
          </div>
        );
      });
    }
    return <div className="whitespace-pre-wrap break-words">{parts}</div>;
  };

  const run = async()=>{
    setRunning(true);
    setOutput("");
    try{
      const res = await runPython(code, "python", "", null);
      if (res.data?.error) {
        setOutput(`Error: ${res.data.error}`);
      } else {
        setOutput(res.data?.output || "");
      }
    }catch{
      setOutput("Unable to run code.");
    }finally{
      setRunning(false);
    }
  };

  const displayPercent = duration
    ? (currentTime / duration) * 100
    : (progressMap[tutorialId]?.percent || 0);
  const storedPracticeUnlocked = tutorialId
    ? localStorage.getItem(`practiceUnlocked:${tutorialId}`) === "1"
    : false;
  const practiceUnlocked = storedPracticeUnlocked
    || Math.max(displayPercent, progressMap[tutorialId]?.percent || 0) >= 80;

  useEffect(()=>{
    if (!tutorialId) return;
    if (!practiceUnlocked) return;
    const key = `practiceUnlocked:${tutorialId}`;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, "1");
    }
    if (practiceAutoOpenRef.current) return;
    practiceAutoOpenRef.current = true;
    setPanelTab("quiz");
    setMobilePane("workspace");
  }, [practiceUnlocked, tutorialId]);

  if (loading) {
    return (
      <div className="page-anim page-shell">
        <StudentHeader/>
        <div className="page-wrap">
          <div className="card p-6 text-sm text-slate-500">Loading tutorial...</div>
        </div>
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="page-anim page-shell">
        <StudentHeader/>
        <div className="page-wrap">
          <div className="card p-6 text-sm text-slate-500">{error || "Tutorial not found."}</div>
          <button className="btn btn-outline mt-4" onClick={()=>navigate("/tutorials")}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-anim page-shell">
      {!(isMobile && mobileSplitActive) && <StudentHeader/>}
      <div
        className={`page-wrap px-3 sm:px-4 max-w-none overflow-x-hidden pt-[3px] sm:pt-[3px] ${
          isMobile && mobileSplitActive ? "h-[100dvh] overflow-hidden flex flex-col" : ""
        }`}
      >
        <div className={`flex items-center justify-between flex-wrap gap-3 ${isMobile && mobileSplitActive ? "hidden" : ""} ${mobilePane === "workspace" ? "hidden" : ""}`}>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Lesson {tutorial.order ?? 0}: {tutorial.title}
            </h1>
            <p className="text-sm text-slate-500 mt-1">Progress: {Math.round(progressMap[tutorialId]?.percent || 0)}%</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={()=>navigate("/tutorials")}>All Tutorials</button>
          </div>
        </div>

        {(!isMobile || !mobileSplitActive) && mobilePane !== "workspace" && (
        <div className="mt-4 xl:hidden card-soft p-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              className={`btn text-sm ${mobilePane === "video" ? "btn-primary" : "btn-outline"}`}
              onClick={()=>setMobilePane("video")}
            >
              Lesson
            </button>
            <button
              className={`btn text-sm ${mobilePane === "workspace" ? "btn-primary" : "btn-outline"}`}
              onClick={()=>{
                if (!practiceUnlocked) {
                  alert("Practice unlock ho jayega jab video 80% complete ho.");
                  return;
                }
                setPanelTab("quiz");
                setMobilePane("workspace");
              }}
            >
              Practice
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button
              className="btn btn-outline px-3 py-1 text-xs"
              onClick={enterFullScreen}
              title="Full screen"
              aria-label="Full screen"
            >
              ⤢
            </button>
            <button
              className="btn btn-outline px-3 py-1 text-xs"
              onClick={()=>{
                setPanelTab(notesOpen ? "editor" : "notes");
                setMobilePane("workspace");
              }}
            >
              {notesOpen ? "Open Editor" : "Open Notes"}
            </button>
          </div>
        </div>
        )}

        <div
          ref={gridRef}
          className={`mt-6 ${
            isMobile && mobileSplitActive
              ? "flex flex-col gap-3 flex-1 min-h-0"
              : "grid xl:grid-cols-[minmax(0,1.7fr)_42px_minmax(320px,1fr)] gap-3"
          }`}
          style={isDesktop ? { gridTemplateColumns: `${leftWidth}% 42px minmax(320px,1fr)` } : undefined}
        >
          <div
            className={`card p-3 md:p-4 min-w-0 ${
              !isMobile && mobilePane !== "video"
                ? "hidden xl:block"
                : isMobile && !mobileSplitActive && mobilePane !== "video"
                  ? "hidden"
                  : ""
            } ${isMobile && mobileSplitActive ? "bg-white" : ""}`}
          >
            {isMobile && mobileSplitActive && (
              <div className="mb-2 flex items-center justify-between gap-2">
                <button className="btn btn-outline px-2 py-1 text-xs" onClick={()=>navigate("/tutorials")}>
                  Back
                </button>
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-outline px-2 py-1 text-xs"
                    onClick={isYoutube ? toggleYoutubePlay : togglePlay}
                  >
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  {practiceUnlocked && (
                    <button
                      className="btn btn-primary px-2 py-1 text-xs"
                      onClick={()=>{
                        setPanelTab("quiz");
                        setMobilePane("workspace");
                      }}
                    >
                      Open Practice
                    </button>
                  )}
                  <button
                    className="btn btn-outline px-2 py-1 text-xs"
                    onClick={enterFullScreen}
                  >
                    ⤢
                  </button>
                  <button
                    className="btn btn-outline px-2 py-1 text-xs"
                  onClick={()=>setPanelTab(notesOpen ? "editor" : "notes")}
                  >
                    {notesOpen ? "Editor" : "Notes"}
                  </button>
                </div>
              </div>
            )}
            <div ref={containerRef} className="relative overflow-hidden">
              {isFullscreen && (
                <button
                  className="absolute top-2 right-2 z-10 btn btn-outline px-2 py-1 text-xs bg-white"
                  onClick={exitFullScreen}
                  aria-label="Exit fullscreen"
                  title="Exit fullscreen"
                >
                  ⤡
                </button>
              )}
              {isMobile && !mobileSplitActive && (
                <button
                  className="absolute inset-0 z-10 flex items-center justify-center"
                  onClick={()=>{
                    setMobileSplitActive(true);
                    if (isYoutube) {
                      if (ytReadyRef.current && ytPlayerRef.current?.playVideo) {
                        ytPlayerRef.current.playVideo();
                      }
                    } else if (videoRef.current?.play) {
                      const res = videoRef.current.play();
                      if (res && typeof res.catch === "function") res.catch(()=>{});
                    }
                  }}
                  aria-label="Play"
                  title="Play"
                >
                  <span className="w-14 h-14 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-xl shadow">
                    ▶
                  </span>
                </button>
              )}
              {!isYoutube && (
                <>
                  <video
                    ref={videoRef}
                    src={tutorial.videoUrl}
                    playsInline
                    className="w-full rounded-lg border border-slate-200 bg-black aspect-video min-h-[220px] sm:min-h-[320px] xl:min-h-[calc(100vh-170px)]"
                    onLoadedMetadata={handleLoaded}
                    onTimeUpdate={handleTimeUpdate}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onEnded={handleEnded}
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
                    <button className="btn btn-outline" onClick={togglePlay}>
                      {isPlaying ? "Pause" : "Play"}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={duration ? (currentTime / duration) * 100 : 0}
                      onChange={(e)=>seekTo(e.target.value)}
                      className="w-full"
                    />
                    <button
                      className="btn btn-outline px-3 py-1 text-sm hidden lg:inline-flex"
                      onClick={enterFullScreen}
                      title="Full screen"
                      aria-label="Full screen"
                    >
                      ⤢ Full Screen
                    </button>
                  </div>
                </>
              )}
              {isYoutube && (
                <>
                  <div className="w-full aspect-video min-h-[220px] sm:min-h-[320px] xl:min-h-[calc(100vh-170px)] overflow-hidden">
                    <div
                      id={`yt-player-${tutorialId}`}
                      className="w-full h-full rounded-lg border border-slate-200 overflow-hidden bg-black"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
                    <button
                      className="btn btn-outline px-3 py-1 text-sm hidden lg:inline-flex"
                      onClick={enterFullScreen}
                      title="Full screen"
                      aria-label="Full screen"
                    >
                      ⤢ Full Screen
                    </button>
                  </div>
                </>
              )}
            </div>
            {isYoutube && ytError && (
              <div className="mt-2 text-xs text-red-600">{ytError}</div>
            )}

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Progress</span>
                <span>{Math.round(displayPercent)}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, displayPercent))}%` }}
                />
              </div>
            </div>

            <div className={`mt-4 ${isMobile && mobileSplitActive ? "hidden" : ""}`}>
              <div className="text-xs uppercase tracking-widest text-slate-500">Description</div>
              <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                {tutorial.description || "No description available."}
              </p>
            </div>

          </div>

          <div className="hidden xl:flex order-3 xl:order-none xl:flex-col items-center justify-center gap-3 xl:sticky xl:top-24 h-fit min-w-0">
            <button
              className="w-9 h-9 rounded-full border border-slate-200 bg-white shadow flex items-center justify-center text-[11px] font-semibold"
              onClick={takeScreenshot}
              title="Take screenshot"
              aria-label="Take screenshot"
            >
              SS
            </button>
            <div
              className="w-2 h-12 rounded-full bg-slate-200 hover:bg-slate-300 cursor-col-resize"
              onMouseDown={(e)=>{
                if (!isDesktop) return;
                e.preventDefault();
                resizingRef.current = true;
              }}
              title="Resize panels"
              aria-label="Resize panels"
              role="separator"
            />
            <button
              className="w-9 h-9 rounded-full border border-emerald-600 bg-emerald-600 text-white shadow flex items-center justify-center text-[9px] font-semibold"
              onClick={()=>{
                setPanelTab(notesOpen ? "editor" : "notes");
                setMobilePane("workspace");
              }}
              title={notesOpen ? "Editor" : "Notes"}
              aria-label={notesOpen ? "Editor" : "Notes"}
            >
              {notesOpen ? "EDIT" : "NOTE"}
            </button>
          </div>

          <div
            className={`order-2 xl:order-none card p-3 md:p-4 gap-4 min-w-0 mt-2 ${
              !isMobile && mobilePane !== "workspace"
                ? "hidden xl:flex xl:flex-col"
                : isMobile && !mobileSplitActive && mobilePane !== "workspace"
                  ? "hidden"
                  : "flex flex-col"
            } ${isMobile && mobileSplitActive ? "flex-1 overflow-y-auto" : ""}`}
          >
            <div className="flex flex-wrap gap-2">
              {!(isMobile && mobileSplitActive && !practiceUnlocked) && (
                <button
                  className="btn btn-outline px-3 py-1 text-sm"
                  onClick={goToLesson}
                >
                  Lesson
                </button>
              )}
              {practiceUnlocked && !(isMobile && mobileSplitActive && !practiceUnlocked) ? (
                <>
                  <button
                    className={`btn px-3 py-1 text-sm ${panelTab === "quiz" ? "btn-primary" : "btn-outline"}`}
                    onClick={()=>setPanelTab("quiz")}
                  >
                    Quiz
                  </button>
                  <button
                    className={`btn px-3 py-1 text-sm ${panelTab === "problems" ? "btn-primary" : "btn-outline"}`}
                    onClick={()=>setPanelTab("problems")}
                  >
                    Problems
                  </button>
                </>
              ) : (
                !(isMobile && mobileSplitActive && !practiceUnlocked) && (
                  <button
                    className="btn btn-outline px-3 py-1 text-sm"
                    onClick={()=>alert("Practice unlock ho jayega jab video 80% complete ho.")}
                  >
                    Practice (Locked)
                  </button>
                )
              )}
              <button
                className={`btn px-3 py-1 text-sm ${panelTab === "editor" ? "btn-primary" : "btn-outline"}`}
                onClick={()=>setPanelTab("editor")}
              >
                Editor
              </button>
              <button
                className={`btn px-3 py-1 text-sm ${panelTab === "notes" ? "btn-primary" : "btn-outline"}`}
                onClick={()=>setPanelTab("notes")}
              >
                Notes
              </button>
            </div>

            {panelTab === "editor" && (
              <>
                <div className="mt-3">
                  <div className="text-xs uppercase tracking-widest text-slate-500">Python Editor</div>
                  <textarea
                    className="textarea mt-2 h-40"
                    value={code}
                    onChange={(e)=>setCode(e.target.value)}
                    placeholder="Write Python code..."
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="btn btn-outline" onClick={run} disabled={running}>
                      {running ? "Running..." : "Run"}
                    </button>
                    <button className="btn btn-outline" onClick={addCodeToNotes}>
                      Save to Notes
                    </button>
                    {updating && (
                      <span className="text-xs text-slate-500 self-center">Saving progress...</span>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xs uppercase tracking-widest text-slate-500">Output</div>
                  <pre className="card-soft mt-2 p-3 text-sm whitespace-pre-wrap min-h-[120px]">{output}</pre>
                </div>
              </>
            )}

            {panelTab === "quiz" && (
              <div className="mt-3">
                <div className="text-xs uppercase tracking-widest text-slate-500">Quiz</div>
                {!tutorialQuiz.length ? (
                  <div className="mt-2 text-sm text-slate-500">No quiz added for this lesson yet.</div>
                ) : (
                  <div className="mt-2 card-soft p-3">
                    <div className="text-xs uppercase tracking-widest text-slate-500">
                      Question {quizIndex + 1} / {quizTotal}
                    </div>
                    <div className="mt-2 font-semibold">{tutorialQuiz[quizIndex]?.question}</div>
                    <div className="mt-3 grid gap-2">
                      {(tutorialQuiz[quizIndex]?.options || []).map((opt, idx)=>(
                        <label
                          key={`q-${quizIndex}-${idx}`}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer ${
                            Number(quizAnswers[quizIndex]) === idx ? "bg-emerald-50 border-emerald-200" : "border-slate-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`quiz-${quizIndex}`}
                            checked={Number(quizAnswers[quizIndex]) === idx}
                            onChange={()=>{
                              setQuizAnswers((prev)=>({ ...prev, [quizIndex]: idx }));
                            }}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <button
                        className="btn btn-outline px-3 py-1 text-sm"
                        disabled={quizIndex === 0}
                        onClick={()=>setQuizIndex((prev)=>Math.max(0, prev - 1))}
                      >
                        Prev
                      </button>
                      {quizIndex < quizTotal - 1 ? (
                        <button
                          className="btn btn-outline px-3 py-1 text-sm"
                          disabled={quizAnswers[quizIndex] === undefined}
                          onClick={()=>setQuizIndex((prev)=>Math.min(quizTotal - 1, prev + 1))}
                        >
                          Next
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary px-3 py-1 text-sm"
                          disabled={!quizCanSubmit}
                          onClick={submitQuiz}
                        >
                          Submit Quiz
                        </button>
                      )}
                    </div>
                    {(quizSubmitted || progressDoc.quizScore) && (
                      <div className="mt-3 text-sm text-slate-600">
                        Score: <span className="font-semibold">{quizSubmitted ? quizScoreLocal : (progressDoc.quizScore || 0)}%</span>
                        {(quizSubmitted ? quizScoreLocal : (progressDoc.quizScore || 0)) >= 80 && (
                          <span className="ml-2 text-emerald-700 font-semibold">Passed</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {panelTab === "problems" && (
              <div className="mt-3">
                <div className="text-xs uppercase tracking-widest text-slate-500">Problems</div>
                {!tutorialProblems.length ? (
                  <div className="mt-2 text-sm text-slate-500">No problems added for this lesson yet.</div>
                ) : (
                  <>
                    <div className="mt-2">
                      {(!isMobile ? !showProblemDetail : !showProblemDetailMobile) && (
                        <div className="grid gap-2 max-h-72 overflow-auto no-scrollbar pr-1">
                          {tutorialProblems.map((p, idx)=>{
                            const pid = getProblemId(p, idx);
                            const locked = !isProblemUnlocked(idx);
                            const solved = isProblemSolved(pid);
                            return (
                              <button
                                key={pid}
                                disabled={locked}
                                onClick={()=>{
                                  setSelectedProblemId(pid);
                                  if (isMobile) setShowProblemDetailMobile(true);
                                  else setShowProblemDetail(true);
                                }}
                                className={`card p-3 text-left ${selectedProblemId === pid ? "ring-2 ring-emerald-200" : ""} ${locked ? "opacity-60" : ""}`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm">{idx + 1}. {p.title}</span>
                                  <span className="text-[11px] text-slate-500">{solved ? "Solved" : locked ? "Locked" : "Open"}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {(selectedProblem && (isMobile ? showProblemDetailMobile : showProblemDetail)) ? (
                        <div className="card-soft p-3">
                          <button
                            className="btn btn-ghost text-sm mb-2"
                            onClick={()=>{
                              if (isMobile) setShowProblemDetailMobile(false);
                              else setShowProblemDetail(false);
                            }}
                          >
                            Back
                          </button>
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <div className="text-sm font-semibold">{selectedProblem.title}</div>
                              <div className="text-xs text-slate-500">{selectedProblem.difficulty || "easy"}</div>
                            </div>
                            <button className="btn btn-outline px-2 py-1 text-xs" onClick={saveProblemToNotes}>
                              Save to Notes
                            </button>
                          </div>
                          <p className="mt-2 text-sm text-slate-700">{selectedProblem.statement}</p>
                          <div className="mt-3">
                            <div className="text-xs uppercase tracking-widest text-slate-500">Expected Output</div>
                            <textarea
                              className="textarea mt-2 bg-slate-50"
                              rows={2}
                              readOnly
                              value={selectedProblem.expectedOutput || ""}
                            />
                          </div>
                          {selectedProblem.rulesConstraints && (
                            <div className="mt-3 text-sm text-slate-600">{selectedProblem.rulesConstraints}</div>
                          )}
                          <textarea
                            className="textarea mt-3 h-40"
                            value={problemCode}
                            onChange={(e)=>setProblemCode(e.target.value)}
                            placeholder="Write Python code..."
                          />
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button className="btn btn-outline" onClick={runProblem} disabled={problemRunning}>
                              {problemRunning ? "Running..." : "Run"}
                            </button>
                            <button className="btn btn-primary" onClick={submitProblem} disabled={problemRunning}>
                              Submit
                            </button>
                          </div>
                          <pre className="card-soft mt-3 p-3 text-sm whitespace-pre-wrap min-h-[80px]">{problemOutput}</pre>
                          {problemStatus && (
                            <div className={`mt-2 text-sm ${problemStatus === "correct" ? "text-emerald-700" : "text-red-600"}`}>
                              {problemMessage}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            )}

            {panelTab === "notes" && (
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500">Notes</div>
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
                    className="select w-full sm:w-40 h-8 text-sm"
                    value={notesStyle}
                    onChange={(e)=>setNotesStyle(e.target.value)}
                  >
                    <option value="hand">Handwriting</option>
                    <option value="normal">Normal</option>
                  </select>
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
                <input
                  className="input mt-2"
                  value={notesTitle}
                  onChange={(e)=>setNotesTitle(e.target.value)}
                  placeholder="Notes title..."
                />
                <textarea
                  className={`textarea mt-2 h-[220px] overflow-auto no-scrollbar ${notesStyle === "hand" ? "notes-editor-hand" : ""}`}
                  ref={notesRef}
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
                  placeholder="Write your notes here..."
                />
                {!notesText && (
                  <div className="mt-3 text-xs text-slate-500">Start typing to save notes.</div>
                )}
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
                    shots={screenshots}
                    findText={findText}
                    findIndex={findIndex}
                    onRemoveImage={removeImage}
                    onOpenImage={openImageFullscreen}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {nextTutorial && !(isMobile && mobileSplitActive) && (
          <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
            <div className="text-sm text-slate-600">
              Next Tutorial: <span className="font-semibold">{nextTutorial.title}</span>
            </div>
            <button
              className="btn btn-primary"
              disabled={!canOpenNext}
              onClick={()=>navigate(`/tutorials/${nextTutorial._id}`)}
            >
              Open Next
            </button>
          </div>
        )}
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
                shots={screenshots}
                findText={findText}
                findIndex={findIndex}
                onRemoveImage={removeImage}
                onOpenImage={openImageFullscreen}
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
