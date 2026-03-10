import api from "./api";

const studentAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("studentToken")}`
  }
});

export const runPython = (code, language, input, problemId)=>
 api.post("/api/python/run", {code, language, input, problemId}, studentAuthHeader());

export const submitSolution = (problemId, code, language)=>
 api.post("/api/python/submit", {problemId, code, language}, studentAuthHeader());
