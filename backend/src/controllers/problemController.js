import Problem from "../models/Problem.js";

export const createProblem = async (req, res) => {
    const problem = await Problem.create(req.body);
    res.json(problem);
};

export const getProblems = async (req, res) => {
    const filter = {};
    if (req.query.topicId) filter.topicId = req.query.topicId;

    const problems = await Problem.find(filter).sort({ order: 1, createdAt: 1 });
    res.json(problems);
};

export const getStudentProblems = async (req, res) => {
    const filter = {};
    if (req.query.topicId) filter.topicId = req.query.topicId;

    const problems = await Problem.find(filter)
        .select("-hiddenTestcases")
        .sort({ order: 1, createdAt: 1 });
    res.json(problems);
};

export const updateProblem = async (req, res) => {
    const problem = await Problem.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    res.json(problem);
};

export const deleteProblem = async (req, res) => {
    await Problem.findByIdAndDelete(req.params.id);
    res.json({ success: true });
};
