import express from "express";
import { studentAuth } from "../middlewares/studentAuth.js";
import { runPython, submitSolution } from "../controllers/pythonController.js";

const router = express.Router();

router.post("/run", studentAuth, runPython);
router.post("/submit", studentAuth, submitSolution);

export default router;
