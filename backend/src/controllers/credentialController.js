import MicroTest from "../models/MicroTest.js";
import Credential from "../models/Credential.js";
import User from "../models/User.js";
import { signCredential, verifyCredential } from "../utils/credentialSigner.js";

export async function submitMicroTest(req, res) {
    try {
        const { id } = req.params;
        const { answers } = req.body;
        // prefer authenticated user id from middleware
        const userId = req.userId || req.body.userId;
        const microTest = await MicroTest.findById(id);
        if (!microTest) return res.status(404).json({ message: "MicroTest not found" });

        // Simple grading: count correct answers if rubric provides answer keys
        let score = 0;
        if (microTest.rubric && microTest.rubric.answers) {
            const keys = microTest.rubric.answers;
            const total = Object.keys(keys).length;
            let correct = 0;
            for (const q of Object.keys(keys)) {
                if (answers && answers[q] !== undefined && String(answers[q]) === String(keys[q])) correct++;
            }
            score = Math.round((correct / Math.max(total, 1)) * 100);
        }

        const passed = score >= (microTest.passingCriteria?.minScore || 0);

        let credential = null;
        if (passed) {
            const user = await User.findById(userId);
            const payload = {
                iss: process.env.APP_NAME || "MyApp",
                sub: String(userId),
                name: user?.name,
                email: user?.email,
                test: String(id),
                score,
                result: "pass",
                issuedAt: new Date().toISOString(),
                nonce: Math.random().toString(36).slice(2)
            };
            const jws = signCredential(payload);
            credential = await Credential.create({ user: userId, microTest: id, payload, jws });
        }

        return res.json({ passed, score, credentialId: credential?._id, jws: credential?.jws });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}

export async function verifyCredentialHandler(req, res) {
    try {
        const { id } = req.params;
        const cred = await Credential.findById(id).populate("user").populate("microTest");
        if (!cred) return res.status(404).json({ message: "Credential not found" });
        if (cred.revoked) return res.json({ valid: false, revoked: true });

        const check = verifyCredential(cred.jws);
        if (!check.valid) return res.json({ valid: false, error: check.error });

        return res.json({ valid: true, payload: check.decoded, revoked: cred.revoked });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export async function revokeCredential(req, res) {
    try {
        const { id } = req.params;
        const cred = await Credential.findById(id);
        if (!cred) return res.status(404).json({ message: "Credential not found" });
        cred.revoked = true;
        cred.revokedAt = new Date();
        await cred.save();
        return res.json({ revoked: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
