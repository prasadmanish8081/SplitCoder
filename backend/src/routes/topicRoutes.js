import express from "express";
import { adminAuth } from "../middlewares/adminAuth.js";
import { createTopic, getTopics, deleteTopic, updateTopic } from "../controllers/topicController.js";

const router = express.Router();

router.post("/", adminAuth, createTopic);
router.get("/", getTopics);
router.get("/student", getTopics);
router.put("/:id", adminAuth, updateTopic);
router.delete("/:id", adminAuth, deleteTopic);

export default router;
