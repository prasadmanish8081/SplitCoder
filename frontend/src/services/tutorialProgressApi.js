import api from "./api";

const studentAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("studentToken")}`
  }
});

export const getTutorialProgress = () =>
  api.get("/api/tutorial-progress", studentAuthHeader());

export const updateTutorialProgress = (tutorialId, payload = {}) =>
  api.post("/api/tutorial-progress", { tutorialId, ...payload }, studentAuthHeader());
