import api from "./api";

export const markSolved = (topicId)=>
 api.post("/api/progress/solve",{topicId},{
  headers:{
   Authorization:`Bearer ${localStorage.getItem("studentToken")}`
  }
 });

export const getProgress = ()=>
 api.get("/api/progress",{
  headers:{
   Authorization:`Bearer ${localStorage.getItem("studentToken")}`
  }
 });

export const getProgressSummary = ()=>
 api.get("/api/progress/summary",{
  headers:{
   Authorization:`Bearer ${localStorage.getItem("studentToken")}`
  }
 });

export const markProblemSolved = (topicId, problemId)=>
 api.post("/api/progress/solve-problem",{topicId, problemId},{
  headers:{
   Authorization:`Bearer ${localStorage.getItem("studentToken")}`
  }
 });

export const resetProgress = ()=>
 api.post("/api/progress/reset",{},{
  headers:{
   Authorization:`Bearer ${localStorage.getItem("studentToken")}`
  }
 });
