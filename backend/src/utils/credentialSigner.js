import jwt from "jsonwebtoken";

const SECRET = process.env.CREDENTIAL_SIGNING_KEY || "dev-signing-key";

export function signCredential(payload, expiresIn = "365d") {
    return jwt.sign(payload, SECRET, { algorithm: "HS256", expiresIn });
}

export function verifyCredential(token) {
    try {
        const decoded = jwt.verify(token, SECRET, { algorithms: ["HS256"] });
        return { valid: true, decoded };
    } catch (err) {
        return { valid: false, error: err.message };
    }
}
