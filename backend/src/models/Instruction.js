import mongoose from "mongoose";

const instructionSchema = new mongoose.Schema(
    {
        content: { type: String, default: "" }
    },
    { timestamps: true }
);

export default mongoose.model("Instruction", instructionSchema);
