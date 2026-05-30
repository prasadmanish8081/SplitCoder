import MicroTest from "../models/MicroTest.js";

export async function createMicroTest(req, res) {
    try {
        const { title, description, rubric, passingCriteria, duration } = req.body;
        const mt = await MicroTest.create({ title, description, rubric, passingCriteria, duration, createdBy: req.user?.id });
        res.json(mt);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export async function listMicroTests(req, res) {
    try {
        const list = await MicroTest.find().sort({ createdAt: -1 });
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export async function getMicroTest(req, res) {
    try {
        const { id } = req.params;
        const mt = await MicroTest.findById(id);
        if (!mt) return res.status(404).json({ message: "Not found" });
        res.json(mt);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
