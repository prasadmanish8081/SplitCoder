import api from "./api";

const adminAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`
  }
});

export const getTutorials = () => api.get("/api/tutorials");
export const addTutorial = (data) => api.post("/api/tutorials", data, adminAuthHeader());
export const updateTutorial = (id, data) => api.put(`/api/tutorials/${id}`, data, adminAuthHeader());
export const deleteTutorial = (id) => api.delete(`/api/tutorials/${id}`, adminAuthHeader());
