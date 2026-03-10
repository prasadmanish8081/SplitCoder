import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
    title: String,
    concept: String,
    explanation: String,
    blocks: { type: [mongoose.Schema.Types.Mixed], default: [] },
    outline: { type: [String], default: [] },
    quickTips: { type: [String], default: [] },
    commonMistakes: { type: [String], default: [] },
    progressTopicPercent: { type: Number, default: null },
    progressProblemsSolved: { type: Number, default: null },
    progressProblemsTotal: { type: Number, default: null },
    order: Number,
    exampleCode1: String,
    exampleOutput1: String,
    exampleCode2: String,
    exampleOutput2: String,
});

export default mongoose.model("Topic", topicSchema);
