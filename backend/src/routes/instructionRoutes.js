import express from "express";
import { getInstruction, updateInstruction } from "../controllers/instructionController.js";
import { adminAuth } from "../middlewares/adminAuth.js";

const router = express.Router();

router.get("/", getInstruction);
router.put("/", adminAuth, updateInstruction);

export default router;
