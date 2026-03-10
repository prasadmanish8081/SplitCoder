import mongoose from "mongoose";

const tutorialProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    tutorialId: { type: mongoose.Schema.Types.ObjectId, ref: "Tutorial", required: true },
    percent: { type: Number, default: 0 },
    quizScore: { type: Number, default: 0 },
    quizPassed: { type: Boolean, default: false },
    solvedProblemIds: { type: [String], default: [] }
  },
  { timestamps: true }
);

tutorialProgressSchema.index({ userId: 1, tutorialId: 1 }, { unique: true });

export default mongoose.model("TutorialProgress", tutorialProgressSchema);
