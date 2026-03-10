import express from "express";
import { adminAuth } from "../middlewares/adminAuth.js";
import { studentAuth } from "../middlewares/studentAuth.js";
import { createProblem, getProblems, getStudentProblems, updateProblem, deleteProblem } from "../controllers/problemController.js";

const router = express.Router();

router.get("/", adminAuth, getProblems);
router.get("/student", studentAuth, getStudentProblems);
router.post("/", adminAuth, createProblem);
router.put("/:id", adminAuth, updateProblem);
router.delete("/:id", adminAuth, deleteProblem);

export default router;
