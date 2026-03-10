import express from "express";
import { studentAuth } from "../middlewares/studentAuth.js";
import { getTutorialProgress, updateTutorialProgress } from "../controllers/tutorialProgressController.js";

const router = express.Router();

router.get("/", studentAuth, getTutorialProgress);
router.post("/", studentAuth, updateTutorialProgress);

export default router;
