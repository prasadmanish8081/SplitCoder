import Instruction from "../models/Instruction.js";

export const getInstruction = async (req, res) => {
    try{
        const doc = await Instruction.findOne();
        if (doc?.content) return res.json(doc);
        return res.json({
            content:
`Welcome to the course.

How to learn here:
1) Read the concept carefully.
2) Try the practice problems in order.
3) If you get a mismatch 3 times, a hint unlocks.
4) Solve it yourself before opening the solution.
5) Move to the next topic only after completing all problems.

Flow:
Instructions → Concept → Practice → Next Topic

Rules:
- Keep output format exact.
- Use only the required input/output format.
- No extra prints.`
        });
    }catch(err){
        res.status(500).json({ message: "Failed to load instructions" });
    }
};

export const updateInstruction = async (req, res) => {
    try{
        const { content } = req.body;
        const updated = await Instruction.findOneAndUpdate(
            {},
            { content: content || "" },
            { new: true, upsert: true }
        );
        res.json(updated);
    }catch(err){
        res.status(500).json({ message: "Failed to update instructions" });
    }
};
