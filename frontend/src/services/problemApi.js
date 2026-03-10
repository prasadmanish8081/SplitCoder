import api from "./api";

const adminAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`
  }
});

export const getProblems = (topicId) =>
  api.get(`/api/problems?topicId=${topicId}`, adminAuthHeader());

export const addProblem = (data) =>
  api.post("/api/problems", data, adminAuthHeader());

export const updateProblem = (id, data) =>
  api.put(`/api/problems/${id}`, data, adminAuthHeader());

export const deleteProblem = (id) =>
  api.delete(`/api/problems/${id}`, adminAuthHeader());
