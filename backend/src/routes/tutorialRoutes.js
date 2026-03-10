import express from "express";
import { adminAuth } from "../middlewares/adminAuth.js";
import { createTutorial, deleteTutorial, getTutorials, updateTutorial } from "../controllers/tutorialController.js";

const router = express.Router();

router.get("/", getTutorials);
router.post("/", adminAuth, createTutorial);
router.put("/:id", adminAuth, updateTutorial);
router.delete("/:id", adminAuth, deleteTutorial);

export default router;
