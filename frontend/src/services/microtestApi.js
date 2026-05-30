import api from "./api";

export const listMicroTests = () =>
  api.get("/api/microtests", {
    headers: { Authorization: `Bearer ${localStorage.getItem("studentToken")}` },
  });

export const getMicroTest = (id) =>
  api.get(`/api/microtests/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("studentToken")}` },
  });

export const submitMicroTest = (id, answers) =>
  api.post(`/api/microtests/${id}/submit`, { answers }, {
    headers: { Authorization: `Bearer ${localStorage.getItem("studentToken")}` },
  });

export const verifyCredential = (id) =>
  api.get(`/api/credentials/${id}/verify`);
