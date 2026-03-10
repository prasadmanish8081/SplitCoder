import { spawnSync } from "child_process";
import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import path from "path";
import Problem from "../models/Problem.js";

const parseTestcases = (raw) => {
 if (!raw) return [];
 try {
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return parsed;
 } catch {}
 return [];
};

const normalizeOutput = (text) => {
 const s = (text || "").toString();
 const normalizedLines = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
 return normalizedLines.map((line) => line.replace(/[ \t]+$/g, "")).join("\n").replace(/\n+$/g, "");
};

const allowedLanguages = new Set(["python"]);

const normalizeLanguage = (lang) => {
 const l = (lang || "python").toString().toLowerCase();
 return allowedLanguages.has(l) ? l : null;
};

const hfModel = process.env.HF_MODEL || "Qwen/Qwen2.5-Coder-1.5B-Instruct";
const hfToken = process.env.HF_API_TOKEN;

const callHfAnalysis = async ({ code, errorText, expectedOutput }) => {
 if (!hfToken) return null;
 const prompt = [
  "You are a strict Python tutor.",
  "Given code and runtime error or wrong output, identify the exact mistake and how to fix it.",
  "Be concise: 1-3 bullet points.",
  "",
  "Code:",
  code || "",
  "",
  "Error or Output:",
  errorText || "",
  "",
  "Expected Output:",
  expectedOutput || ""
 ].join("\n");

 const res = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
  method: "POST",
  headers: {
   Authorization: `Bearer ${hfToken}`,
   "Content-Type": "application/json"
  },
  body: JSON.stringify({
   inputs: prompt,
   parameters: { max_new_tokens: 160, temperature: 0.2 },
   options: { wait_for_model: true }
  })
 });

 const data = await res.json().catch(() => null);
 if (!res.ok) {
  console.error("HF API error:", res.status, data);
  return null;
 }
 if (!data) return null;
 if (data.error) {
  console.error("HF API response error:", data);
  return null;
 }
 const text = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
 if (!text) return null;
 const cleaned = text.replace(prompt, "").trim();
 return cleaned || null;
};

const createTempDir = () => {
 return fs.mkdtempSync(path.join(os.tmpdir(), "code-run-"));
};

const cleanupDir = (dir) => {
 try {
  fs.rmSync(dir, { recursive: true, force: true });
 } catch {}
};

const writeSourceFile = (language, dir, code) => {
 let filename = "main.txt";
 if (language === "python") filename = "main.py";
 if (language === "javascript") filename = "main.js";
 if (language === "c") filename = "main.c";
 if (language === "cpp") filename = "main.cpp";
 if (language === "java") filename = "Main.java";
 const filePath = path.join(dir, filename);
 fs.writeFileSync(filePath, code || "");
 return { filePath, filename };
};

const compileSource = (language, dir, filePath) => {
 const isWin = process.platform === "win32";
 if (language === "c" || language === "cpp") {
  const exePath = path.join(dir, isWin ? "program.exe" : "program");
  const compiler = language === "c" ? "gcc" : "g++";
  const result = spawnSync(compiler, [filePath, "-o", exePath], { encoding: "utf-8" });
  if (result.error) return { error: result.error.message };
  if (result.status !== 0) return { error: (result.stderr || "").toString() };
  return { exePath };
 }
 if (language === "java") {
  const result = spawnSync("javac", [path.basename(filePath)], { encoding: "utf-8", cwd: dir });
  if (result.error) return { error: result.error.message };
  if (result.status !== 0) return { error: (result.stderr || "").toString() };
  return { className: "Main" };
 }
 return {};
};

const runPrepared = ({ language, dir, filePath, exePath, className, input }) => {
 if (language === "python") {
  const result = spawnSync("python", [filePath], { input: input ?? "", encoding: "utf-8" });
  if (result.error) return { error: result.error.message };
  if (result.status !== 0) return { error: (result.stderr || "").toString() };
  return { output: (result.stdout || "").toString() };
 }
 if (language === "javascript") {
  const result = spawnSync("node", [filePath], { input: input ?? "", encoding: "utf-8" });
  if (result.error) return { error: result.error.message };
  if (result.status !== 0) return { error: (result.stderr || "").toString() };
  return { output: (result.stdout || "").toString() };
 }
 if (language === "c" || language === "cpp") {
  const result = spawnSync(exePath, [], { input: input ?? "", encoding: "utf-8", cwd: dir });
  if (result.error) return { error: result.error.message };
  if (result.status !== 0) return { error: (result.stderr || "").toString() };
  return { output: (result.stdout || "").toString() };
 }
 if (language === "java") {
  const result = spawnSync("java", ["-cp", dir, className || "Main"], { input: input ?? "", encoding: "utf-8", cwd: dir });
  if (result.error) return { error: result.error.message };
  if (result.status !== 0) return { error: (result.stderr || "").toString() };
  return { output: (result.stdout || "").toString() };
 }
 return { error: "Unsupported language" };
};

const getHint = (problem) => {
 return problem.hint || "Try checking your logic and edge cases.";
};

const analyzeRuntimeError = (stderr) => {
 const err = (stderr || "").toString();
 if (!err) return { type: "runtime", hint: "Runtime error. Check your code for crashes." };

 if (err.includes("SyntaxError")) {
  return { type: "syntax", hint: "Syntax error. Check quotes, brackets, or missing colons." };
 }
 if (err.includes("IndentationError")) {
  return { type: "indentation", hint: "Indentation error. Make sure blocks align consistently." };
 }
 if (err.includes("NameError")) {
  return { type: "name", hint: "Name error. You might be using an undefined variable." };
 }
 if (err.includes("ReferenceError")) {
  return { type: "name", hint: "Reference error. You might be using an undefined variable." };
 }
 if (err.includes("TypeError")) {
  return { type: "type", hint: "Type error. Check if you're mixing incompatible types." };
 }
 if (err.includes("IndexError")) {
  return { type: "index", hint: "Index error. You might be accessing out of range." };
 }
 if (err.includes("KeyError")) {
  return { type: "key", hint: "Key error. A dictionary key was missing." };
 }
 if (err.includes("ZeroDivisionError")) {
  return { type: "zero", hint: "Division by zero. Check your denominator." };
 }
 if (err.includes("ValueError")) {
  return { type: "value", hint: "Value error. Check input parsing and conversions." };
 }
 if (err.includes("EOFError")) {
  return { type: "eof", hint: "EOF error. Input reading might be missing data." };
 }
 if (err.includes("ModuleNotFoundError") || err.includes("ImportError")) {
  return { type: "import", hint: "Import error. Avoid unavailable modules or typos in import." };
 }

 return { type: "runtime", hint: "Runtime error. Review the error message and your logic." };
};

const errorRepeatCounts = new Map();

const getErrorKey = ({ userId, problemId, errorType, lineNumber, incorrectPart }) => {
 const safeLine = lineNumber ? String(lineNumber) : "na";
 const safePart = (incorrectPart || "").slice(0, 120);
 return `${userId || "anon"}|${problemId || "run"}|${errorType}|${safeLine}|${safePart}`;
};

const recordErrorRepeat = (key) => {
 const next = (errorRepeatCounts.get(key) || 0) + 1;
 errorRepeatCounts.set(key, next);
 return next;
};

const resetProblemErrors = (userId, problemId) => {
 const prefix = `${userId || "anon"}|${problemId || "run"}|`;
 for (const key of errorRepeatCounts.keys()) {
  if (key.startsWith(prefix)) errorRepeatCounts.delete(key);
 }
};

const extractLineNumber = (stderr) => {
 const text = (stderr || "").toString();
 let match = text.match(/File\s+"[^"]*",\s+line\s+(\d+)/);
 if (match) return Number(match[1]);
 match = text.match(/:(\d+):\d+\s+error/);
 if (match) return Number(match[1]);
 match = text.match(/:(\d+):\d+:/);
 if (match) return Number(match[1]);
 match = text.match(/line\s+(\d+)/i);
 if (match) return Number(match[1]);
 return null;
};

const getLineText = (code, lineNumber) => {
 if (!lineNumber || !code) return "";
 const lines = code.split(/\r?\n/);
 return lines[lineNumber - 1] || "";
};

const extractNameError = (stderr) => {
 const match = (stderr || "").toString().match(/NameError:\s+name\s+'([^']+)' is not defined/);
 return match ? match[1] : null;
};

const isPrintTypo = (name) => {
 if (!name) return false;
 const candidates = new Set(["prnt", "pritn", "pirnt", "prnit", "prin", "pirn"]);
 if (candidates.has(name)) return true;
 // Simple distance check for 5-letter variants near "print"
 if (name.length === 5) {
  let diff = 0;
  const target = "print";
  for (let i = 0; i < 5; i++) if (name[i] !== target[i]) diff++;
  return diff === 1;
 }
 return false;
};

const buildTeacherResponse = ({ code, errorOrOutput, expectedOutput, errorType, repeatCount }) => {
 const lineNumber = errorType === "wrong_output" ? null : extractLineNumber(errorOrOutput);
 const incorrectPart = errorType === "wrong_output"
  ? "Output"
  : (getLineText(code, lineNumber) || "Unknown line");
 const missingName = errorType === "name" ? extractNameError(errorOrOutput) : null;

 const whyMap = {
  syntax: "There is a syntax mistake on this line.",
  indentation: "The indentation does not match Python block rules.",
  name: "You used a variable/function that is not defined.",
  type: "You are using incompatible types together.",
  index: "You accessed a list index that is out of range.",
  key: "You accessed a missing key in a dictionary.",
  zero: "You divided by zero.",
  value: "You tried to convert/parse a value in a wrong way.",
  eof: "Your input reading expected more data than provided.",
  import: "You imported a module or name that is not available.",
  runtime: "Your code crashed while running.",
  wrong_output: "Your program output does not match the expected output."
 };

 const why = whyMap[errorType] || "There is a mistake in the program logic.";
 const fixMap = {
  syntax: "Fix the syntax on this line (missing colon, bracket, or quotes).",
  indentation: "Align indentation to match the correct block level.",
  name: "Define the variable/function before using it or fix the name.",
  type: "Convert values to compatible types before using them together.",
  index: "Check list length and access only valid indexes.",
  key: "Use an existing dictionary key or check before access.",
  zero: "Ensure the denominator is not zero before dividing.",
  value: "Validate input and convert only when it matches the expected format.",
  eof: "Make sure input is provided for every read call.",
  import: "Use only allowed modules and correct import names.",
  runtime: "Review the error details and fix the failing line.",
  wrong_output: "Match the exact output format, order, and newlines."
 };

 const hint =
  errorType === "wrong_output"
   ? "Compare your output with expected output and fix formatting or logic."
   : "Fix the specific line shown and re-run.";

 const directFixMap = {
  syntax: "Write the correct syntax on the shown line (add missing colon/bracket/quote).",
  indentation: "Indent the line to match its block (same spaces as the block header).",
  name: missingName && isPrintTypo(missingName)
   ? `Write "print" instead of "${missingName}" on line ${lineNumber || "N/A"}.`
   : (missingName
    ? `Define "${missingName}" before using it, or fix the name on line ${lineNumber || "N/A"}.`
    : "Define the missing variable/function before using it, or fix the name."),
  type: "Convert values to the same type before using them together.",
  index: "Check list length and use a valid index only.",
  key: "Check the key exists in the dictionary before access.",
  zero: "Add a check so you never divide by zero.",
  value: "Validate input, then convert only if the format is correct.",
  eof: "Provide input for every read call or remove extra reads.",
  import: "Remove/replace the invalid import with an allowed one.",
  runtime: "Fix the failing line based on the error details.",
  wrong_output: expectedOutput
   ? `Print exactly: ${expectedOutput.replace(/\r?\n/g, "\\n")}`
   : "Print exactly the expected output."
 };

 const finalHint = (repeatCount && repeatCount >= 3)
  ? (directFixMap[errorType] || "Fix the line shown and re-run.")
  : `${hint} ${fixMap[errorType] || ""}`.trim();

 if (repeatCount && repeatCount >= 3) {
  return [
   "Line Number:",
   lineNumber ? String(lineNumber) : "N/A",
   "Hint:",
   finalHint
  ].join("\n");
 }

 return [
  "Error Type:",
  errorType === "wrong_output" ? "Wrong Output" : errorType,
  "Line Number:",
  lineNumber ? String(lineNumber) : "N/A",
  "Incorrect Part:",
  incorrectPart || "N/A",
  "Why it is wrong:",
  why,
  "Hint:",
  finalHint
 ].join("\n");
};

const analyzeWrongOutput = (actual, expected) => {
 const a = (actual || "");
 const e = (expected || "");

 if (a.trim() === e.trim() && a !== e) {
  return "Output looks correct but formatting differs (extra spaces/newlines).";
 }
 if (a === "" && e !== "") {
  return "No output produced. Did you forget to print?";
 }
 if (a !== "" && e === "") {
  return "Output should be empty. Check extra prints.";
 }
 if (a.includes("\r\n") || e.includes("\r\n")) {
  return "Line ending issue. Ensure proper newlines.";
 }
 return "Output mismatch. Check logic and edge cases.";
};

export const runPython = async (req, res) => {
 const { code, language, input, problemId } = req.body;
 const lang = normalizeLanguage(language);
 if (!lang) return res.json({ error: "Unsupported language", hint: "Please select a supported language." });
 const dir = createTempDir();
 try {
  if (problemId) {
   const problem = await Problem.findById(problemId);
   if (!problem) return res.status(404).json({ message: "Problem not found" });

   const { filePath } = writeSourceFile(lang, dir, code);
   const compiled = compileSource(lang, dir, filePath);
   if (compiled.error) {
    const analyzed = analyzeRuntimeError(compiled.error);
    const lineNumber = extractLineNumber(compiled.error);
    const incorrectPart = getLineText(code, lineNumber) || "Unknown line";
    const key = getErrorKey({
     userId: req.userId,
     problemId,
     errorType: analyzed.type,
     lineNumber,
     incorrectPart
    });
    const repeatCount = recordErrorRepeat(key);
    const hint = buildTeacherResponse({
     code,
     errorOrOutput: compiled.error,
     expectedOutput: "",
     errorType: analyzed.type,
     repeatCount
    });
    let aiHint = null;
    try {
     aiHint = await callHfAnalysis({
      code,
      errorText: compiled.error,
      expectedOutput: ""
     });
    } catch {}
    return res.json({ status: "error", message: compiled.error, hint: aiHint || hint, aiHintUsed: !!aiHint });
   }

   const hidden = parseTestcases(problem.hiddenTestcases);
   const tests = [];

   if (problem.sampleInput || problem.sampleOutput) {
    tests.push({ input: problem.sampleInput || "", output: problem.sampleOutput || "" });
   }

   if (problem.expectedOutput) {
    tests.push({ input: "", output: problem.expectedOutput });
   }

   for (const t of hidden) tests.push(t);

   if (!tests.length) {
    return res.json({ status: "wrong", message: "No testcases defined", hint: "Ask admin to add testcases." });
   }

   for (const t of tests) {
    const run = runPrepared({
     language: lang,
     dir,
     filePath,
     exePath: compiled.exePath,
     className: compiled.className,
     input: t.input
    });
    if (run.error) {
     const analyzed = analyzeRuntimeError(run.error);
     const lineNumber = extractLineNumber(run.error);
     const incorrectPart = getLineText(code, lineNumber) || "Unknown line";
     const key = getErrorKey({
      userId: req.userId,
      problemId,
      errorType: analyzed.type,
      lineNumber,
      incorrectPart
     });
     const repeatCount = recordErrorRepeat(key);
     const hint = buildTeacherResponse({
      code,
      errorOrOutput: run.error,
      expectedOutput: t.output || "",
      errorType: analyzed.type,
      repeatCount
     });
     let aiHint = null;
     try {
      aiHint = await callHfAnalysis({
       code,
       errorText: run.error,
       expectedOutput: t.output || ""
      });
     } catch {}
     return res.json({ status: "error", message: run.error, hint: aiHint || hint, aiHintUsed: !!aiHint });
    }

    const actual = normalizeOutput(run.output || "");
    const expected = normalizeOutput(t.output || "");

    if (actual !== expected) {
     const key = getErrorKey({
      userId: req.userId,
      problemId,
      errorType: "wrong_output",
      lineNumber: null,
      incorrectPart: "Output"
     });
     const repeatCount = recordErrorRepeat(key);
     const hint = buildTeacherResponse({
      code,
      errorOrOutput: actual,
      expectedOutput: expected,
      errorType: "wrong_output",
      repeatCount
     });
     let aiHint = null;
     try {
      aiHint = await callHfAnalysis({
       code,
       errorText: actual,
       expectedOutput: expected
      });
     } catch {}
     return res.json({
      status: "wrong",
      message: "Output mismatch",
      hint: aiHint || hint,
      aiHintUsed: !!aiHint,
      actual,
      expected
     });
    }
   }

   return res.json({ status: "correct", message: "Accepted" });
  }

  const { filePath } = writeSourceFile(lang, dir, code);
  const compiled = compileSource(lang, dir, filePath);
  if (compiled.error) {
   const analyzed = analyzeRuntimeError(compiled.error);
   const lineNumber = extractLineNumber(compiled.error);
   const incorrectPart = getLineText(code, lineNumber) || "Unknown line";
   const key = getErrorKey({
    userId: req.userId,
    problemId: "run",
    errorType: analyzed.type,
    lineNumber,
    incorrectPart
   });
   const repeatCount = recordErrorRepeat(key);
   const hint = buildTeacherResponse({
    code,
    errorOrOutput: compiled.error,
    expectedOutput: "",
    errorType: analyzed.type,
    repeatCount
   });
   let aiHint = null;
   try {
    aiHint = await callHfAnalysis({
     code,
     errorText: compiled.error,
     expectedOutput: ""
    });
   } catch {}
   return res.json({ error: compiled.error, hint: aiHint || hint, aiHintUsed: !!aiHint });
  }

  const run = runPrepared({
   language: lang,
   dir,
   filePath,
   exePath: compiled.exePath,
   className: compiled.className,
   input: input ?? ""
  });
  if (run.error) {
   const analyzed = analyzeRuntimeError(run.error);
   const lineNumber = extractLineNumber(run.error);
   const incorrectPart = getLineText(code, lineNumber) || "Unknown line";
   const key = getErrorKey({
    userId: req.userId,
    problemId: "run",
    errorType: analyzed.type,
    lineNumber,
    incorrectPart
   });
   const repeatCount = recordErrorRepeat(key);
   const hint = buildTeacherResponse({
    code,
    errorOrOutput: run.error,
    expectedOutput: "",
    errorType: analyzed.type,
    repeatCount
   });
   let aiHint = null;
   try {
    aiHint = await callHfAnalysis({
     code,
     errorText: run.error,
     expectedOutput: ""
    });
   } catch {}
   return res.json({ error: run.error, hint: aiHint || hint, aiHintUsed: !!aiHint });
  }

  res.json({ output: run.output || "" });
 } finally {
  cleanupDir(dir);
 }
};

export const submitSolution = async (req, res) => {
 const { problemId, code, language } = req.body;
 const lang = normalizeLanguage(language);
 if (!lang) return res.json({ status: "error", message: "Unsupported language", hint: "Please select a supported language." });

 const problem = await Problem.findById(problemId);
 if (!problem) return res.status(404).json({ message: "Problem not found" });

 const dir = createTempDir();
 const { filePath } = writeSourceFile(lang, dir, code);
 const compiled = compileSource(lang, dir, filePath);
 if (compiled.error) {
  const analyzed = analyzeRuntimeError(compiled.error);
  const lineNumber = extractLineNumber(compiled.error);
  const incorrectPart = getLineText(code, lineNumber) || "Unknown line";
  const key = getErrorKey({
   userId: req.userId,
   problemId,
   errorType: analyzed.type,
   lineNumber,
   incorrectPart
  });
  const repeatCount = recordErrorRepeat(key);
  const hint = buildTeacherResponse({
   code,
   errorOrOutput: compiled.error,
   expectedOutput: "",
   errorType: analyzed.type,
   repeatCount
  });
  cleanupDir(dir);
  let aiHint = null;
  try {
   aiHint = await callHfAnalysis({
    code,
    errorText: compiled.error,
    expectedOutput: ""
   });
  } catch {}
  return res.json({ status: "error", message: compiled.error, hint: aiHint || hint, aiHintUsed: !!aiHint });
 }

 const hidden = parseTestcases(problem.hiddenTestcases);
 const tests = [];

 if (problem.sampleInput || problem.sampleOutput) {
  tests.push({ input: problem.sampleInput || "", output: problem.sampleOutput || "" });
 }

 if (problem.expectedOutput) {
  tests.push({ input: "", output: problem.expectedOutput });
 }

 for (const t of hidden) tests.push(t);

 if (!tests.length) {
  cleanupDir(dir);
  return res.json({ status: "wrong", message: "No testcases defined", hint: "Ask admin to add testcases." });
 }

 for (const t of tests) {
  const run = runPrepared({
   language: lang,
   dir,
   filePath,
   exePath: compiled.exePath,
   className: compiled.className,
   input: t.input
  });
  if (run.error) {
   const analyzed = analyzeRuntimeError(run.error);
   const lineNumber = extractLineNumber(run.error);
   const incorrectPart = getLineText(code, lineNumber) || "Unknown line";
   const key = getErrorKey({
    userId: req.userId,
    problemId,
    errorType: analyzed.type,
    lineNumber,
    incorrectPart
   });
   const repeatCount = recordErrorRepeat(key);
   const hint = buildTeacherResponse({
    code,
    errorOrOutput: run.error,
    expectedOutput: t.output || "",
    errorType: analyzed.type,
    repeatCount
   });
   cleanupDir(dir);
   let aiHint = null;
   try {
    aiHint = await callHfAnalysis({
     code,
     errorText: run.error,
     expectedOutput: t.output || ""
    });
   } catch {}
   return res.json({ status: "error", message: run.error, hint: aiHint || hint, aiHintUsed: !!aiHint });
  }

  const actual = normalizeOutput(run.output || "");
  const expected = normalizeOutput(t.output || "");

  if (actual !== expected) {
   const key = getErrorKey({
    userId: req.userId,
    problemId,
    errorType: "wrong_output",
    lineNumber: null,
    incorrectPart: "Output"
   });
   const repeatCount = recordErrorRepeat(key);
   const hint = buildTeacherResponse({
    code,
    errorOrOutput: actual,
    expectedOutput: expected,
    errorType: "wrong_output",
    repeatCount
   });
   cleanupDir(dir);
   let aiHint = null;
   try {
    aiHint = await callHfAnalysis({
     code,
     errorText: actual,
     expectedOutput: expected
    });
   } catch {}
   return res.json({
    status: "wrong",
    message: "Output mismatch",
    hint: aiHint || hint,
    aiHintUsed: !!aiHint,
    actual,
    expected
   });
  }
 }

 cleanupDir(dir);
 resetProblemErrors(req.userId, problemId);
 return res.json({ status: "correct" });
};
