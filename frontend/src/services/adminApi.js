import api from "./api";

export const adminLogin = async (data) => {
    return api.post("/admin/login", data);
};

