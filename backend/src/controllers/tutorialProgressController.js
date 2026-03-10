import TutorialProgress from "../models/TutorialProgress.js";

export const getTutorialProgress = async (req, res) => {
  const userId = req.userId;
  const progress = await TutorialProgress.find({ userId });
  res.json(progress);
};

export const updateTutorialProgress = async (req, res) => {
  const userId = req.userId;
  const { tutorialId, percent, quizScore, quizPassed, solvedProblemIds } = req.body;
  if (!tutorialId) return res.status(400).json({ message: "tutorialId required" });
  const safePercent = Math.max(0, Math.min(100, Number(percent || 0)));
  const safeQuiz = quizScore === undefined || quizScore === null
    ? undefined
    : Math.max(0, Math.min(100, Number(quizScore || 0)));
  const nextSolved = Array.isArray(solvedProblemIds)
    ? solvedProblemIds.map((id) => String(id)).filter(Boolean)
    : null;

  const update = {
    $max: { percent: safePercent }
  };
  if (safeQuiz !== undefined) {
    update.$max.quizScore = safeQuiz;
  }
  if (typeof quizPassed === "boolean") {
    update.$set = { ...(update.$set || {}), quizPassed };
  }
  if (nextSolved) {
    update.$set = { ...(update.$set || {}), solvedProblemIds: nextSolved };
  }

  const doc = await TutorialProgress.findOneAndUpdate(
    { userId, tutorialId },
    update,
    { upsert: true, new: true }
  );
  res.json(doc);
};
