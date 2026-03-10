import api from "./api";

export const getStudentTopics = () =>
 api.get("/api/topics/student");
