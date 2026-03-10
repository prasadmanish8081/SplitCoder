import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
    {
        topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
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
    },
    { timestamps: true }
);

export default mongoose.model("Problem", problemSchema);
