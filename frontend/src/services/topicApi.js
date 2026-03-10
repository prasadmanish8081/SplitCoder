import api from "./api";

const adminAuthHeader = () => ({
 headers:{
  Authorization:`Bearer ${localStorage.getItem("adminToken")}`
 }
});

export const getTopics = () => api.get("/api/topics");
export const addTopic = (data) => api.post("/api/topics", data, adminAuthHeader());
export const updateTopic = (id, data) => api.put(`/api/topics/${id}`, data, adminAuthHeader());
export const deleteTopic = (id) => api.delete(`/api/topics/${id}`, adminAuthHeader());
