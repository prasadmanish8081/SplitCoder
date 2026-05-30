import mongoose from "mongoose";

const microTestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    rubric: Object,
    passingCriteria: {
        minScore: { type: Number, default: 0 }
    },
    duration: Number,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("MicroTest", microTestSchema);
