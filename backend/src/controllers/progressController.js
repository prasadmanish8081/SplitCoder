import Progress from "../models/Progress.js";
import Problem from "../models/Problem.js";

export const markSolved = async(req,res)=>{
 const {topicId} = req.body;
 const userId = req.userId;

 await Progress.findOneAndUpdate(
  {userId,topicId},
  {solved:true},
  {upsert:true}
 );

 res.json({success:true});
};

export const getProgress = async(req,res)=>{
 const userId = req.userId;
 const progress = await Progress.find({userId});
 res.json(progress);
};

export const markProblemSolved = async (req, res) => {
 const { topicId, problemId } = req.body;
 const userId = req.userId;

 await Progress.findOneAndUpdate(
  { userId, problemId },
  { topicId, solved: true },
  { upsert: true }
 );

 const problems = await Problem.find({ topicId }).select("_id");
 const problemIds = problems.map(p => p._id.toString());

 let topicSolved = false;
 if (problemIds.length) {
  const solvedCount = await Progress.countDocuments({
   userId,
   problemId: { $in: problemIds },
   solved: true
  });

  if (solvedCount === problemIds.length) {
   await Progress.findOneAndUpdate(
    { userId, topicId, problemId: { $exists: false } },
    { solved: true },
    { upsert: true }
   );
   topicSolved = true;
  }
 }

 res.json({ success: true, topicSolved });
};

export const getProgressSummary = async (req, res) => {
 const userId = req.userId;

 const totals = await Problem.aggregate([
  { $group: { _id: "$topicId", total: { $sum: 1 } } }
 ]);

 const solved = await Progress.aggregate([
  { $match: { userId, solved: true, problemId: { $exists: true } } },
  { $group: { _id: "$topicId", solved: { $sum: 1 } } }
 ]);

 const summary = {};
 for (const t of totals) {
  summary[t._id.toString()] = { total: t.total, solved: 0 };
 }
 for (const s of solved) {
  const key = s._id?.toString?.() || s._id;
  if (!summary[key]) summary[key] = { total: 0, solved: 0 };
  summary[key].solved = s.solved;
 }

 res.json(summary);
};

export const resetProgress = async (req, res) => {
 const userId = req.userId;
 await Progress.deleteMany({ userId });
 res.json({ success: true });
};
