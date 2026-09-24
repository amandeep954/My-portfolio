import express from "express";
import { getProfileSettings, updateProfileSettings } from "../controllers/profileController.js";
import { verifyAdminToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getProfileSettings);
router.put("/", verifyAdminToken, updateProfileSettings);

export default router;
