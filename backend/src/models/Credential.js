import mongoose from "mongoose";

const credentialSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    microTest: { type: mongoose.Schema.Types.ObjectId, ref: "MicroTest", required: true },
    issuedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    payload: Object,
    jws: String,
    revoked: { type: Boolean, default: false },
    revokedAt: Date
}, { timestamps: true });

export default mongoose.model("Credential", credentialSchema);
