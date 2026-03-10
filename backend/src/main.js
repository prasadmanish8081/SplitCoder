import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import topicRoutes from "./routes/topicRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import pythonRoutes from "./routes/pythonRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import instructionRoutes from "./routes/instructionRoutes.js";
import tutorialRoutes from "./routes/tutorialRoutes.js";
import tutorialProgressRoutes from "./routes/tutorialProgressRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json({ limit: "10mb" }));


connectDB();

app.get("/", (req, res) => {
    res.send("Backend Running");
});


app.use("/admin", adminRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/progress",progressRoutes);
app.use("/api/python",pythonRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/instructions", instructionRoutes);
app.use("/api/tutorials", tutorialRoutes);
app.use("/api/tutorial-progress", tutorialProgressRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
