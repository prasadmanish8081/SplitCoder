import api from "./api";

const adminAuthHeader = () => ({
 headers:{
  Authorization:`Bearer ${localStorage.getItem("adminToken")}`
 }
});

export const getStudentsSummary = () => api.get("/admin/students", adminAuthHeader());
