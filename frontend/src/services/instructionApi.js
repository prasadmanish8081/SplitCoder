import api from "./api";

const adminAuthHeader = () => ({
 headers:{
  Authorization:`Bearer ${localStorage.getItem("adminToken")}`
 }
});

export const getInstruction = () => api.get("/api/instructions");
export const updateInstruction = (content) => api.put("/api/instructions", { content }, adminAuthHeader());
