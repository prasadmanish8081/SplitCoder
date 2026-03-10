import express from "express";
import { studentAuth } from "../middlewares/studentAuth.js";
import { getProgress, markSolved, markProblemSolved, getProgressSummary, resetProgress } from "../controllers/progressController.js";

const router = express.Router();

router.get("/", studentAuth, getProgress);
router.get("/summary", studentAuth, getProgressSummary);
router.post("/solve", studentAuth, markSolved);
router.post("/solve-problem", studentAuth, markProblemSolved);
router.post("/reset", studentAuth, resetProgress);

export default router;
