import express from "express";
import { adminLogin, getStudentsSummary } from "../controllers/adminController.js";
import { adminAuth } from "../middlewares/adminAuth.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/students", adminAuth, getStudentsSummary);

export default router;
