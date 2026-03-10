import api from "./api";

const studentAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("studentToken")}`
  }
});

export const getMe = () => api.get("/api/students/me", studentAuthHeader());
export const updateMe = (data) => api.put("/api/students/me", data, studentAuthHeader());
export const deleteMe = () => api.delete("/api/students/me", studentAuthHeader());
