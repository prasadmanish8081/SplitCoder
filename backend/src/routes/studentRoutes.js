import express from "express";
import { register, login, getMe, updateMe, deleteMe } from "../controllers/studentController.js";
import { studentAuth } from "../middlewares/studentAuth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", studentAuth, getMe);
router.put("/me", studentAuth, updateMe);
router.delete("/me", studentAuth, deleteMe);

export default router;
