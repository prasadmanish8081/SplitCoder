import User from "../models/User.js";
import Progress from "../models/Progress.js";
import Problem from "../models/Problem.js";
import Topic from "../models/Topic.js";
import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) =>{
    const {email, password} = req.body;

    const admin = await User.findOne({email, role: "admin"});

    if(!admin || admin.password !== password)
        return res.status(401).json({message: "Invalid credentials"});

    const token = jwt.sign(
        {id:admin._id, role:"admin"},
        process.env.JWT_SECRET
    );

    res.json({token});
}

export const getStudentsSummary = async (req, res) => {
    const students = await User.find({ role: "student" }).select("-password");

    const totalProblems = await Problem.countDocuments();
    const totalTopics = await Topic.countDocuments();

    const solvedProblemsAgg = await Progress.aggregate([
        { $match: { solved: true, problemId: { $exists: true } } },
        { $group: { _id: "$userId", solvedProblems: { $sum: 1 } } }
    ]);

    const solvedTopicsAgg = await Progress.aggregate([
        { $match: { solved: true, problemId: { $exists: false }, topicId: { $exists: true } } },
        { $group: { _id: "$userId", solvedTopics: { $sum: 1 } } }
    ]);

    const solvedProblemsMap = {};
    for (const s of solvedProblemsAgg) solvedProblemsMap[s._id] = s.solvedProblems;

    const solvedTopicsMap = {};
    for (const s of solvedTopicsAgg) solvedTopicsMap[s._id] = s.solvedTopics;

    const data = students.map(s => ({
        _id: s._id,
        name: s.name || "",
        email: s.email || "",
        solvedProblems: solvedProblemsMap[s._id.toString()] || 0,
        totalProblems,
        solvedTopics: solvedTopicsMap[s._id.toString()] || 0,
        totalTopics
    }));

    res.json(data);
};
