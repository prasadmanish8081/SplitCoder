import api from "./api";

const studentAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("studentToken")}`
  }
});

export const getStudentProblems = (topicId) =>
  api.get(`/api/problems/student?topicId=${topicId}`, studentAuthHeader());

export const getAllStudentProblems = () =>
  api.get(`/api/problems/student`, studentAuthHeader());
