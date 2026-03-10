import mongoose from "mongoose";

const tutorialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String, default: "" },
    order: { type: Number, default: 0 },
    problems: [
      {
        title: { type: String, required: true },
        statement: { type: String, required: true },
        expectedOutput: { type: String, required: true },
        hint: { type: String, default: "" },
        solution: { type: String, default: "" },
        hiddenTestcases: { type: String, default: "" },
        sampleInput: { type: String, default: "" },
        sampleOutput: { type: String, default: "" },
        rulesConstraints: { type: String, default: "" },
        difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
        order: { type: Number, default: 0 }
      }
    ],
    quiz: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctIndex: { type: Number, required: true },
        explanation: { type: String, default: "" }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Tutorial", tutorialSchema);
