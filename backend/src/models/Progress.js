import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
 userId: String,
 topicId: String,
 problemId: String,
 solved: { type:Boolean, default:false }
});

export default mongoose.model("Progress",progressSchema);
