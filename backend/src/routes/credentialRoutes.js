import express from "express";
import { verifyCredentialHandler, revokeCredential } from "../controllers/credentialController.js";
import { adminAuth } from "../middlewares/adminAuth.js";

const router = express.Router();

router.get("/:id/verify", verifyCredentialHandler);
router.post("/:id/revoke", adminAuth, revokeCredential);

export default router;
