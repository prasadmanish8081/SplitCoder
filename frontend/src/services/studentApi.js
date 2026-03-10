import api from "./api";

export const registerStudent = (data) => api.post("/api/students/register", data);
export const loginStudent = (data) => api.post("/api/students/login", data);