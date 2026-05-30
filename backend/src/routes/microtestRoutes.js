import express from "express";
import { createMicroTest, listMicroTests, getMicroTest } from "../controllers/microtestController.js";
import { submitMicroTest } from "../controllers/credentialController.js";
import { adminAuth } from "../middlewares/adminAuth.js";
import { studentAuth } from "../middlewares/studentAuth.js";

const router = express.Router();

router.get("/", listMicroTests);
router.post("/", adminAuth, createMicroTest);
router.get("/:id", getMicroTest);
router.post("/:id/submit", studentAuth, submitMicroTest);

export default router;
